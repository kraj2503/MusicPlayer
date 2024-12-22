"use client";
import Stream from "@/components/Stream";
import { useSession } from "next-auth/react";
import useRedirect from "@/hooks/useRedirect";

export default function Component() {
  const session = useSession();
  useRedirect();
  try {
    if (!session.data?.user.id) {
      return <h1> Login to Continue</h1>;
    }
    return <Stream creatorId={session.data.user.id} playVideo={true} />;
  } catch (e) {
    console.error(e);
    return null;
  }
}
