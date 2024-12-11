import Stream from "@/components/Stream";

export default function Creator({ params }: { params: { creatorId: string } }) {
  const { creatorId } = params;

  if (!creatorId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Stream creatorId={creatorId} playVideo={false} />
    </div>
  );
}