import Image from "next/image";

function Nextaction() {
  return (
    <div className="relative z-0 flex h-[190px] flex-col items-center justify-end">
      <Image
        src="/windfall_icon.png"
        height="100"
        width="100"
        alt="logo"
        className="absolute top-0 z-10"
      />
      <div className="absolute top-[62px] w-full space-y-1 bg-wf-yellow py-8 text-center">
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
