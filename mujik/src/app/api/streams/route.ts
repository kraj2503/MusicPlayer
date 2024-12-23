import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";
import { urlRegex } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
import axios from "axios";

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("session",session);
    const user = await prisma.user.findFirst({
      where: {
        email: session?.user?.email ?? "",
      },
    });
    console.log("user",user);
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

    const data = CreateStreamSchema.parse(await req.json());

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
    const extractedId = isYoutube[1];


    // console.log('searching for video',extractedId);
    const res = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${extractedId}&format=json`
    );

  //   console.log( {
  //     title: res.data.title,
  //     thumbnail: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`,
  //     thumbnailOptions: {
  //       default: `https://img.youtube.com/vi/${extractedId}/default.jpg`,
  //       medium: `https://img.youtube.com/vi/${extractedId}/mqdefault.jpg`,
  //       high: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
  //       maxRes: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`
  //     }
  //   }
  // );



  // console.log('DONE');

    // const res = await youtubesearchapi.GetVideoDetails(extractedId);
    if (user.id !== data.creatorId) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

      // const userRecentStreams = await prisma.stream.count({
      //   where: {
      //     userId: data.creatorId,
      //     addedById: user.id,
      //     createdAt: {
      //       gte: tenMinutesAgo,
      //     },
      //   },
      // });

      const duplicateSong = await prisma.stream.findFirst({
        where: {
          userId: data.creatorId,
          extractedId: extractedId,
          createdAt: {
            gte: tenMinutesAgo,
          },
        },
      });
      if (duplicateSong) {
        return NextResponse.json(
          {
            message: "This song was already added in the last 10 minutes",
          },
          {
            status: 429,
          }
        );
      }
      const streamsLastTwoMinutes = await prisma.stream.count({
        where: {
          userId: data.creatorId,
          addedById: user.id,
          createdAt: {
            gte: twoMinutesAgo,
          },
        },
      });
      if (streamsLastTwoMinutes >= 2) {
        return NextResponse.json(
          {
            message:
              "Rate limit exceeded: You can only add 2 songs per 2 minutes",
          },
          {
            status: 429,
          }
        );
      }
    }

    //     if (userRecentStreams >= 5) {
    //       return NextResponse.json({
    //           message: "Rate limit exceeded: You can only add 5 songs per 10 minutes"
    //       }, {
    //           status: 429
    //       });
    //   }
    // }
    // const thumbnails = res.thumbnail.thumbnails;
    // thumbnails.sort((a: { width: number }, b: { width: number }) =>
    //   a.width < b.width ? -1 : 1
    // );

    // if (res.thumbnail && res.thumbnail.thumbnails) {
    //   thumbnail = res.thumbnail.thumbnails;
    //   console.log("Thumbnail", thumbnail);

    //   // Sort the thumbnails by width
    // }

    // const bigImg =
    //   thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : "";
    // const smallImg =
    //   thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : bigImg;

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
        title: res.data.title,
        bigImg: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`,
        smallimg: `https://img.youtube.com/vi/${extractedId}/mqdefault.jpg`,
        addedById: user.id,
      },
    });
    await prisma.$disconnect();
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
  await prisma.$disconnect();
  return NextResponse.json({
    streams: streams.map(({ _count, ...rest }) => ({
      ...rest,
      upvotes: _count.upvotes,
      haveUpvoted: rest.upvotes.length ? true : false,
    })),
    activeStream,
  });
}
