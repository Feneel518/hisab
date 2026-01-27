type CompanyInfo = {
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  gstin?: string;
};

type ChallanInfo = {
  challanNumber?: string | null;
  challanDate?: string; // formatted e.g. "18 Jan 2026"
  partyName?: string | null;
  totalAmount?: string; // formatted e.g. "₹ 12,500"
};

export function buildChallanWhatsAppText(opts: {
  company: CompanyInfo;
  challan: ChallanInfo;
  publicUrl: string;
  note?: string;
}) {
  const { company, challan, publicUrl, note } = opts;

  const header = `*${company.name}*`;
  const meta: string[] = [];

  if (challan.challanNumber)
    meta.push(`Challan No: *${challan.challanNumber}*`);
  if (challan.challanDate) meta.push(`Date: ${challan.challanDate}`);
  if (challan.partyName) meta.push(`Party: ${challan.partyName}`);
  if (challan.totalAmount) meta.push(`Total: *${challan.totalAmount}*`);

  const companyLineParts: string[] = [];
  if (company.phone) companyLineParts.push(`📞 ${company.phone}`);
  if (company.email) companyLineParts.push(`✉️ ${company.email}`);
  if (company.city) companyLineParts.push(company.city);
  const companyLine = companyLineParts.length
    ? companyLineParts.join("  |  ")
    : "";

  const legal = company.gstin ? `GSTIN: ${company.gstin}` : "";

  const blocks: string[] = [];
  blocks.push(header);
  if (companyLine) blocks.push(companyLine);
  if (legal) blocks.push(legal);
  blocks.push(""); // spacer
  blocks.push("*Challan Details*");
  blocks.push(...meta);
  blocks.push(""); // spacer

  if (note?.trim()) {
    blocks.push(note.trim());
    blocks.push(""); // spacer
  }

  blocks.push("View challan link:");
  blocks.push(publicUrl);

  blocks.push("");
  blocks.push("— Sent via Hisab");

  return blocks.join("\n");
}
