"use client";

import {
  partyCreateSchema,
  PartyCreateSchemaRequest,
} from "@/lib/validators/party/PartyValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PartyKind } from "@prisma/client";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Section } from "@/lib/helpers/Section";
import { TwoCol } from "@/lib/helpers/TwoCols";
import { normalizeEmptyStrings } from "@/lib/utils";
import { createPartyAction } from "@/lib/actions/party/createParty";
import { toast } from "sonner";

interface PartyFormProps {}

const PartyForm: FC<PartyFormProps> = (props: {
  defaultValues?: Partial<PartyCreateSchemaRequest>;
  title?: string;
  description?: string;
  ctaText?: string;
  redirectTo?: string; // where to go on success, default "/app/challans"
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(partyCreateSchema),
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      email: "",
      gstin: "",
      kind: "CUSTOMER",
      name: "",
      pan: "",
      phone: "",
      pincode: "",
    },
  });

  const onSubmit = (values: PartyCreateSchemaRequest) => {
    startTransition(async () => {
      const payload = normalizeEmptyStrings(values);

      const res = await createPartyAction(payload);

      if (!res.ok) {
        if (res.fieldErrors) {
          for (const [field, messages] of Object.entries(res.fieldErrors)) {
            if (messages?.length) {
              form.setError(field as any, {
                type: "server",
                message: messages[0],
              });
            }
          }
        }
        toast.error(res.message ?? "Failed to create party");
        return;
      }

      toast.success("Party created");
      router.push(props.redirectTo ?? "/dashboard");
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {props.title ?? "Add your first party"}
        </h2>
        <p className="text-sm text-white/70">
          {props.description ??
            "Add at least one customer so you can start creating challans."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TwoCol>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Party name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Shree Chemicals Pvt Ltd"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
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
                  <FormLabel className="text-white">Party type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as PartyKind)}>
                      <SelectTrigger className="bg-white/10 border-white/10 text-white w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PartyKind.CUSTOMER}>
                          Customer
                        </SelectItem>
                        {/* <SelectItem value={PartyKind.SUPPLIER}>
                          Supplier
                        </SelectItem> */}
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
          </TwoCol>

          <Section title="Contact (optional)">
            <TwoCol>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="10-digit mobile"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
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
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="accounts@company.com"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-200" />
                  </FormItem>
                )}
              />
            </TwoCol>
          </Section>

          <Section title="Tax IDs (optional)">
            <TwoCol>
              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">GSTIN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., 24ABCDE1234F1Z5"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50 uppercase"
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
                    <FormLabel className="text-white">PAN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., ABCDE1234F"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50 uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-rose-200" />
                  </FormItem>
                )}
              />
            </TwoCol>
          </Section>

          <Section title="Address (optional)">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Address line 1</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Street / Area"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />

            <TwoCol>
              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Address line 2</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Building / Landmark"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                      />
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
                    <FormLabel className="text-white">Pincode</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="6-digit pincode"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-200" />
                  </FormItem>
                )}
              />
            </TwoCol>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Vapi"
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-200" />
                </FormItem>
              )}
            />
          </Section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/70">
              Add more parties later (suppliers/job-workers) from the Parties
              page.
            </p>

            <Button
              type="submit"
              className="rounded-xl hover:bg-white/10"
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
    </div>
  );
};

export default PartyForm;
