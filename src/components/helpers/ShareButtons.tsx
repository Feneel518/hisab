"use client";

import React, { FC } from "react";
import { Button } from "../ui/button";
import { ShareMode } from "@/lib/validators/challan/sendChallanValidator";
import ShareChallan from "./ShareChallan";

interface ShareButtonsProps {
  challanId: string;
  phone: string | null;
  email: string | null;
}

const ShareButtons: FC<ShareButtonsProps> = ({ challanId, email, phone }) => {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<ShareMode>("WHATSAPP");

  const openWith = (m: ShareMode) => {
    setMode(m);
    setOpen(true);
  };
  return (
    <div className="flex items-center justify-center gap-8 print:gap-0 print:hidden">
      <Button variant="default" onClick={() => openWith("WHATSAPP")}>
        Send WhatsApp
      </Button>
      <Button variant="default" onClick={() => openWith("EMAIL")}>
        Send Email
      </Button>
      <Button onClick={() => openWith("BOTH")}>Send Both</Button>

      <ShareChallan
        challanId={challanId}
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        email={email}
        phone={phone}
      />
    </div>
  );
};

export default ShareButtons;
