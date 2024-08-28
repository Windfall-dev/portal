import Image from "next/image";

function Nextaction() {
  return (
    <div className="relative z-0 flex h-[216px] flex-col items-center justify-end">
      <Image
        src="/windfall_icon.png"
        height="100"
        width="100"
        alt="logo"
        className="absolute top-1"
      />
      <div className="w-full space-y-1 bg-wf-yellow pb-7 pt-5 text-center">
        <h3>Riding the Post-Hackathon high</h3>
        <p className="text-body2 text-muted-foreground">
          We&apos;re relentlessly pushing forward, <br /> coding our way to
          launch day.
        </p>
      </div>
    </div>
  );
}

export default Nextaction;
