import { ReactNode } from "react";

export function Section({
  title,
  children,
  whiteBg = false,
}: {
  title: string;
  children: ReactNode;
  whiteBg?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p
          className={`text-sm font-semibold ${
            whiteBg ? "text-black" : "text-white"
          }`}>
          {title}
        </p>
        <div
          className={`mt-2 h-px w-full ${
            whiteBg ? "bg-muted-foreground/10" : "bg-white/10"
          }`}
        />
      </div>
      {children}
    </div>
  );
}
