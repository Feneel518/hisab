import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  FileText,
  Globe,
  HandCoins,
  Layers,
  MessageCircle,
  PackageOpen,
  Receipt,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";

// If you already have shadcn/ui, keep these imports.
// Otherwise replace with your own components / plain HTML.
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/authClient";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-200px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-[-120px] top-[120px] h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute left-[-120px] top-[240px] h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.08),transparent_35%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge
                className="rounded-full px-3 py-1 text-sm"
                variant="secondary">
                <Sparkles className="mr-1 h-4 w-4" />
                Challan → Billing, done right
              </Badge>
              <Badge
                className="rounded-full px-3 py-1 text-sm"
                variant="outline">
                Made for Indian SMEs
              </Badge>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Create challans fast. <br />
              <span className="text-primary">Convert to bills</span> in one
              click.
            </h1>

            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Hisab is a modern challan register for traders & manufacturers.
              Share challans on WhatsApp/Email, keep everything searchable, and
              generate GST-ready bills when you’re ready.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6" asChild>
                {session?.user ? (
                  <Link href="/dashboard">
                    Get started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    Get started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </Button>

              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <Link href="#demo">
                  See how it works <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Secure & reliable
              </span>
              <span className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                Save 30–60 mins/day
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Audit-friendly records
              </span>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mx-auto mt-12 max-w-5xl">
            <Card className="border-muted/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
              <CardContent className="p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                  <TrustItem
                    icon={<FileText className="h-5 w-5" />}
                    title="Challan register"
                    desc="Inward / outward entries with party, material, weight, remarks."
                  />
                  <TrustItem
                    icon={<MessageCircle className="h-5 w-5" />}
                    title="Share instantly"
                    desc="Send link via WhatsApp/Email with tracking & logs."
                  />
                  <TrustItem
                    icon={<Receipt className="h-5 w-5" />}
                    title="Bill from challan"
                    desc="Pick challans → generate bill → mark as billed."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* DEMO / SCREEN AREA */}
      <section id="demo" className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="rounded-full">
              <Wand2 className="mr-1 h-4 w-4" />
              Workflow built for speed
            </Badge>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              From entry to billing — without messy spreadsheets
            </h2>

            <p className="mt-4 text-muted-foreground">
              Hisab keeps your day-to-day register clean and future-proof.
              Search by party/material/date, keep documents consistent, and
              generate bills only when needed.
            </p>

            <div className="mt-7 space-y-3">
              <Bullet icon={<ScanLine className="h-4 w-4" />}>
                Quick creation with smart defaults (date, series, financial
                year)
              </Bullet>
              <Bullet icon={<Layers className="h-4 w-4" />}>
                Convert selected challans into a single bill
              </Bullet>
              <Bullet icon={<ShieldCheck className="h-4 w-4" />}>
                Communication logs (EMAIL/WHATSAPP) with status tracking
              </Bullet>
              <Bullet icon={<TrendingUp className="h-4 w-4" />}>
                Simple analytics: pending challans, billed totals, party-wise
                activity
              </Bullet>
            </div>

            <div className="mt-8 flex gap-3">
              <Button asChild>
                {session?.user ? (
                  <Link href="/dashboard">
                    Start using Hisab <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/sign-in">
                    Start using Hisab <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href="#pricing">Pricing</Link>
              </Button>
            </div>
          </div>

          {/* Mock “App Screenshot” */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/25 via-transparent to-emerald-500/15 blur-xl" />
            <Card className="relative overflow-hidden rounded-3xl border-muted/60">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    Hisab Dashboard
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="p-5 sm:p-6">
                    <div className="text-sm font-medium">Today</div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <MiniStat label="New challans" value="12" />
                      <MiniStat label="Pending bills" value="4" />
                      <MiniStat label="Total weight" value="3,420 kg" />
                      <MiniStat label="Parties active" value="9" />
                    </div>

                    <Separator className="my-5" />

                    <div className="text-sm font-medium">Recent challans</div>
                    <div className="mt-3 space-y-2">
                      <MiniRow
                        title="CH-2401-0091"
                        meta="Shree Traders • 480 kg"
                      />
                      <MiniRow
                        title="CH-2401-0092"
                        meta="Vapi Metals • 1200 kg"
                      />
                      <MiniRow
                        title="CH-2401-0093"
                        meta="Apex Industries • 220 kg"
                      />
                    </div>
                  </div>

                  <div className="border-t md:border-l md:border-t-0">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          Convert to bill
                        </div>
                        <Badge className="rounded-full" variant="secondary">
                          3 selected
                        </Badge>
                      </div>

                      <div className="mt-3 space-y-3">
                        <SelectLine label="Party" value="Shree Traders" />
                        <SelectLine label="Challans" value="0091, 0092, 0093" />
                        <SelectLine label="GST" value="Included (optional)" />
                      </div>

                      <div className="mt-5 grid gap-2">
                        <Button className="w-full">
                          Generate Bill <Receipt className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full">
                          Send on WhatsApp{" "}
                          <MessageCircle className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                        Tip: Keep challans as “Open” and bill them
                        weekly/monthly. Hisab maintains a clean audit trail.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="rounded-full">
              <PackageOpen className="mr-1 h-4 w-4" />
              Everything you need
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built around your actual day-to-day
            </h2>
            <p className="mt-4 text-muted-foreground">
              No “ERP overload”. Just the core flows: party, material, challan,
              communication, billing, and reporting.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Fast challan entry"
              desc="Minimal fields, smart defaults, and a clean register view."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Party & material masters"
              desc="Reusable parties/materials with units, GSTIN, PAN extraction helpers."
            />
            <FeatureCard
              icon={<MessageCircle className="h-5 w-5" />}
              title="WhatsApp + Email sharing"
              desc="Send links, track status, store communication history per challan."
            />
            <FeatureCard
              icon={<Receipt className="h-5 w-5" />}
              title="Bill from challans"
              desc="Select multiple challans, generate a bill, mark them as billed."
            />
            <FeatureCard
              icon={<HandCoins className="h-5 w-5" />}
              title="Payments-ready"
              desc="Add payment status later (UPI/bank), keep outstanding clean."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Audit-friendly"
              desc="Timestamps, status logs, and consistent numbering for FY."
            />
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="secondary" className="rounded-full">
              <Building2 className="mr-1 h-4 w-4" />
              For your business type
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Traders, manufacturers, job-work — Hisab fits.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you move material by weight, pieces, or lots — keep
              entries consistent and billing painless.
            </p>

            <div className="mt-8 space-y-4">
              <UseCase
                icon={<PackageOpen className="h-5 w-5" />}
                title="Material inward/outward"
                desc="Track movement, wastage/returns notes, and party-wise history."
              />
              <UseCase
                icon={<Receipt className="h-5 w-5" />}
                title="Weekly/monthly billing"
                desc="Keep challans open and bill in batches — clean and fast."
              />
              <UseCase
                icon={<Globe className="h-5 w-5" />}
                title="Shareable links"
                desc="Clients can view challan instantly without WhatsApp forward chaos."
              />
            </div>
          </div>

          <Card className="rounded-3xl border-muted/60">
            <CardHeader>
              <CardTitle className="text-base">
                What you’ll stop doing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <StopItem>Searching WhatsApp for old challan photos</StopItem>
              <StopItem>
                Re-entering challan data into Excel for billing
              </StopItem>
              <StopItem>
                Confusion on “which challans are already billed?”
              </StopItem>
              <StopItem>
                Manual numbering mistakes across financial years
              </StopItem>
              <StopItem>Copy-paste party details again and again</StopItem>

              <Separator className="my-4" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    Result: cleaner records, faster billing
                  </div>
                  <div>and a better client experience.</div>
                </div>
                <Button variant="outline" asChild className="sm:ml-auto">
                  {session?.user ? (
                    <Link href="/dashboard">
                      Try Hisab <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link href="/sign-in">
                      Try Hisab <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="rounded-full">
              <BadgeCheck className="mr-1 h-4 w-4" />
              Simple pricing
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Start free. Upgrade when you’re ready.
            </h2>
            <p className="mt-4 text-muted-foreground">
              MVP pricing that works for small businesses. No complicated
              per-user math.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <PricingCard
              title="Starter"
              price="₹0"
              note="For testing & small usage"
              cta="Get started"
              ctaHref="/sign-in"
              features={[
                "Challan register",
                "Party & material masters",
                "Search and filters",
                "Shareable challan link",
              ]}
              badge="Free"
            />

            <PricingCard
              highlighted
              title="Growth"
              price="₹299/mo"
              note="For daily business ops"
              cta="Start Growth"
              ctaHref="/sign-in"
              features={[
                "Everything in Starter",
                "WhatsApp + Email sending",
                "Bill from challans",
                "Basic reports",
              ]}
              badge="Most popular"
            />

            {/* <PricingCard
              title="Pro"
              price="₹999/mo"
              note="For teams & scaling"
              cta="Go Pro"
              ctaHref="/sign-in"
              features={[
                "Everything in Growth",
                "Advanced reporting & exports",
                "Custom bill formats",
                "Priority support",
                "Multi-branch (optional)",
              ]}
              badge="Best for scale"
            /> */}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Prices are placeholders — plug your actual plan gating when ready.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="rounded-full">
            <ShieldCheck className="mr-1 h-4 w-4" />
            FAQ
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Short and clear answers, like your UI.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Faq
            q="Is Hisab only for challans?"
            a="Challan is the core. Billing is layered on top — convert challans into bills when needed."
          />
          <Faq
            q="Can I send challan on WhatsApp?"
            a="Yes. Share a secure view link and (optionally) track the communication in logs."
          />
          <Faq
            q="Does it support GST billing?"
            a="You can keep GST fields and generate GST-ready bills. (Exact format depends on your bill template.)"
          />
          <Faq
            q="Can I export data?"
            a="In Growth/Pro you can add exports (PDF/Excel). Starter keeps it minimal."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-24">
        <Card className="relative overflow-hidden rounded-3xl border-muted/60">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/10" />
          <CardContent className="relative p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Ready to run your challans like a modern business?
                </h3>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Set up your business details once. Create challans daily.
                  Convert to bills when required. Keep everything searchable and
                  clean.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-6" asChild>
                  {session?.user ? (
                    <Link href="/dashboard">
                      Create your first challan{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link href="/sign-in">
                      Create your first challan{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6"
                  asChild>
                  <Link href="#pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </main>
  );
}

async function SiteHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/55">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Hisab</div>
            <div className="text-xs text-muted-foreground">
              Challan • Billing
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="#demo" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="#pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="#pricing" className="hover:text-foreground">
            FAQ
          </Link>
        </nav>

        <div className="">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                Welcome, <br />
                {session.user.name}
              </div>
              <Button asChild>
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="hidden md:inline-flex" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Hisab</div>
                <div className="text-xs text-muted-foreground">
                  Challan • Billing • Records
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A clean challan register built for Indian SMEs — fast, searchable,
              and billing-ready.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="font-medium">Product</div>
              <div className="space-y-1 text-muted-foreground">
                <Link href="#demo" className="block hover:text-foreground">
                  How it works
                </Link>
                <Link href="#pricing" className="block hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/sign-in" className="block hover:text-foreground">
                  Sign in
                </Link>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Company</div>
              <div className="space-y-1 text-muted-foreground">
                <Link href="#" className="block hover:text-foreground">
                  Terms
                </Link>
                <Link href="#" className="block hover:text-foreground">
                  Privacy
                </Link>
                <Link href="#" className="block hover:text-foreground">
                  Support
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-medium">Get updates</div>
            <div className="rounded-xl border bg-muted/10 p-4 text-sm text-muted-foreground">
              Want this landing page wired with your real data and screenshots?
              I can also add a /demo route and motion effects.
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Hisab. All rights reserved.</div>
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Built for clean records & confidence.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------------- */
/* UI Bits */
/* --------------------------------- */

function TrustItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card className="rounded-2xl border-muted/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {desc}
      </CardContent>
    </Card>
  );
}

function Bullet({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function UseCase({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-muted/10 p-4">
      <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function StopItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-6 w-6 place-items-center rounded-lg bg-foreground/5 text-foreground">
        <Check className="h-4 w-4" />
      </div>
      <div>{children}</div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  note,
  cta,
  ctaHref,
  features,
  badge,
  highlighted,
}: {
  title: string;
  price: string;
  note: string;
  cta: string;
  ctaHref: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={[
        "rounded-3xl border-muted/60",
        highlighted
          ? "relative overflow-hidden border-primary/40 bg-card"
          : "bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40",
      ].join(" ")}>
      {highlighted ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/10" />
      ) : null}

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {badge ? (
            <Badge
              variant={highlighted ? "default" : "secondary"}
              className="rounded-full">
              {badge}
            </Badge>
          ) : null}
        </div>

        <div className="mt-3">
          <div className="text-3xl font-semibold tracking-tight">{price}</div>
          <div className="mt-1 text-sm text-muted-foreground">{note}</div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          asChild>
          <Link href={ctaHref}>
            {cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Separator />

        <ul className="space-y-3 text-sm">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-muted-foreground">
              <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-md bg-primary/10 text-primary">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <Card className="rounded-2xl border-muted/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{q}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{a}</CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/10 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function MiniRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-muted/10 px-3 py-2">
      <div>
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{meta}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function SelectLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/10 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-xs font-medium">{value}</div>
    </div>
  );
}
