"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PollResult = {
  id: string;
  question: string;
  totalVotes: number;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }>;
};

type ResultsChartProps = {
  pollId: string;
  initialData: PollResult;
};

export default function ResultsChart({ pollId, initialData }: ResultsChartProps) {
  const [data, setData] = useState<PollResult>(initialData);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const nextData = (await response.json()) as PollResult;
      setData(nextData);
    }, 3000);

    return () => clearInterval(interval);
  }, [pollId]);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.origin + `/poll/${pollId}`);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  const chartData = useMemo(
    () =>
      data.options.map((option) => ({
        name: option.text,
        percentage: Number(option.percentage.toFixed(1)),
      })),
    [data.options],
  );

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Total votes: {data.totalVotes}</p>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          {copyState === "copied" ? "Copied!" : copyState === "error" ? "Copy failed" : "Share poll"}
        </button>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 24, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="name" width={140} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
