"use client";
import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
//@ts-ignore
import YouTubePlayer from "youtube-player";
import Image from "next/image";

interface Video {
  id: string;
  type: string;
  url: string;
  title: string;
  smallimg: string;
  bigImg: string;
  extractedId: string;
  active: boolean;
  upvotes: number;
  userId: string;
  haveUpvoted: boolean;
}

export default function Page({
  creatorId= "43b03ac6-b0c8-4bde-abc6-e0cdbf967eef",
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const REFRESH_INTERVAL_MS = 10000;
  const [queue, setQueue] = useState<Video[]>();
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [inputLink, setInputLink] = useState("");
  const [loading, setLoading] = useState(false);
  const videoPlayerRef = useRef<HTMLDivElement>();

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    });
    const json = await res.json();
    setQueue(
      json.streams.sort((a: any, b: any) => (a.upvotes < b.upvotes ? 1 : 1))
    );

    setCurrentVideo((video) => {
      if (video?.id === json.activeStream?.stream?.id) {
        return video;
      }
      return json.activeStream.stream;
    });
  }

  // useEffect(() => {
    // refreshStreams();
  //   const interval = setInterval(() => {
  //     refreshStreams();
  //   }, REFRESH_INTERVAL_MS);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    if (!videoPlayerRef.current) {
      return;
    }

    const player = YouTubePlayer(videoPlayerRef.current);

    player.loadVideoById(currentVideo?.extractedId);

    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
    player.playVideo();
    function eventHandler(event: any) {
      console.log(event);
      console.log(event.data);
      if (event.data === 0) {
        playNext();
      }
    }
    player.on("stateChange", eventHandler);
    return () => {
      player.destroy();
    };
  }, [currentVideo, videoPlayerRef]);

  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(
      queue
        ?.map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
                haveUpvoted: !video.haveUpvoted,
              }
            : video
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    );
    console.log(isUpvote);
    fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: id,
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/streams/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Add this header
      },
      body: JSON.stringify({
        creatorId,
        url: inputLink,
      }),
    });
    setQueue([...queue, await res.json()]);
    setLoading(false);
    setInputLink("");
  };
  return (
    <div>
      <Appbar />
      <div>this is dashboard prob</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="paste link here"
          value={inputLink}
          onChange={(e) => {
            setInputLink(e.target.value);
          }}
        />
        <button
          onClick={() => {
            fetch("/api/streams", {
              method: "POST",
              body: JSON.stringify({
                createrId: "creatorId",
                url: inputLink,
              }),
            });
          }}
        >
          Add to queue
        </button>
      </form>
      {/* <button onClick={handleVote(video.id, video.haveUpvoted?false:true)}>
        vote 
      </button> */}
    </div>
  );
}
