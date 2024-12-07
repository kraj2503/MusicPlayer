"use client";
import { Appbar } from "@/components/Appbar";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
//@ts-ignore
import YouTubePlayer from "youtube-player";
import Image from "next/image";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { urlRegex } from "@/app/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  ThumbsDown,
  Play,
  Share2,
  Axis3DIcon,
} from "lucide-react";
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
  creatorId = "43b03ac6-b0c8-4bde-abc6-e0cdbf967eef",
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const REFRESH_INTERVAL_MS = 10000;
  const [queue, setQueue] = useState<Video[]>([]);
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
      console.log(json.activeStream?.stream?.id);
      if (video?.id === json.activeStream?.stream?.id) {
        return video;
      }
      return json.activeStream.stream;
    });
  }

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!videoPlayerRef.current) {
      console.log("Faileddddd");
      return;
    }

    const player = YouTubePlayer(videoPlayerRef.current);
    console.log("player", player);
    player.loadVideoById(currentVideo?.extractedId);
    console.log(currentVideo?.extractedId);
    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.d
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
    console.log(queue);
    setLoading(false);
    setInputLink("");
  };
  return (
    <div>
      <Appbar />
      <div className=" flex justify-center">
        <div className=" ">
          <div>this is dashboard prob</div>
          <div>
            <form onSubmit={handleSubmit}>
              <input
                className="text-black p-2"
                type="text"
                placeholder="paste link here"
                value={inputLink}
                onChange={(e) => {
                  setInputLink(e.target.value);
                }}
              />
              <button
                className=" m-5 p-2 rounded-2xl bg-red-600"
                onClick={handleSubmit}
              >
                Add to queue
              </button>
            </form>
            {inputLink && inputLink.match(urlRegex) && !loading && (
              <div className="p-2 mt-10">
                <LiteYouTubeEmbed title="" id={inputLink.split("v=")[1]} />
              </div>
            )}
          </div>



          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Upcoming Songs</h2>
            {queue.length === 0 && (
              <div className="bg-gray-900 border-gray-800 w-full">
                <div className="p-4">
                  <p className="text-center py-8 text-gray-400">
                    No videos in queue
                  </p>
                </div>
              </div>
            )}
            {queue.map((video) => (
              <div key={video.id} className="bg-gray-900 border-gray-800">
                <div className="p-4 flex items-center space-x-4">
                  <img
                    src={video.smallimg}
                    alt={`Thumbnail for ${video.title}`}
                    className="w-30 h-20 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-white">{video.title}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleVote(video.id, video.haveUpvoted ? false : true)
                        }
                        className="flex items-center space-x-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                      >
                        {video.haveUpvoted ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span>{video.upvotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
