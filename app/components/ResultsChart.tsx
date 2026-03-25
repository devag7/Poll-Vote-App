"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PollResult = {
  id: string;
  question: string;
  type: "single" | "multiple" | "rating";
  endAt: string | null;
  isExpired: boolean;
  totalVotes: number;
  options: Array<{
    id: string;
    text: string;
    emoji?: string;
    imageUrl?: string;
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
  const [embedCopyState, setEmbedCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

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

  async function handleCopyEmbed() {
    try {
      const src = `${window.location.origin}/poll/${pollId}/results`;
      const snippet = `<iframe src="${src}" width="640" height="420" style="border:1px solid #e2e8f0;border-radius:8px;" loading="lazy"></iframe>`;
      await navigator.clipboard.writeText(snippet);
      setEmbedCopyState("copied");
      setTimeout(() => setEmbedCopyState("idle"), 2000);
    } catch {
      setEmbedCopyState("error");
      setTimeout(() => setEmbedCopyState("idle"), 2000);
    }
  }

  const chartData = useMemo(
    () =>
      data.options.map((option) => ({
        name: `${option.emoji ? `${option.emoji} ` : ""}${option.text}`,
        percentage: Number(option.percentage.toFixed(1)),
        votes: option.votes,
      })),
    [data.options],
  );

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Total votes: {data.totalVotes}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setChartType((current) => (current === "bar" ? "pie" : "bar"))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            {chartType === "bar" ? "Show pie chart" : "Show bar chart"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            {copyState === "copied" ? "Copied!" : copyState === "error" ? "Copy failed" : "Share poll"}
          </button>
          <button
            type="button"
            onClick={handleCopyEmbed}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            {embedCopyState === "copied"
              ? "Embed copied!"
              : embedCopyState === "error"
                ? "Embed copy failed"
                : "Copy embed code"}
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartType === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 8, left: 24, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="name" width={140} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="votes" nameKey="name" outerRadius={110} label>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea", "#0891b2"][index % 6]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="space-y-2">
        {chartData.map((entry) => (
          <div key={entry.name}>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
              <span>{entry.name}</span>
              <span>{entry.percentage}%</span>
            </div>
            <div className="h-2 w-full rounded bg-slate-200">
              <div
                className="h-2 rounded bg-blue-600 transition-all duration-700 ease-out"
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
