import { FC } from "react";

interface layoutProps {
  children: React.ReactNode;
}

const layout: FC<layoutProps> = ({ children }) => {
  return <div className="bg-primary/20 py-10 print:py-0">{children}</div>;
};

export default layout;
