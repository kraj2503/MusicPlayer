import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";
//@ts-expect-error : Types not available
import youtubesearchapi from "youtube-search-api";
import { urlRegex } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    // console.log("data", data);

    const isYoutube = data.url.match(urlRegex);
    if (!isYoutube) {
      return NextResponse.json(
        {
          message: "Wrong Url",
        },
        {
          status: 411,
        }
      );
    }
    const extractedId = isYoutube[1]

    const res = await youtubesearchapi.GetVideoDetails(extractedId);
    // console.log("Title",yt.title);
    // console.log(res);
    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) =>
      a.width < b.width ? -1 : 1
    );

    // if (res.thumbnail && res.thumbnail.thumbnails) {
    //   thumbnail = res.thumbnail.thumbnails;
    //   console.log("Thumbnail", thumbnail);

    //   // Sort the thumbnails by width
    // }

    const bigImg =
      thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : "";
    const smallImg =
      thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : bigImg;

    const existingActiveStream = await prisma.stream.count({
      where: {
        userId: data.creatorId,
      },
    });

    if (existingActiveStream > MAX_QUEUE_LEN) {
      return NextResponse.json(
        {
          message: "Already at limit",
        },
        {
          status: 411,
        }
      );
    }
    // console.log(data.creatorId);
    const stream = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: res.title,
        bigImg: bigImg ?? "",
        smallimg: smallImg ?? "",
        addedById: data.creatorId,
      },
    });
   

    return NextResponse.json(
      {
        ...stream,
        hasUpvoted: false,
        upvotes: 1,
     
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: "Error adding Stream",
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const session = await getServerSession();
  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      }
    );
  }

  if (!creatorId) {
    return NextResponse.json(
      {
        message: "Need CreatorId",
      },
      {
        status: 411,
      }
    );
  }
  const [streams, activeStream] = await Promise.all([
    await prisma.stream.findMany({
      where: {
        userId: creatorId,
        played: false,
      },
      include: {
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: {
          where: {
            userId: user.id,
          },
        },
      },
    }),
    prisma.currentStream.findFirst({
      where: {
        userId: creatorId,
      },
      include: {
        stream: true,
      },
    }),
  ]);

  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
  });
}
