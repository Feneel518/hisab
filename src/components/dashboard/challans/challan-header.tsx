import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";
import { FC } from "react";

interface ChallanHeaderProps {
  header: {
    businessName: string;
    businessAddress: string | null;
    challanNo: string | null;
    challanDate: Date;
    businessCity: string | null;
    businessGST: string | null;
    businessEmail: string | null;
    businessPhone: string | null;
    partyName: string;
    partyAddress: string | null;
    partyCity: string | null;
    partyGST: string | null;
    partyEmail: string | null;
    partyPhone: string | null;
  };
}

const ChallanHeader: FC<ChallanHeaderProps> = ({ header }) => {
  return (
    <div className="border border-black gap-2 flex flex-col ">
      <div className="flex justify-between p-2   text-xs font-semibold">
        <h3>Mob: {header.businessPhone}</h3>
        <h3>Delievry Challan</h3>
        <h2>GST: {header.businessGST}</h2>
      </div>
      <div className="text-3xl font-black text-center">
        <h1>{header.businessName}</h1>
        {/* TODO: Business Desc */}
      </div>
      <div className="border border-x-0 border-b-0 p-1 border-black text-xs flex items-center gap-4 justify-center">
        <h2>{header.businessAddress}</h2>
        <h3>Email: {header.businessEmail}</h3>
      </div>
      <div className="border border-black  grid grid-cols-3 border-x-0 text-xl border-b-0">
        <div className="col-span-2 p-4">
          <h2>M/s. {header.partyName}</h2>
          <h2>{header.partyAddress}</h2>
        </div>
        <div className="border-l p-2  border-black text-sm">
          <h3>
            Challan No: {getFinancialYearKey(header.challanDate)}/
            {pad(Number(header.challanNo)!, 4)}
          </h3>
          <h3> Challan Date: {header.challanDate.toDateString()}</h3>
        </div>
      </div>
    </div>
  );
};

export default ChallanHeader;
