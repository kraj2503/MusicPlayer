import Stream from "@/components/Stream";

export default function Creator({
  params: { creatorId },
}: {
  params: {
    creatorId: string;
  };
}) {

  console.log("Here in creatro id");
  console.log(creatorId);
  return <Stream creatorId={creatorId} />;
}
