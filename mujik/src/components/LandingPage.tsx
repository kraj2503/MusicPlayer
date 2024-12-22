import {
  Youtube,
  Share2,
  ThumbsUp,
  MessageCircle,
  Users,
  Heart,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white  overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-32 h-32 relative">
            {/* Add your logo here */}
            <Image
              src="/logo.png"
              alt="Mujik Logo"
              layout="fill"
              className="rounded-full"
            />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text leading-relaxed  ">
            Muzly - Share Music Together
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl ">
            A revolutionary platform for sharing and enjoying music together.
            Create rooms, share your favorite tracks, and let the community
            decide what plays next.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose Mujik?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Share2 className="w-8 h-8" />}
              title="Real-time Music Sharing"
              description="Share your favorite tracks from YouTube"
            />
            <FeatureCard
              icon={<ThumbsUp className="w-8 h-8" />}
              title="Democratic Playback"
              description="Community votes decide the next track, ensuring everyone's favorites get played"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="Live Chat"
              description="Connect with other music lovers while enjoying tracks together"
            />
          </div>
        </div>
      </div>

      {/* New Immersive Features Section */}
      <div className="relative py-24 ">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/20 z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Experience Music Together
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 ">
            {/* Left Column */}
            <div className="space-y-12">
              <FeatureShowcase
                icon={<Users className="w-8 h-8" />}
                title="Create Your Community"
                description="Build your own music space and invite friends to join the experience"
                gradient="from-blue-500 to-purple-500"
              />
              <FeatureShowcase
                icon={<Heart className="w-8 h-8" />}
                title="Share Your Favorites"
                description="Drop your favorite tracks and let others discover your music taste"
                gradient="from-pink-500 to-orange-500"
              />
            </div>

            {/* Right Column */}
            <div className="space-y-12 lg:mt-24">
              <FeatureShowcase
                icon={<Zap className="w-8 h-8" />}
                title="Real-time Experience"
                description="Watch and listen together, synchronized perfectly across all devices"
                gradient="from-green-500 to-teal-500"
              />
              <FeatureShowcase
                icon={<MessageCircle className="w-8 h-8" />}
                title="Connect & Chat"
                description="React and chat while enjoying music with your community"
                gradient="from-purple-500 to-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="bg-gray-800/30 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-400 mb-4">
                Step {step}
              </div>
              <Image
                src={`/step${step}.png`}
                alt={`Step ${step}`}
                width={300}
                height={200}
                className="rounded-lg mb-4"
              />
              <p className="text-gray-300">{getStepDescription(step)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="bg-gray-800/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Supported Platforms</h2>
          <div className="flex justify-center items-center gap-8">
            <Youtube className="w-16 h-16 text-red-600" />
            {/* <Spotify className="w-16 h-16 text-green-500" /> */}
            {/* Add more platform icons */}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-8">Ready to Start Sharing?</h2>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full text-xl font-bold hover:opacity-90 transition-opacity">
          Create Your Room
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/30 p-6 rounded-lg text-center hover:transform hover:scale-105 transition-transform">
      <div className="flex justify-center mb-4 text-purple-400">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function FeatureShowcase({ icon, title, description, gradient }) {
  return (
    <div className="group relative">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}
      />
      <div className="bg-gray-800/40 p-8 rounded-xl backdrop-blur-sm hover:translate-y-[-4px] transition-all duration-300">
        <div
          className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${gradient} mb-4`}
        >
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-300 text-lg">{description}</p>
      </div>
    </div>
  );
}

function getStepDescription(step) {
  const steps = {
    1: "Create your music room and invite friends",
    2: "Share your favorite tracks from supported platforms",
    3: "Vote for the songs you want to hear next",
    4: "Chat and enjoy music together in real-time",
  };
  return steps[step];
}
