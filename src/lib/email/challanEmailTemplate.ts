type CompanyInfo = {
  name: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  gstin?: string;
  website?: string;
  logoUrl?: string; // optional (must be a public URL)
};

type ChallanInfo = {
  challanNumber?: string | null;
  challanDate?: string; // preformatted for email, e.g. "18 Jan 2026"
  partyName?: string | null;
  totalAmount?: string; // preformatted, e.g. "₹ 12,500"
};

export function challanEmailHtml(opts: {
  publicUrl: string;
  note?: string;
  company: CompanyInfo;
  challan: ChallanInfo;
}) {
  const { publicUrl, note, company, challan } = opts;

  const address = [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.pincode].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(", ");

  const metaLeft = [
    challan.challanNumber
      ? { label: "Challan No.", value: challan.challanNumber }
      : null,
    challan.challanDate ? { label: "Date", value: challan.challanDate } : null,
    challan.partyName ? { label: "Party", value: challan.partyName } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const metaRight = [
    challan.totalAmount ? { label: "Total", value: challan.totalAmount } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const companyLine = [
    company.phone ? `Phone: ${company.phone}` : null,
    company.email ? `Email: ${company.email}` : null,
    company.website ? `Web: ${company.website}` : null,
  ]
    .filter(Boolean)
    .join("  •  ");

  const legalLine = [company.gstin ? `GSTIN: ${company.gstin}` : null]
    .filter(Boolean)
    .join("  •  ");

  // Email-safe button styles (works in most clients)
  const buttonStyle =
    "display:inline-block;background:#111827;color:#ffffff;text-decoration:none;" +
    "padding:12px 16px;border-radius:12px;font-weight:600;font-size:14px;";

  const cardStyle =
    "background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;";

  const muted = "color:#6b7280;font-size:12px;";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td style="padding:0 16px 12px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${cardStyle}">
                <tr>
                  <td style="padding:18px 18px 14px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="width:64px;">
                          ${
                            company.logoUrl
                              ? `<img src="${company.logoUrl}" width="44" height="44" alt="${company.name}" style="display:block;border-radius:10px;" />`
                              : `<div style="width:44px;height:44px;border-radius:10px;background:#111827;color:#fff;font-weight:700;font-size:16px;line-height:44px;text-align:center;">
                                  ${
                                    company.name?.slice(0, 1).toUpperCase() ??
                                    "C"
                                  }
                                </div>`
                          }
                        </td>
                        <td valign="middle" style="padding-left:12px;">
                          <div style="font-size:16px;font-weight:700;color:#111827;">${
                            company.name
                          }</div>
                          ${
                            address
                              ? `<div style="${muted};margin-top:3px;">${address}</div>`
                              : `<div style="${muted};margin-top:3px;">Challan shared from ${company.name}</div>`
                          }
                          ${
                            companyLine
                              ? `<div style="${muted};margin-top:6px;">${companyLine}</div>`
                              : ""
                          }
                          ${
                            legalLine
                              ? `<div style="${muted};margin-top:4px;">${legalLine}</div>`
                              : ""
                          }
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Title strip -->
                <tr>
                  <td style="padding:0 18px 18px 18px;">
                    <div style="background:#111827;border-radius:14px;padding:14px 14px;">
                      <div style="color:#ffffff;font-size:14px;font-weight:700;">
                        Challan ${
                          challan.challanNumber
                            ? `#${challan.challanNumber}`
                            : ""
                        }
                      </div>
                      <div style="color:#d1d5db;font-size:12px;margin-top:4px;">
                        Please use the button below to view your challan online.
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:0 18px 18px 18px;">
                    ${
                      note
                        ? `<div style="font-size:14px;color:#111827;margin-bottom:14px;">
                            ${escapeHtml(note).replace(/\n/g, "<br/>")}
                          </div>`
                        : ""
                    }

                    <!-- Meta grid -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td valign="top" style="width:50%;padding-right:8px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef2f7;border-radius:14px;">
                            <tr>
                              <td style="padding:12px;">
                                ${metaLeft
                                  .map(
                                    (m) => `
                                      <div style="font-size:12px;color:#6b7280;">${
                                        m.label
                                      }</div>
                                      <div style="font-size:14px;color:#111827;font-weight:600;margin:2px 0 10px 0;">${escapeHtml(
                                        m.value
                                      )}</div>
                                    `
                                  )
                                  .join("")}
                              </td>
                            </tr>
                          </table>
                        </td>

                        <td valign="top" style="width:50%;padding-left:8px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef2f7;border-radius:14px;">
                            <tr>
                              <td style="padding:12px;">
                                ${
                                  metaRight.length
                                    ? metaRight
                                        .map(
                                          (m) => `
                                          <div style="font-size:12px;color:#6b7280;">${
                                            m.label
                                          }</div>
                                          <div style="font-size:18px;color:#111827;font-weight:800;margin-top:2px;">${escapeHtml(
                                            m.value
                                          )}</div>
                                        `
                                        )
                                        .join("")
                                    : `
                                    <div style="font-size:12px;color:#6b7280;">Status</div>
                                    <div style="font-size:14px;color:#111827;font-weight:600;margin-top:2px;">Shared</div>
                                  `
                                }
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align:left;margin:18px 0 8px 0;">
                      <a href="${publicUrl}" style="${buttonStyle}">View Challan</a>
                    </div>

                    <div style="${muted};margin-top:12px;">
                      If the button doesn’t work, copy and paste this link:
                    </div>
                    <div style="font-size:12px;word-break:break-all;margin-top:6px;">
                      <a href="${publicUrl}" style="color:#111827;text-decoration:underline;">${publicUrl}</a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:0 18px 18px 18px;">
                    <div style="border-top:1px solid #eef2f7;padding-top:12px;">
                      <div style="${muted}">
                        This challan was sent by <b style="color:#111827;">${
                          company.name
                        }</b>.
                        ${
                          company.phone
                            ? ` For queries, call ${company.phone}.`
                            : ""
                        }
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tiny bottom spacer -->
          <tr><td style="height:10px;"></td></tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}

// Small helper to prevent HTML injection from user-entered note/party names
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
