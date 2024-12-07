
import Stream from "@/components/Stream";

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

const creatorId = "43b03ac6-b0c8-4bde-abc6-e0cdbf967eef"

export default function Dashboard(){

        return <Stream creatorId={creatorId} />

}