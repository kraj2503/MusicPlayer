import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";

const CreateStreamSchema = z.object({
  createrId: z.string(),
  url: z
    .string()
    .refine((val) => val.includes("youtube") || val.includes("Spotify"), {
      message: "URL must be from Youtube or Spotify",
    }),
});

const urlRegex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/


export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYoutube = data.url.match(urlRegex)
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
    const stream = await prisma.stream.create({
      data: {
        userId: data.createrId,
        url: data.url,
        extractedId,
        type: "Youtube",
      },
    });
    
    return NextResponse.json(
      {
        message: "Added Stream",
        id: stream.id
      },
      {
        status: 411,
      }
    );
    
} catch (e: any) {
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
    streams
  })
}
