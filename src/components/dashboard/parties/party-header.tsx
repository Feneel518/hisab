import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartyKind } from "@prisma/client/enums";
import { FC } from "react";

interface PartyHeaderProps {
  party: {
    name: string;
    kind: PartyKind;
    phone: string | null;
    email: string | null;
    gstin: string | null;
    pan: string | null;
    city: string | null;
    pincode: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    isActive: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

const PartyHeader: FC<PartyHeaderProps> = ({ party }) => {
  return (
    <Card className="rounded-2xl bg-primary">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{party.name}</CardTitle>
            <Badge variant="secondary">{party.kind}</Badge>
            <Badge variant={party.isActive ? "default" : "destructive"}>
              {party.isActive ? "Active" : "InActive"}
            </Badge>
          </div>

          {/* Add buttons later: Edit, Create Entry, Export */}
          <div className="text-sm text-muted-foreground">
            Updated: {party.updatedAt.toLocaleDateString()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <div className="text-muted-foreground">Contact</div>
          <div>Phone: {party.phone ?? "—"}</div>
          <div>Email: {party.email ?? "—"}</div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="text-muted-foreground">Tax</div>
          <div>GSTIN: {party.gstin ?? "—"}</div>
          <div>PAN: {party.pan ?? "—"}</div>
        </div>

        <div className="space-y-1 text-sm md:col-span-2">
          <div className="text-muted-foreground">Address</div>
          <div>
            {[party.addressLine1, party.addressLine2, party.city, party.pincode]
              .filter(Boolean)
              .join(", ") || "—"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartyHeader;
