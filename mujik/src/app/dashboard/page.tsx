"use client";
import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { useEffect } from "react";

export default function Page() {
  const REFRESH_INTERVAL_MS = 10000;

  async function refreshStreams() {
    const res = await axios.get("api/streams/me", {
      withCredentials: true, // Ensures cookies/session are sent
    });
    console.log(res);
  }

  useEffect(() => {
    refreshStreams();
    setInterval(() => {}, REFRESH_INTERVAL_MS);
  }, []);

  return (
    <div>
      <Appbar />
      <div>this is dashboard prob</div>
    </div>
  );
}
