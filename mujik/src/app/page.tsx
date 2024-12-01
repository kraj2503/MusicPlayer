import { Appbar } from "@/components/Appbar";
import LandingPage from "@/components/LandingPage";
import PushDash from "@/components/PushDash";


export default function Home() {
  return (
    <div className="">
    <Appbar/>
    <PushDash/>
    <LandingPage/>
    </div>
  );
}
