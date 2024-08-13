import Image from "next/image";
import React from "react";

interface SectionTitleProps {
  title: string;
}

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="flex flex-row items-center px-5 py-4 space-x-2">
      <Image
        src="/section_title_bar.png"
        alt="Section Title Bar"
        width={5}
        height={22}
        className="h-[22px]"
      />
      <h2>{title}</h2>
    </div>
  );
}

export default SectionTitle;
