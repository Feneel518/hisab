"use client";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { finalizeBillAction } from "@/lib/actions/bills/finalizeBillAction";
import { getUnbilledChallansForPartyAction } from "@/lib/actions/bills/getUnbilledChallansForPartyAction";
import { PartyKind } from "@/lib/generated/prisma/browser";
import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";
import { cn } from "@/lib/utils";
import {
  createBillSchema,
  createBillSchemaRequest,
} from "@/lib/validators/bill/createBillValidator";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Party } from "@prisma/client";
import { FC, useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { DatePicker } from "@/components/helpers/DatePicker";
import { DateRangePicker } from "@/components/helpers/DateRangePicker";
import { DateRange } from "react-day-picker";

interface BillFormProps {
  parties: { name: string; id: string; kind: PartyKind }[];
  businessId: string;
  billNumber?: number; // if you want to show FY + padded number like challan
}

type UnbilledChallan = {
  id: string;
  challanNo: string | null;
  date: string; // ISO
  vehicleNo: string | null;
  purpose: string;
  totalAmount: number | null;
  items: Array<{
    id: string;
    material: {
      name: string;
      unit: string | null;
    };
    quantity: number;
    rate: number | null;
    discount: number | null;
    amount: number | null;
  }>;
};

const BillForm: FC<BillFormProps> = ({ businessId, parties, billNumber }) => {
  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [loadingChallans, setLoadingChallans] = useState(false);
  const [unbilledChallans, setUnbilledChallans] = useState<UnbilledChallan[]>(
    [],
  );

  const form = useForm({
    resolver: zodResolver(createBillSchema),
    defaultValues: {
      businessId,
      partyId: "",
      billDate: new Date(),
      billNo: billNumber ? String(billNumber) : "",

      periodStart: undefined,
      periodEnd: undefined,

      notes: "",

      selectedChallanIds: [],

      // editor rows = flattened “bill lines” referencing challan item ids
      lines: [],
    },
  });

  const selectedIds = useWatch({
    control: form.control,
    name: "selectedChallanIds",
  });

  const partyId = useWatch({
    control: form.control,
    name: "partyId",
  });

  const { fields: lineFields, replace: replaceLines } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const linesWatch = useWatch({ control: form.control, name: "lines" });

  // 1) Load unbilled challans when party changes
  useEffect(() => {
    if (!partyId) {
      setUnbilledChallans([]);
      form.setValue("selectedChallanIds", []);
      replaceLines([]);
      return;
    }

    setLoadingChallans(true);
    startTransition(async () => {
      const res = await getUnbilledChallansForPartyAction({ partyId });
      setLoadingChallans(false);

      if (!res.ok) {
        toast.error(res.message);
        setUnbilledChallans([]);
        return;
      }

      setUnbilledChallans(res.items);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  // console.log(unbilledChallans);

  // 2) When selection changes, build editable lines (grouped later by challanId)
  useEffect(() => {
    if (!selectedIds?.length) {
      replaceLines([]);
      return;
    }

    const selected = unbilledChallans.filter((c) => selectedIds.includes(c.id));

    // console.log(selected);

    const nextLines =
      selected.flatMap((ch) =>
        ch.items.map((it) => ({
          challanId: ch.id,
          challanNo: ch.challanNo ?? "",
          challanDate: ch.date,
          itemId: it.id,

          materialName: it.material.name ?? "",
          unit: it.material.unit ?? "",
          quantity: it.quantity,

          rate: it.rate ?? 0,
          discount: it.discount ?? 0,
        })),
      ) ?? [];

    replaceLines(nextLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, unbilledChallans]);

  // 3) Computed totals (like your challan)
  const computed = useMemo(() => {
    const totalQty = (linesWatch ?? []).reduce(
      (s, it) => s + Number(it.quantity ?? 0),
      0,
    );

    const subTotal = (linesWatch ?? []).reduce((s, it) => {
      const qty = Number(it.quantity ?? 0);
      const rate = Number(it.rate ?? 0);
      const disc = Number(it.discount ?? 0);

      // same formula style as your challan: discount is % on line
      const net = Math.max(0, rate * qty * ((100 - disc) / 100));
      return s + net;
    }, 0);

    return {
      totalQty,
      subTotal,
      total: subTotal,
    };
  }, [linesWatch]);

  // Helpers: group lines by challanId for UI
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        challanId: string;
        challanNo: string;
        challanDate: string;
        lines: any[];
      }
    >();

    (lineFields ?? []).forEach((line, idx) => {
      const key = (line as any).challanId as string;
      const existing = map.get(key);

      const challanNo = (line as any).challanNo as string;
      const challanDate = (line as any).challanDate as string;

      const payload = {
        ...line,
        _index: idx, // index into fieldArray
      };

      if (!existing) {
        map.set(key, {
          challanId: key,
          challanNo,
          challanDate,
          lines: [payload],
        });
      } else {
        existing.lines.push(payload);
      }
    });

    return Array.from(map.values());
  }, [lineFields]);

  // console.log(grouped);

  const toggleChallan = (challanId: string) => {
    const current = new Set(selectedIds ?? []);
    if (current.has(challanId)) current.delete(challanId);
    else current.add(challanId);
    form.setValue("selectedChallanIds", Array.from(current), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (values: createBillSchemaRequest) => {
    setSubmitting(true);
    setServerError(null);

    startTransition(async () => {
      const res = await finalizeBillAction(values);
      setSubmitting(false);

      if (!res.ok) {
        if (res.fieldErrors) {
          for (const [field, msgs] of Object.entries(res.fieldErrors)) {
            if (msgs?.length) form.setError(field as any, { message: msgs[0] });
          }
        }
        toast.error(res.message);
        return;
      }

      toast.success("Bill Created");
      // navigate to bill view page
      window.location.href = `/dashboard/bills/${res.billId}`;
    });
  };
  return (
    <div className="mx-auto w-full md:p-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Create Bill</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              id="bill-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6">
              {serverError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  {serverError}
                </div>
              ) : null}

              {/* Header (like challan) */}
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
                          onChange={(v) => {
                            // reset selection + lines when party changes
                            field.onChange(v);
                            form.setValue("selectedChallanIds", []);
                            replaceLines([]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill No</FormLabel>
                      <FormControl>
                        <Input
                          value={
                            billNumber
                              ? `${getFinancialYearKey(new Date())}-${pad(
                                  billNumber,
                                  4,
                                )}`
                              : field.value
                          }
                          onChange={field.onChange}
                          placeholder="Bill Number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value
                              ? new Date(field.value as Date)
                              : undefined
                          }
                          onChange={field.onChange}
                          placeholder="From date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 rounded-2xl border p-4 max-md:col-span-2">
                  <div className="grid grid-cols-3 gap-3 text-sm">
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
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-semibold">
                        {computed.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes + period */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
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

                <div className="rounded-2xl border p-4 space-y-3">
                  <div className="text-sm font-medium">
                    Billing Period (optional)
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="periodStart"
                      render={({ field }) => {
                        // Build DateRange from the two fields
                        const from = field.value
                          ? new Date(field.value as Date)
                          : undefined;
                        const toVal = form.getValues("periodEnd");
                        const to = toVal ? new Date(toVal as Date) : undefined;

                        const range: DateRange | undefined =
                          from || to ? { from, to } : undefined;

                        return (
                          <FormItem>
                            {/* <FormLabel>Billing Period</FormLabel> */}
                            <FormControl>
                              <DateRangePicker
                                value={range}
                                onChange={(r) => {
                                  // Write back to the two form fields
                                  form.setValue("periodStart", r?.from, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                  form.setValue("periodEnd", r?.to, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                                placeholder="Select period (optional)"
                                numberOfMonths={2}
                                disableAfterToday={false}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    {/* // Optional: also show errors for periodEnd if your Zod
                    refine attaches there */}
                    <FormField
                      control={form.control}
                      name="periodEnd"
                      render={() => (
                        <FormItem className="hidden">
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Challan picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">
                    Select Unbilled Challans
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {loadingChallans
                      ? "Loading..."
                      : partyId
                        ? `${unbilledChallans.length} found`
                        : "Pick a party"}
                  </div>
                </div>

                <div className="rounded-2xl border overflow-hidden">
                  <div className="grid grid-cols-12 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-1">Pick</div>
                    <div className="col-span-3">Challan No</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Vehicle</div>
                    <div className="col-span-2">Purpose</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>

                  <div className="divide-y">
                    {unbilledChallans.map((c) => {
                      const checked = (selectedIds ?? []).includes(c.id);
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => toggleChallan(c.id)}
                          className="w-full text-left px-4 py-3 hover:bg-muted/30">
                          <div className="grid grid-cols-12 items-center gap-2 text-sm">
                            <div className="col-span-1">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleChallan(c.id)}
                                className="h-4 w-4"
                              />
                            </div>
                            <div className="col-span-3 font-medium">
                              {c.challanNo ?? "-"}
                            </div>
                            <div className="col-span-2">
                              {new Date(c.date).toLocaleDateString()}
                            </div>
                            <div className="col-span-2">
                              {c.vehicleNo ?? "-"}
                            </div>
                            <div className="col-span-2">{c.purpose}</div>
                            <div className="col-span-2 text-right">
                              {(c.totalAmount ?? 0).toFixed(2)}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {!loadingChallans &&
                    partyId &&
                    unbilledChallans.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-muted-foreground">
                        No unbilled challans found for this party.
                      </div>
                    ) : null}

                    {!partyId ? (
                      <div className="px-4 py-6 text-sm text-muted-foreground">
                        Select a party to load unbilled challans.
                      </div>
                    ) : null}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="selectedChallanIds"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Items editor (like challan items), grouped by challan */}
              {grouped.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Edit Prices</h3>
                    <div className="text-sm text-muted-foreground">
                      {grouped.length} challan(s) selected
                    </div>
                  </div>

                  <div className="space-y-3">
                    {grouped.map((g) => {
                      // challan subtotal
                      const challanTotal = g.lines.reduce((s, l) => {
                        const idx = l._index as number;
                        const it = linesWatch?.[idx];
                        const qty = Number(it?.quantity ?? 0);
                        const rate = Number(it?.rate ?? 0);
                        const disc = Number(it?.discount ?? 0);
                        return (
                          s + Math.max(0, rate * qty * ((100 - disc) / 100))
                        );
                      }, 0);

                      return (
                        <div
                          key={g.challanId}
                          className="rounded-2xl border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">
                                Challan: {g.challanNo || "-"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Date:{" "}
                                {g.challanDate
                                  ? new Date(g.challanDate).toLocaleDateString()
                                  : "-"}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                Challan Total
                              </div>
                              <div className="font-semibold">
                                {challanTotal.toFixed(2)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {g.lines.map((l) => {
                              const idx = l._index as number;
                              const it = linesWatch?.[idx];

                              const lineAmount = (() => {
                                const qty = Number(it?.quantity ?? 0);
                                const rate = Number(it?.rate ?? 0);
                                const disc = Number(it?.discount ?? 0);
                                return Math.max(
                                  0,
                                  rate * qty * ((100 - disc) / 100),
                                );
                              })();

                              return (
                                <div
                                  key={(l as any).id}
                                  className="rounded-2xl border p-3">
                                  <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
                                    <div className="md:col-span-2">
                                      <div className="text-xs text-muted-foreground">
                                        Material
                                      </div>
                                      <div className="text-sm font-medium">
                                        {(it?.materialName as string) || "-"}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs text-muted-foreground">
                                        Unit
                                      </div>
                                      <div className="text-sm">
                                        {it?.unit || "-"}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs text-muted-foreground">
                                        Qty
                                      </div>
                                      <div className="text-sm font-medium">
                                        {Number(it?.quantity ?? 0).toFixed(2)}
                                      </div>
                                    </div>

                                    <FormField
                                      control={form.control}
                                      name={`lines.${idx}.rate`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">
                                            Rate
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              {...field}
                                              value={
                                                (field.value as number) ?? 0
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`lines.${idx}.discount`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">
                                            Disc %
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              {...field}
                                              value={
                                                (field.value as number) ?? 0
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Line Amount (computed):{" "}
                                    <span className="font-medium text-foreground">
                                      {lineAmount.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={submitting || isPending}>
                  {submitting ? "Saving..." : "Create Bill"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillForm;
