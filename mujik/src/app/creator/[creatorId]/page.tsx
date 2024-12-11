import Stream from "@/components/Stream";

export default async function Creator({ params }) {
  const { creatorId } = await params;
  console.log("Here in creatro id");
  console.log(creatorId);
  return <Stream creatorId={creatorId} playVideo={false} />;
}
