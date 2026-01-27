"use client";

import { MaterialSelect } from "@/components/helpers/MaterialSelect";
import { PartySelect } from "@/components/helpers/PartySelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createChallanAction } from "@/lib/actions/challans/createChallanAction";
import { updateChallanAction } from "@/lib/actions/challans/updateChallanAction";
import { Prisma } from "@prisma/client/client";
import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";
import {
  createChallanSchema,
  createChallanSchemaRequest,
} from "@/lib/validators/challan/challanValidator";
import { materialUnitOptions } from "@/lib/validators/material/MaterialValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FC, useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type parties = {
  id: string;
  name: string;
  kind: string; // CUSTOMER / SUPPLIER etc
};

type materials = {
  id: string;
  name: string;
  unit: string;
};

type Challan = Prisma.RegisterEntryGetPayload<{
  include: {
    items: true;
  };
}>;

interface ChallanFormProps {
  parties: parties[];
  materials: materials[];
  businessId: string;
  challanNumber?: number;
  challan?: Challan;
}

const ChallanForm: FC<ChallanFormProps> = ({
  parties,
  materials,
  businessId,
  challanNumber,
  challan,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(createChallanSchema),
    defaultValues: {
      id: challan?.id ?? "",
      businessId: businessId, // set from context/session
      partyId: challan?.partyId ?? "",
      date: challan?.date ?? new Date(),
      challanNo: challan?.challanNo ?? String(challanNumber),
      vehicleNo: challan?.vehicleNo ?? "",
      purpose: challan?.purpose ?? "SALE",
      remarks: challan?.remarks ?? "",
      discountOnChallan: challan?.discountOnChallan ?? 0,
      items: challan?.items.map((it) => {
        return {
          unit: it.unit,
          quantity: it.quantity,
          rate: it.rate,
          discount: it.discount,
          amount: it.amount,
          materialId: it.materialId,
          materialName: it.materialName,
        };
      }) ?? [
        {
          unit: "PCS",
          quantity: 1,
          rate: 0,
          discount: 0,
          amount: 0,
          materialId: null,
          materialName: "",
        },
      ],
    },
  });

  const { append, fields, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const itemsWatch = useWatch({
    control: form.control,
    name: "items",
  });

  const headerDiscount = (form.watch("discountOnChallan") as number) ?? 0;

  useEffect(() => {
    if (headerDiscount === undefined) return;

    const items = form.getValues("items");
    if (!items || items.length === 0) return;

    items.forEach((_, index) => {
      form.setValue(`items.${index}.discount`, 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  }, [headerDiscount]);

  const computed = useMemo(() => {
    const totalQty = (itemsWatch ?? []).reduce(
      (s, it) => s + Number(it.quantity ?? 0),
      0,
    );
    const subTotal = (itemsWatch ?? []).reduce((s, it) => {
      const qty = Number(it.quantity ?? 0);
      const rate = Number(it.rate ?? 0);
      const disc = headerDiscount === 0 ? Number(it.discount ?? 0) : 0;
      const net = Math.max(0, rate * qty * ((100 - disc) / 100));
      return s + net;
    }, 0);

    const total = Math.max(0, subTotal * ((100 - headerDiscount) / 100));
    const discountAmt = total - subTotal;
    return { totalQty, subTotal, total, discountAmt };
  }, [itemsWatch, headerDiscount]);

  const onSubmit = (values: createChallanSchemaRequest) => {
    setIsSubmitting(true);
    setServerError(null);

    startTransition(async () => {
      const res = challan?.id
        ? await updateChallanAction(values)
        : await createChallanAction(values);

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

      toast.success(challan?.id ? "Challan Updated" : "Challan Created");
      router.push("/dashboard/challans");
    });
  };

  return (
    <div className="mx-auto w-full  md:p-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Create Challan</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="challan-form"
              onSubmit={(e) => {
                e.preventDefault();
                const submitter = (e.nativeEvent as SubmitEvent)
                  .submitter as HTMLElement | null;

                if (submitter?.getAttribute("data-modal-submit") === "true")
                  return;

                form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-6">
              {serverError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  {serverError}
                </div>
              ) : null}

              {/* Header */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="partyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party</FormLabel>
                      <FormControl>
                        <PartySelect
                          parties={parties}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="challanNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challan No</FormLabel>
                      <FormControl>
                        <Input
                          value={`${getFinancialYearKey(new Date())}-${pad(
                            challan
                              ? Number(challan.challanNo)
                              : challanNumber!,
                            4,
                          )}`}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challan Purpose</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "PURCHASE",
                            "SALE",
                            "JOBWORK",
                            "RETURN",
                            "TRANSFER",
                            "OTHER",
                          ].map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleNo"
                  render={({ field }) => (
                    <FormItem className="max-md:col-span-2">
                      <FormLabel>Vehicle No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. GJ-15-AB-1234"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional notes..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 rounded-2xl border p-4">
                  <FormField
                    control={form.control}
                    name="discountOnChallan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (on challan)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={(field.value as number) ?? 0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Qty</div>
                      <div className="font-medium">
                        {computed.totalQty.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sub Total</div>
                      <div className="font-medium">
                        {computed.subTotal.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Discount Amt</div>
                      <div className="font-medium">
                        {computed.discountAmt.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-semibold">
                        {computed.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Items</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      append({
                        materialId: null,
                        materialName: "",
                        unit: "PCS", // <-- important
                        quantity: 1,
                        rate: 0,
                        discount: 0,
                        amount: 0,
                      })
                    }>
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((f, idx) => {
                    return (
                      <div key={f.id} className="rounded-2xl border p-4">
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
                          <FormField
                            control={form.control}
                            name={`items.${idx}.materialId`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Material (optional)</FormLabel>
                                <FormControl>
                                  <MaterialSelect
                                    materials={materials}
                                    value={field.value ?? null}
                                    onSelect={(material) => {
                                      form.setValue(
                                        `items.${idx}.materialId`,
                                        material.id,
                                      );
                                      form.setValue(
                                        `items.${idx}.materialName`,
                                        "",
                                      );
                                      form.setValue(
                                        `items.${idx}.unit`,
                                        material.unit,
                                      );

                                      if (material.defaultRate) {
                                        form.setValue(
                                          `items.${idx}.rate`,
                                          material.defaultRate,
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${idx}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value!}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {materialUnitOptions.map((u) => (
                                      <SelectItem key={u} value={u}>
                                        {u}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${idx}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Qty</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    value={(field.value as number) ?? 0}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${idx}.rate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rate</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    value={(field.value as number) ?? 0}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${idx}.discount`}
                            render={({ field }) => (
                              <FormItem className="max-md:col-span-2">
                                <FormLabel>Line Disc</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    value={(field.value as number) ?? 0}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Line Amount (computed):{" "}
                            {(() => {
                              const it = itemsWatch?.[idx];
                              const qty = Number(it?.quantity ?? 0);
                              const rate = Number(it?.rate ?? 0);
                              const disc = Number(it?.discount ?? 0);
                              return Math.max(
                                0,
                                (rate * qty * (100 - disc)) / 100,
                              ).toFixed(2);
                            })()}
                          </div>

                          {idx !== 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => remove(idx)}>
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving" : challan?.id ? "Update" : "Create"}{" "}
                  Challan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallanForm;
