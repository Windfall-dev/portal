import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground px-5 pb-[60px] pt-10">
      <div className="flex h-full flex-col items-center justify-around space-y-3">
        <Image
          src="/windfall_logo_v_mono.png"
          width={60}
          height={60}
          alt="Logo Mono"
          className="opacity-60"
        />
        <div className="text-caption text-muted-foreground">
          © 2024 Windfall. All rights reserved.
        </div>
        <Link href="https://twitter.com/windfall_verse">
          <Image src="/Button_sns_x.png" height="40" width="40" alt="twitter" />
        </Link>
      </div>
    </footer>
  );
}
