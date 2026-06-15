import Image from "next/image";
import Link from "next/link";

type PortfolioImageLinkProps = {
  src: string;
  href: string;
  title: string;
};

export default function PortfolioImageLink({
  src,
  href,
  title,
}: PortfolioImageLinkProps) {
  return (
    <Link href={href} className="group">
      <div className="relative aspect-square w-140 overflow-hidden">
        <Image
          src={src}
          alt=""
          width={560}
          height={560}
          className="w-auto object-cover"
        ></Image>
        <div className="bg-summer-gray text-summer-white group-hover:bg-summer-white group-hover:text-summer-gray absolute bottom-0 left-0 z-1 flex h-20 w-full items-center p-2 text-[36px] transition-colors duration-100">
          {title}
          <img className="ml-auto" src="/icons/target.svg" alt="" />
        </div>
      </div>
    </Link>
  );
}
