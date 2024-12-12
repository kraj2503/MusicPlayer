"use client";
import { Appbar } from "@/components/Appbar";
import { useState, useEffect, useRef } from "react";
//@ts-expect-error : Types not available
import YouTubePlayer from "youtube-player";
import Image from "next/image";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { urlRegex } from "@/app/lib/utils";
import { ChevronUp, ChevronDown, Play } from "lucide-react";
import { useSession } from "next-auth/react";

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

interface StreamResponse {
  streams: Video[];
  activeStream: { stream: Video };
}

export default function Stream({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const REFRESH_INTERVAL_MS = 10000000;
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [inputLink, setInputLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);
  const videoPlayerRef = useRef<HTMLDivElement>();
  const { data: session } = useSession();

  const [userId, setUserId] = useState("");

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    });

    const json: StreamResponse = await res.json();
    setQueue(json.streams.sort((a, b) => (a.upvotes < b.upvotes ? 1 : -1)));

    setCurrentVideo((video) => {
      if (video?.id === json.activeStream?.stream?.id) {
        return video;
      }
      return json.activeStream.stream;
    });
  }

  useEffect(() => {
    if (session) {
      const userId = session.user?.email;

      if (userId) {
        console.log("Logged-in User ID:", userId);
        const loggedUserId = async () => {
          const response = await fetch("/api/loggedUser/", {
            method: "POST",
            body: JSON.stringify({
              Email: userId,
            }),
          });
          const data = await response.json();
          setUserId(data.id);
        };
        loggedUserId();
      }
    }
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!videoPlayerRef.current) {
      return;
    }
    const player = YouTubePlayer(videoPlayerRef.current);

    // 'loadVideoById' is queued until the player is ready to receive API calls.
    player.loadVideoById(currentVideo?.extractedId);

    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
    player.playVideo();

    function eventHandler(event: { data: number }) {
      // console.log(event);
      // console.log(event.data);
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
    // console.log(isUpvote);
    fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: id,
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputLink && inputLink.match(urlRegex)) {
      setLoading(true);
      const res = await fetch("/api/streams/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Add this header
        },
        body: JSON.stringify({
          creatorId,
          url: inputLink,
          addedby:userId
        }),
      });
      setQueue([...queue, await res.json()]);
      // console.log(queue);
      setLoading(false);
      setInputLink("");
    } else {
      alert("Invalid link");
      return;
    }
  };

  const clearQueue = async () => {
    setLoading(true);
    // console.log(loading);
    const res = await fetch("api/streams/clearQueue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Add this header
      },
      body: JSON.stringify({
        creatorId,
        url: inputLink,
      }),
    });
    setQueue(await res.json());
    // console.log(queue);
    setLoading(false);
    setInputLink("");
  };
  const playNext = async () => {
    if (queue.length > 0) {
      try {
        const data = await fetch("/api/streams/next", {
          method: "GET",
        });
        const json = await data.json();
        setCurrentVideo(json.stream);
        setQueue((q) => q.filter((x) => x.id !== json.stream?.id));
      } catch (e) {
        console.log(e);
      }
    }
    setPlayNextLoader(false);
  };

  const handleShare = () => {
    // const shareableLink  = `${window.location.hostname}/creator/${creatorId}`
    const shareableLink = `${window.location.hostname}:3000/creator/${creatorId}`;
    // console.log(shareableLink);
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        // console.log("Link copied to clipboard:", shareableLink);
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        alert("Failed to copy the link. Please try again.");
      });
  };

  return (
    <div>
      <Appbar />
{userId}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Section */}
        <div className="col-span-1">
          <div className="flex justify-center">
            <div>
              <div>this is dashboard prob</div>
              <div>
                <form onSubmit={handleSubmit}>
                  <input
                    className="text-black p-2"
                    type="text"
                    placeholder="paste link here"
                    value={inputLink}
                    onChange={(e) => setInputLink(e.target.value)}
                  />
                  <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="m-5 p-2 rounded-2xl bg-red-600"
                  >
                    {loading ? "Loading" : "Add to queue"}
                  </button>
                </form>

                {inputLink &&
                  !loading &&
                  (() => {
                    const match = inputLink.match(urlRegex);
                    if (match) {
                      const videoId = match[1];
                      return (
                        <div className="p-2 mt-10">
                          {/* {videoId} */}
                          <LiteYouTubeEmbed id={videoId} title={""} />
                        </div>
                      );
                    }
                    return null;
                  })()}

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">
                    Upcoming Songs
                  </h2>
                  {queue.length === 0 && (
                    <div className="bg-gray-900 border-gray-800 w-full">
                      <div className="p-4">
                        <p className="text-center py-8 text-gray-400">
                          No videos in queue
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <button onClick={clearQueue} disabled={loading}>
                      {loading ? "Loading" : "Clear Queue"}
                    </button>
                  </div>
                  {queue.map((video) => (
                    <div key={video.id} className="bg-gray-900 border-gray-800">
                      <div className="p-4 flex items-center space-x-4">
                        <Image
                          src={video.smallimg}
                          alt={`Thumbnail for ${video.title}`}
                          width={120} // 30 * 4 (Tailwind's default 1rem = 4px)
                          height={80} // 20 * 4
                          className="object-cover rounded"
                        />
                        <div className="flex-grow">
                          <h3 className="font-semibold text-white">
                            {video.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() =>
                                handleVote(
                                  video.id,
                                  video.haveUpvoted ? false : true
                                )
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
        </div>

        {/* Right Section */}
        <div className="col-span-1">
          <div className="ml-10 mt-24">
            <div className="flex justify-end">
              <button
                className="mt-4 mr-10 bg-red-600 p-2 rounded-lg"
                onClick={handleShare}
              >
                Share Link
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Now Playing</h2>
              <div className="bg-slate-600 w-5/6 h-auto">
                {currentVideo ? (
                  <div>
                    {playVideo ? (
                      <>
                        {/* @ts-expect-error :Types issue */}
                        <div ref={videoPlayerRef} className="w-full" />
                      </>
                    ) : (
                      <>
                        <div className="w-full h-72 object-cover rounded">
                          <Image
                            src={currentVideo.bigImg}
                            alt={`Thumbnail for ${currentVideo.title}`}
                            width={120} // 30 * 4 (Tailwind's default 1rem = 4px)
                            height={80} // 20 * 4
                            className="object-cover rounded"
                          />
                        </div>
                        <p className="mt-2 text-center font-semibold text-white">
                          {currentVideo.title}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-400">
                    No video playing
                  </p>
                )}
              </div>
              {playVideo && (
                <button
                  disabled={playNextLoader}
                  onClick={playNext}
                  className="w-96 bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <div className="flex p-2">
                    <Play className="ml-28" />{" "}
                    {playNextLoader ? "Loading..." : "Play next"}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
