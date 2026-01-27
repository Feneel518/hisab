"use client";

import {
  businessCreateSchema,
  BusinessCreateSchemaRequest,
} from "@/lib/validators/business/BusinessValidator";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { createBusinessAction } from "@/lib/actions/business/createBusiness";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TwoCol } from "@/lib/helpers/TwoCols";
import { Section } from "@/lib/helpers/Section";
import { normalizeEmptyStrings } from "@/lib/utils";

interface BusinessFormProps {}

const BusinessForm: FC<BusinessFormProps> = ({}) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const form = useForm<BusinessCreateSchemaRequest>({
    resolver: zodResolver(businessCreateSchema),
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      email: "",
      gstin: "",
      name: "",
      pan: "",
      phone: "",
      pincode: "",
    },
  });

  const onSubmit = (values: BusinessCreateSchemaRequest) => {
    startTransition(async () => {
      // Normalize empties -> undefined so Prisma doesn’t store empty strings
      const payload = normalizeEmptyStrings(values);

      const res = await createBusinessAction(payload);
      if (!res.ok) {
        // Field errors
        if (res.fieldErrors) {
          for (const [field, msgs] of Object.entries(res.fieldErrors)) {
            if (msgs?.length) {
              form.setError(field as any, { message: msgs[0] });
            }
          }
        }

        // Top-level message
        toast.error(res.message);
        return;
      }

      toast.success("Business created");
      router.push("/onboarding/party");

      // If your server action redirects, nothing else needed.
      // If it returns ok:true without redirect, you can route push here.
    });
  };
  return (
    <div>
      <div className="">
        <h2 className="text-lg font-semibold">Business details</h2>
        <p className="text-sm text-white/70">
          Set up your business once. You can edit these later.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Business Info --- */}
          <Section title="Business">
            <TwoCol>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Business name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Exec Industries"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-200" />
                  </FormItem>
                )}
              />

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
            </TwoCol>

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
                        placeholder="billing@company.com"
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/50"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-200" />
                  </FormItem>
                )}
              />
            </TwoCol>
          </Section>

          {/* --- Tax --- */}
          <Section title="Tax & IDs (optional)">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/70">
              You can edit these details later from Settings.
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

export default BusinessForm;

function HelperHint() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
          <Label className="text-white">Tip</Label>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">
            Keep it minimal for faster onboarding
          </p>
          <p className="text-sm text-white/70">
            For day-1, only business name is required. GSTIN and bank details
            can be added later.
          </p>
        </div>
      </div>
    </div>
  );
}
