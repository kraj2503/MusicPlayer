import Stream from "@/components/Stream";
import { getServerSession } from "next-auth";
import { prisma } from "../lib/db";

export default async function Dashboard() {
  const session = await getServerSession();
  console.log(session);
  if (session?.user?.email) {
    // console.log(session?.user?.email);
    const res = await prisma.user.findFirst({
      where: {
        email: session?.user?.email,
      },
    });
    if (res?.id) {
      const creatorId = res?.id;

      return <Stream creatorId={creatorId} playVideo={true} />;
    }
  }
  return (
    <div>
      {/* <Appbar /> */}
      asd
    </div>
  );
}
