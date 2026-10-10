"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface HistoryPoint {
  t: string;
  aqi: number;
}

export function ObservatoryChart({ data }: { data: HistoryPoint[] }) {
  return (
    <div className="h-64 w-full" data-testid="aqi-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 6" />
          <XAxis
            dataKey="t"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(148,163,184,0.3)" }}
            tickLine={false}
            interval={5}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 500]}
          />
          <Tooltip
            contentStyle={{
              background: "#141b3d",
              border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 12,
              color: "#f8fafc",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
