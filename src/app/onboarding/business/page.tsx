import BusinessForm from "@/components/business/BusinessForm";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div>
      <BusinessForm></BusinessForm>
    </div>
  );
};

export default page;
