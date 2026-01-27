import { FC } from "react";

interface ChallanFooterProps {
  businessName: string;
}

const ChallanFooter: FC<ChallanFooterProps> = ({ businessName }) => {
  return (
    <div className="border border-black flex justify-between p-4 text-sm gap-8">
      <div className=" flex flex-col gap-2">
        <h5>Received above mentioned goods in good order condition.</h5>
        <h3>Receiver's Signature ________________</h3>
      </div>
      <div className="font-black text-xl">For, {businessName}</div>
    </div>
  );
};

export default ChallanFooter;
