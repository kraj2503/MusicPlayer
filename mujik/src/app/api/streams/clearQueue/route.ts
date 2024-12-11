import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DeleteStreamSchema = z.object({
  creatorId: z.string(),
});

export async function POST(req: NextRequest) {
  const data = DeleteStreamSchema.parse(await req.json());
  console.log("Clearing queue for the id ", data);
  await prisma.stream.deleteMany({
    where: {
      userId: data.creatorId,
    },
  });
  console.log("Clear step 2 done");

  return NextResponse.json([]);
}
