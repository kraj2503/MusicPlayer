import Stream from "@/components/Stream";
import { Metadata } from 'next';

export default async function Creator(
  props: { 
    params: { 
      creatorId: string 
    } 
  }
) {
  const creatorId =  props.params.creatorId;

  if (!creatorId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Stream creatorId={creatorId} playVideo={false} />
    </div>
  );
}

export async function generateMetadata(
  props: { 
    params: { 
      creatorId: string 
    } 
  }
): Promise<Metadata> {
  const creatorId = props.params.creatorId;

  return {
    title: `Creator ${creatorId}`,
    description: `Page for creator ${creatorId}`
  };
}