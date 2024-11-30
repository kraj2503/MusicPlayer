import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";

//@ts-ignore
import youtubesearchapi from "youtube-search-api";
const CreateStreamSchema = z.object({
  createrId: z.string(),
  url: z
    .string()
    .refine((val) => val.includes("youtube") || val.includes("Spotify"), {
      message: "URL must be from Youtube or Spotify",
    }),
});

const urlRegex =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export async function POST(req: NextRequest) {
  try {
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
    const extractedId = data.url.split("?v=")[1];

    const res = await youtubesearchapi.GetVideoDetails(extractedId);
    // console.log("Title",yt.title);
    console.log(res);
    let thumbnail = [];
    if (res.thumbnail && res.thumbnail.thumbnails) {
      thumbnail = res.thumbnail.thumbnails;
      console.log("Thumbnail", thumbnail);

      // Sort the thumbnails by width
      thumbnail.sort((a: { width: number }, b: { width: number }) =>
        a.width < b.width ? -1 : 1
      );
    }

    const bigImg =
      thumbnail.length > 0 ? thumbnail[thumbnail.length - 1].url : "";
    const smallImg =
      thumbnail.length > 1 ? thumbnail[thumbnail.length - 2].url : bigImg;

    const stream = await prisma.stream.create({
      data: {
        userId: data.createrId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: res.title,
        bigImg: bigImg,
        smallimg: smallImg,
      },
    });

    return NextResponse.json(
      {
        message: "Added Stream",
        id: stream.id,
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: "Error parsing url",
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const createrId = req.nextUrl.searchParams.get("createrId");
  const streams = await prisma.stream.findMany({
    where: {
      userId: createrId ?? "",
    },
  });

  return NextResponse.json({
    streams,
  });
}
