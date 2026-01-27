import PartyForm from "@/components/party/PartyForm";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <PartyForm></PartyForm>
    </div>
  );
};

export default page;
