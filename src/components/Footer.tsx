import Image from "next/image";

export function Footer() {
  return (
    <footer className="h-[166px] bg-foreground px-5 py-10">
      <div className="flex flex-col items-center justify-around m-3 h-full">
        <Image
          src="/windfall_logo_v_mono.png"
          width={60}
          height={60}
          alt="Logo Mono"
          className="opacity-60"
        />
        <div className="caption">
          © 2024 Solana Foundation. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
