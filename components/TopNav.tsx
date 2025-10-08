"use client";
import Image from "next/image";
import Link from "next/link";

export default function TopNav() {
  return (
    <header className="flex items-center gap-5 px-6 py-4 border-l border-white bg-black">
      <Link href="/" className="text-xl font-bold text-black">
        <div className="flex items-center gap-">
          <Image
            alt="traycer-icon"
            src={
              "https://framerusercontent.com/images/u6E7eUPU0IyjBI6mNqDorZYJc.svg?scale-down-to=512&width=1199&height=276"
            }
            width={100}
            height={100}
          /> 
          <h2 className="text-white font-bold text-xl pl-2 pb-1"> Lite</h2>
        </div>
      </Link>
    </header>
  );
}
