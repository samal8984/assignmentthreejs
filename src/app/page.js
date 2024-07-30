import Scene from "@/components";
import dynamic from "next/dynamic";

const Dyndamiccomponent = dynamic(() => import ('@/components/index'),{
  ssr: false
})


export default function Home() {
  return(
    <Dyndamiccomponent/>
  );
}
