"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type VoteFormProps = {
  pollId: string;
  pollType: "single" | "multiple" | "rating";
  endAt: string | null;
  options: Array<{
    id: string;
    text: string;
    emoji?: string;
    imageUrl?: string;
  }>;
};

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function launchConfetti() {
  if (typeof window === "undefined") {
    return;
  }

  const container = document.createElement("div");
  container.className = "pointer-events-none fixed inset-0 z-50 overflow-hidden";
  document.body.appendChild(container);
  const viewportHeight = window.innerHeight;

  for (let i = 0; i < 50; i += 1) {
    const piece = document.createElement("span");
    piece.className = "absolute top-0 h-2 w-2 rounded-sm";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = ["#2563eb", "#16a34a", "#eab308", "#ef4444", "#9333ea"][i % 5];
    piece.style.opacity = "0.9";
    piece.animate(
      [
        { transform: `translateY(-10px) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${viewportHeight + 20}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0.2 },
      ],
      {
        duration: 900 + Math.random() * 900,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    );
    container.appendChild(piece);
  }

  window.setTimeout(() => {
    container.remove();
  }, 2000);
}

export default function VoteForm({ pollId, pollType, endAt, options }: VoteFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remainingMs, setRemainingMs] = useState(() => (endAt ? new Date(endAt).getTime() - Date.now() : null));

  const isExpired = remainingMs !== null && remainingMs <= 0;
  const ratingLabels = useMemo(() => {
    if (pollType !== "rating") {
      return null;
    }
    return options.slice().sort((a, b) => Number(a.id) - Number(b.id));
  }, [options, pollType]);

  useEffect(() => {
    if (!endAt) {
      return;
    }
    const interval = window.setInterval(() => {
      setRemainingMs(new Date(endAt).getTime() - Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [endAt]);

  function updateSelection(optionId: string, checked: boolean) {
    if (pollType === "multiple") {
      setSelected((current) => {
        if (checked) {
          return Array.from(new Set([...current, optionId]));
        }
        return current.filter((id) => id !== optionId);
      });
      return;
    }

    setSelected(checked ? [optionId] : []);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selected.length < 1) {
      setError(pollType === "multiple" ? "Please select at least one option" : "Please select an option");
      return;
    }

    if (isExpired) {
      setError("This poll has expired");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionIds: selected }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Failed to submit vote");
        return;
      }

      launchConfetti();
      router.push(`/poll/${pollId}/results`);
    } catch {
      setError("Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm text-slate-600">
        {endAt ? `Poll ends in: ${isExpired ? "Expired" : formatRemaining(remainingMs ?? 0)}` : "No expiry set"}
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">
          {pollType === "multiple"
            ? "Choose one or more options"
            : pollType === "rating"
              ? "Choose a rating (1-5 stars)"
              : "Choose one option"}
        </legend>
        {pollType === "rating" ? (
          <div className="flex flex-wrap gap-2">
            {ratingLabels?.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-md border px-3 py-2 text-2xl ${
                  selected[0] === option.id ? "border-amber-400 bg-amber-50" : "border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="voteOption"
                  value={option.id}
                  checked={selected[0] === option.id}
                  onChange={(event) => updateSelection(event.target.value, event.target.checked)}
                  className="sr-only"
                />
                {"⭐".repeat(Number(option.id))}
              </label>
            ))}
          </div>
        ) : null}
        {options.map((option) => (
          <label
            key={option.id}
            className={`${
              pollType === "rating" ? "hidden" : "flex"
            } cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3`}
          >
            <input
              type={pollType === "multiple" ? "checkbox" : "radio"}
              name="voteOption"
              value={option.id}
              checked={selected.includes(option.id)}
              onChange={(event) => updateSelection(event.target.value, event.target.checked)}
              className="h-4 w-4"
            />
            {option.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.imageUrl} alt={option.text} className="h-8 w-8 rounded object-cover" />
            ) : null}
            <span className="text-slate-800">
              {option.emoji ? `${option.emoji} ` : ""}
              {option.text}
            </span>
          </label>
        ))}
      </fieldset>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting || isExpired}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit vote"}
      </button>
    </form>
  );
}
