"use client";
import LandingPage from "@/components/LandingPage";
import useRedirect from "@/hooks/useRedirect";



export default function Home() {
  useRedirect();
  return (
    <div className="">
    <LandingPage/>
    </div>
  );
}
