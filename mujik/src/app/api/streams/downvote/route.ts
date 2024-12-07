import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/db";

const upvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  // db call remove

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "unauthorised",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const data = upvoteSchema.parse(await req.json());
    await prisma.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: data.streamId,
        },
      },
    });
    return NextResponse.json(
      {
        message: "Down voted",
      },
      {
        status: 200,
      }
    );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json(
      {
        message: "cannot upvote",
      },
      {
        status: 411,
      }
    );
  }
}
