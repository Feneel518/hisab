"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  partyCreateSchema,
  PartyCreateSchemaRequest,
} from "@/lib/validators/party/PartyValidator";
import { createPartyAction } from "@/lib/actions/party/createParty";
import { updateParty } from "@/lib/actions/party/updateParty";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TwoCol } from "@/lib/helpers/TwoCols";
// import { PartyKind } from "@/lib/generated/prisma/enums";
import { Section } from "@/lib/helpers/Section";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { PartyKind } from "@/lib/generated/prisma/enums";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";

type Props = {
  trigger: React.ReactNode;
  initial?: Partial<PartyCreateSchemaRequest>; // pass to edit
};

export default function PartyDialog({ trigger, initial }: Props) {
  const router = useRouter();
  const isPhone = useMediaQuery("(max-width: 639px)"); // <640px => Drawer
  const [open, setOpen] = React.useState(false);
  const [isPending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(partyCreateSchema),
    defaultValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      kind: (initial?.kind as any) ?? "CUSTOMER",
      phone: initial?.phone ?? "",
      gstin: initial?.gstin ?? "",
      email: initial?.email ?? "",
      pan: initial?.pan ?? "",
      city: initial?.city ?? "",
      addressLine1: initial?.addressLine1 ?? "",
      addressLine2: initial?.addressLine2 ?? "",
      pincode: initial?.pincode ?? "",
    },
  });

  async function onSubmit(values: PartyCreateSchemaRequest) {
    setPending(true);
    setFormError(null);

    const res = values.id
      ? await updateParty(values)
      : await createPartyAction(values);

    if (!res.ok) {
      setFormError(res.message as string);
      // Optional: map fieldErrors to RHF manually if you want per-field messages
      setPending(false);
      return;
    }
    router.refresh();
    setPending(false);
    setOpen(false);
    form.reset(); // for create
  }

  const Title = initial?.id ? "Edit Party" : "Create Party";
  const Body = (
    <Form {...form}>
      <form
        id="party-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation(); // IMPORTANT
          form.handleSubmit(onSubmit)();
        }}
        className="space-y-6">
        {formError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
            {formError}
          </div>
        ) : null}

        <TwoColGrid>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Shree Chemicals Pvt Ltd"
                  />
                </FormControl>
                <FormMessage className="text-rose-200" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Party type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as PartyKind)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PartyKind.CUSTOMER}>
                        Customer
                      </SelectItem>
                      <SelectItem value={PartyKind.SUPPLIER}>
                        Supplier
                      </SelectItem>
                      <SelectItem value={PartyKind.JOBWORKER}>
                        Job-worker
                      </SelectItem>
                      <SelectItem value={PartyKind.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-rose-200" />
              </FormItem>
            )}
          />
        </TwoColGrid>

        <Section whiteBg title="Contact (optional)">
          <TwoColGrid>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      placeholder="10-digit mobile"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="accounts@company.com" />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />
          </TwoColGrid>
        </Section>

        <Section whiteBg title="Tax IDs (optional)">
          <TwoColGrid>
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 24ABCDE1234F1Z5"
                      className="uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., ABCDE1234F"
                      className="uppercase"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />
          </TwoColGrid>
        </Section>

        <Section whiteBg title="Address (optional)">
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 1</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} placeholder="Street / Area" />
                </FormControl>
                <FormMessage className="text-rose-200" />
              </FormItem>
            )}
          />

          <TwoColGrid>
            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address line 2</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Building / Landmark" />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      placeholder="6-digit pincode"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />
          </TwoColGrid>

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Vapi" />
                </FormControl>
                <FormMessage className="text-rose-200" />
              </FormItem>
            )}
          />
        </Section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            form="party-form"
            type="submit"
            className="rounded-xl"
            data-modal-submit="true"
            disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
  if (isPhone) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>

        <DrawerContent className="max-h-[92dvh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{Title}</DrawerTitle>
          </DrawerHeader>

          {/* scrollable body */}
          <div className="overflow-y-auto px-4 pb-6">{Body}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  // NON-PHONE => Dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="
          w-[calc(100vw-2rem)]
          sm:max-w-[760px]
          max-h-[85dvh]
          overflow-y-auto
        ">
        <DialogHeader className="pr-6">
          <DialogTitle>{Title}</DialogTitle>
        </DialogHeader>

        {Body}
      </DialogContent>
    </Dialog>
  );
}

function TwoColGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  );
}
