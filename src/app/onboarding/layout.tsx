import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpenCheck,
  Building2,
  FileText,
  FileTextIcon,
  Globe,
  HelpCircle,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Drop this into: app/(auth)/layout.tsx  OR  app/onboarding/layout.tsx
 * It renders a left info panel + right content panel (responsive like your Stylaa layout).
 */
const layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-dvh w-full bg-background">
      {/* Outer frame */}
      <div
        className={cn(
          "flex min-h-[calc(100dvh)] overflow-hidden bg-card shadow-sm"
        )}>
        <div className="flex w-full flex-col-reverse lg:flex-row">
          {/* Left panel */}
          <aside className="w-full border-b row p-6 lg:w-[380px] lg:border-b-0 lg:border-r lg:p-7 flex flex-col justify-between max-lg:mt-8">
            <div>
              {/* Brand */}
              <div className="flex items-center gap-3 max-lg:hidden">
                <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <FileTextIcon className="size-5" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm text-muted-foreground">Hisab</p>
                  <p className="text-base font-semibold">Challan & Billing</p>
                </div>
              </div>

              {/* Value bullets */}
              <div className="mt-6 space-y-3">
                <Bullet
                  icon={<Timer className="size-4" />}
                  title="Fast daily challan entry"
                  desc="Make dispatch entries in under 10 seconds."
                />
                <Bullet
                  icon={<BookOpenCheck className="size-4" />}
                  title="Register-style reports"
                  desc="Filter by party/date and export anytime."
                />
                <Bullet
                  icon={<FileText className="size-4" />}
                  title="Monthly single bill workflow"
                  desc="Select unbilled challans and generate one bill reference."
                />
                <Bullet
                  icon={<ShieldCheck className="size-4" />}
                  title="Dispute-proof history"
                  desc="Vehicle no, challan no, remarks — always searchable."
                />
              </div>

              {/* Support cards */}
              <div className="mt-7 space-y-5">
                <PanelItem
                  icon={<Mail className="size-4" />}
                  title="Support"
                  desc={
                    <>
                      We respond during business hours.
                      <br />
                      <a
                        className="text-sm font-medium underline underline-offset-4"
                        href="mailto:support@hisab.app">
                        support@hisab.app
                      </a>
                    </>
                  }
                />

                <PanelItem
                  icon={<MapPin className="size-4" />}
                  title="Built for Gujarat"
                  desc={
                    <>
                      Challan-first workflow
                      <br />
                      Vapi · Ankleshwar · Surat
                    </>
                  }
                />

                <PanelItem
                  icon={<Phone className="size-4" />}
                  title="Call / WhatsApp"
                  desc={
                    <>
                      Mon–Sat · 10:00 AM to 7:00 PM
                      <br />
                      <span className="text-sm font-medium">
                        +91 XXXXX XXXXX
                      </span>
                    </>
                  }
                />
              </div>

              {/* Social */}
              <div className="mt-8">
                <div className="flex items-center gap-2">
                  <IconLink href="#" label="Website">
                    <Globe className="size-4" />
                  </IconLink>
                  <IconLink href="#" label="Instagram">
                    <Instagram className="size-4" />
                  </IconLink>
                  <IconLink href="#" label="LinkedIn">
                    <Linkedin className="size-4" />
                  </IconLink>
                  <IconLink href="/help" label="Help">
                    <HelpCircle className="size-4" />
                  </IconLink>
                </div>
              </div>
            </div>

            {/* Bottom promo */}
            <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">For factories & traders</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep challan records clean. Create one bill at month-end. Stop
                searching old books.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/pricing">View pricing</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl">
                  <Link href="/demo">Request demo</Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Right panel */}
          <main className="flex-1 p-3 sm:p-6 lg:p-7">
            <div className="flex items-center justify-center py-4 gap-3 lg:hidden w-full">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <FileTextIcon className="size-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm text-muted-foreground">Hisab</p>
                <p className="text-base font-semibold">Challan & Billing</p>
              </div>
            </div>
            <div className="h-full rounded-3xl bg-primary p-5 sm:p-8 text-primary-foreground flex flex-col justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="max-w-2xl">
                  <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                    Manage your <span className="text-amber-300">challans</span>{" "}
                    like a system.
                    <br className="hidden sm:block" />
                    Monthly billing becomes effortless.
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed/80 sm:text-base">
                    Daily dispatch challans, party-wise history, and one
                    consolidated bill at month-end — without full ERP
                    complexity.
                  </p>

                  {/* Feature chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip icon={<Receipt className="size-3.5" />}>
                      Challan Register
                    </Chip>
                    <Chip icon={<Wallet className="size-3.5" />}>
                      Unbilled → Billed
                    </Chip>
                    <Chip icon={<Building2 className="size-3.5" />}>
                      Party-wise
                    </Chip>
                    <Chip icon={<ShieldCheck className="size-3.5" />}>
                      Audit-ready
                    </Chip>
                  </div>
                </div>

                {/* Content slot */}
                <div className="mt-6 sm:mt-8">
                  <div className="rounded-2xl bg-white/5 p-4 sm:p-6 text-white shadow-sm">
                    {children}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <p>© {new Date().getFullYear()} Hisab</p>
                <div className="flex gap-3">
                  <Link className="underline underline-offset-4" href="/terms">
                    Terms
                  </Link>
                  <Link
                    className="underline underline-offset-4"
                    href="/privacy">
                    Privacy
                  </Link>
                  <Link className="underline underline-offset-4" href="/help">
                    Help
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default layout;

/* ---------- Small components ---------- */

function PanelItem({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl border bg-background text-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Bullet({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-background/50 p-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="grid size-9 place-items-center rounded-xl border bg-background text-foreground transition hover:bg-muted">
      {children}
    </a>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white">
      <span className="opacity-90">{icon}</span>
      {children}
    </span>
  );
}
