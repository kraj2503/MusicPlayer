"use client";
import { useState, useEffect, useRef } from "react";
import YouTubePlayer from "youtube-player";
import Image from "next/image";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { urlRegex } from "@/app/lib/utils";
import { ChevronUp, SkipForward, Equal } from "lucide-react";
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
  const videoPlayerRef = useRef<HTMLDivElement | null>(null);
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
          addedby: userId,
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
    <div className="stream-container">
      <div className="bg-gray-900 min-h-screen text-white overflow-hidden">
        <div className="grid grid-cols-12">
          {/* Left Section (Now Playing) */}
          <div className="col-span-9 border-r border-gray-700 custom-scrollbar max-h-screen overflow-y-auto pb-20">
            <div className="flex pl-10 w-full">
              <div className="w-full">
                <div className="p-3 mt-5">
                  <div className="flex items-center">
                    <form
                      onSubmit={handleSubmit}
                      className="w-full flex items-center mr-5 space-x-4"
                    >
                      <input
                        className="w-full text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-green-500 bg-gray-800 placeholder-gray-400 placeholder-opacity-75 transition-all duration-300"
                        type="text"
                        placeholder="Paste YouTube link here"
                        value={inputLink}
                        onChange={(e) => setInputLink(e.target.value)}
                      />
                      <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white rounded-lg font-semibold whitespace-nowrap transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Loading" : "Add to Queue"}
                      </button>
                    </form>
                    <button
                      className="font-semibold flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white rounded-lg  whitespace-nowrap transition-all duration-300"
                      onClick={handleShare}
                    >
                      Share Link
                    </button>
                  </div>
                  {inputLink &&
                    !loading &&
                    (() => {
                      const match = inputLink.match(urlRegex);
                      if (match) {
                        const videoId = match[1];
                        return (
                          <div className="flex items-center justify-center mt-3">
                            <div className="spcae-y-3 mt-3 w-3/6 ">
                              <div className="text-center text-white font-semibold text-lg">
                                Video Thumbnail
                              </div>
                              <LiteYouTubeEmbed id={videoId} title={""} />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  {/* Now Playing Section */}
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        Now Playing
                      </h2>
                      {playVideo && (
                        <button
                          disabled={playNextLoader}
                          onClick={playNext}
                          className=" text-white font-semibold flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 rounded-lg  transition-all duration-300"
                        >
                          <SkipForward className="w-5 h-5" />
                          {playNextLoader ? "Loading..." : "Play Next"}
                        </button>
                      )}
                    </div>

                    {/* Video Player Container */}
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      {currentVideo ? (
                        <div>
                          {playVideo ? (
                            <div
                              ref={videoPlayerRef}
                              className="w-full h-full  aspect-video object-cover"
                            />
                          ) : (
                            <div className="space-y-4 p-4">
                              <div className="w-full min-h-[480px] aspect-video object-cover rounded-lg overflow-hidden">
                                <Image
                                  src={currentVideo.bigImg}
                                  alt={`Thumbnail for ${currentVideo.title}`}
                                  width={480}
                                  height={320}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-center font-semibold text-white text-lg">
                                {currentVideo.title}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="min-h-[480px] flex items-center justify-center">
                          <p className="text-gray-400 text-lg">
                            No video playing
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section (Upcoming Songs) */}
          <div className="col-span-3 h-screen custom-scrollbar overflow-y-auto bg-gray-900 p-5 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white mb-4">Upcoming</h2>
              <div className="flex justify-end mb-4">
                <button
                  onClick={clearQueue}
                  disabled={loading}
                  className="font-semibold flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-green-700
                hover:from-green-700 hover:to-green-800 rounded-lg  transition-all duration-300"
                >
                  {loading ? "Loading" : "Clear Queue"}
                </button>
              </div>
            </div>
            {queue.length === 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-center text-gray-400 py-4">
                  No videos in queue
                </p>
              </div>
            )}
            {queue.map((video) => (
              <div
                key={video.id}
                className=" mb-3 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={video.smallimg}
                      alt={`Thumbnail for ${video.title}`}
                      width={120}
                      height={80}
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-white line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleVote(video.id, video.haveUpvoted ? false : true)
                        }
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                          video.haveUpvoted
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                      >
                        {video.haveUpvoted ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <Equal className="h-4 w-4" />
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
