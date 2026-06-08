import ParallaxImageScene from "@/component/ParallaxImageScene";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const imageSrc = `/pic/bg${slug}.png`;

  return <ParallaxImageScene src={imageSrc}></ParallaxImageScene>;
}
