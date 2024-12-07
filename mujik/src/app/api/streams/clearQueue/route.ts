import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequestHint } from "next/dist/server/web/adapter";
import { NextResponse } from "next/server";
import { z } from "zod";

const DeleteStreamSchema = z.object({
  creatorId: z.string(),
});

export async function POST(req: NextRequest) {
  const data = DeleteStreamSchema.parse(await req.json());
  console.log("Clearing queue for the id ", data);
  await prisma.upvote.deleteMany({
    where: {
      userId: data.creatorId,
    },
  });
  await prisma.stream.deleteMany({
    where: {
      userId: data.creatorId,
    },
  });

  return NextResponse.json([]);
}
