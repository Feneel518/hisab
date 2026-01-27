import { FC } from "react";

import { cn } from "@/lib/utils";
import FitContent from "./FitContent";
import Image from "next/image";

interface A4PageProps {
  table: React.ReactNode;
  heading: React.ReactNode;
  footer: React.ReactNode;
  onResize: () => void;
  additionalNotes?: string;
  className?: string;
  showLogo?: boolean;
  cancelled?: boolean;
}

const A4Page: FC<A4PageProps> = ({
  table,
  heading,
  footer,
  onResize,
  additionalNotes,
  className,
  showLogo,
  cancelled,
}) => {
  // w-[210mm] h-[297mm]
  return (
    <div
      className={cn(
        " w-screen max-w-[210mm] min-h-[297mm] relative  print:mx-0 print:size-[A4] bg-white text-black shadow-[rgba(0,_0,_0,_0.4)_0px_30px_90px] flex flex-col font-normal p-4 ",
        className
      )}>
      {showLogo && !cancelled && (
        <div className="absolute flex items-center justify-center  inset-0 pt-80">
          <div className="relative size-[600px] opacity-5">
            <Image
              src={"/fullLogo.png"}
              alt="EXEC Logo"
              fill
              className="object-contain"></Image>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="absolute flex items-center justify-center  inset-0 pt-20">
          <div className="relative text-9xl -rotate-45 opacity-5">
            CANCELLED
          </div>
        </div>
      )}
      <div className="">{heading}</div>

      <div className="flex-1 relative ">
        <FitContent onResize={onResize}>{table}</FitContent>
        {additionalNotes && (
          <div className="font-bold">Notes: {additionalNotes}</div>
        )}
      </div>
      <div className="">{footer}</div>
    </div>
  );
};

export default A4Page;
