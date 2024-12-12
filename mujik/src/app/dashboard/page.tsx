import Stream from "@/components/Stream";
import { getServerSession } from "next-auth";
import { prisma } from "../lib/db";
import { Appbar } from "@/components/Appbar";

export default async function Dashboard() {
  const session = await getServerSession();
  if (session?.user?.email) {
    // console.log(session?.user?.email);
    const res = await prisma.user.findFirst({
      where: {
        email: session?.user?.email,
      },
    });

    if (res?.id) {
      const creatorId = res?.id;
      // console.log(res);

      // console.log(id)
      return <Stream creatorId={creatorId} playVideo={true} />;
    }
  }
  return (
    <div>
      <Appbar />
      Login
    </div>
  );
}
