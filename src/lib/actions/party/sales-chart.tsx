"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function MonthlySalesChart({
  rows,
}: {
  rows: Array<{ month: string; amount: number }>;
}) {
  const data = rows.map((r) => ({
    month: new Date(r.month).toLocaleDateString(undefined, {
      year: "2-digit",
      month: "short",
    }),
    amount: r.amount,
  }));

  return (
    <Card className="rounded-2xl bg-primary">
      <CardHeader>
        <CardTitle className="text-base">Monthly Sales Amount</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
