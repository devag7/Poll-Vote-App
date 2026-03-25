"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_OPTIONS = 6;
const CREATOR_SESSION_KEY = "poll_creator_session_id";
const CREATOR_POLLS_KEY_PREFIX = "poll_creator_polls_";

type PollType = "single" | "multiple" | "rating";

type OptionInput = {
  text: string;
  emoji: string;
  imageUrl: string;
};

export default function PollCreateForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<PollType>("single");
  const [endAt, setEndAt] = useState("");
  const [options, setOptions] = useState<OptionInput[]>([
    { text: "", emoji: "", imageUrl: "" },
    { text: "", emoji: "", imageUrl: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateOption(index: number, field: keyof OptionInput, value: string) {
    setOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, [field]: value } : option)),
    );
  }

  function addOption() {
    setOptions((current) => {
      if (current.length >= MAX_OPTIONS) {
        return current;
      }
      return [...current, { text: "", emoji: "", imageUrl: "" }];
    });
  }

  function removeOption(index: number) {
    setOptions((current) => {
      if (current.length <= 2) {
        return current;
      }
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          type,
          endAt: endAt ? new Date(endAt).toISOString() : null,
          options:
            type === "rating"
              ? []
              : options.map((option) => ({
                  text: option.text,
                  emoji: option.emoji,
                  imageUrl: option.imageUrl,
                })),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Failed to create poll");
        return;
      }

      const payload = (await response.json()) as { id: string };

      if (typeof window !== "undefined") {
        let sessionId = window.localStorage.getItem(CREATOR_SESSION_KEY);
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          window.localStorage.setItem(CREATOR_SESSION_KEY, sessionId);
        }

        const storageKey = `${CREATOR_POLLS_KEY_PREFIX}${sessionId}`;
        const existing = window.localStorage.getItem(storageKey);
        const pollIds = existing ? ((JSON.parse(existing) as string[]) ?? []) : [];
        const nextPollIds = Array.from(new Set([payload.id, ...pollIds]));
        window.localStorage.setItem(storageKey, JSON.stringify(nextPollIds));
      }

      router.push(`/poll/${payload.id}`);
    } catch {
      setError("Failed to create poll");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="question" className="mb-2 block text-sm font-medium text-slate-700">
          Poll question
        </label>
        <input
          id="question"
          name="question"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What should we vote on?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="pollType" className="mb-2 block text-sm font-medium text-slate-700">
            Poll type
          </label>
          <select
            id="pollType"
            value={type}
            onChange={(event) => setType(event.target.value as PollType)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
          >
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
            <option value="rating">Rating scale (1-5 stars)</option>
          </select>
        </div>
        <div>
          <label htmlFor="endAt" className="mb-2 block text-sm font-medium text-slate-700">
            Poll end date/time
          </label>
          <input
            id="endAt"
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <a href="/dashboard" className="inline-block text-sm text-blue-700 underline">
        View creator dashboard
      </a>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Options</p>
        {type === "rating" ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Rating polls automatically create 1 to 5 star options.
          </p>
        ) : null}
        {type !== "rating" &&
          options.map((option, index) => (
            <div key={index} className="space-y-2 rounded-md border border-slate-200 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(event) => updateOption(index, "text", event.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  type="text"
                  value={option.emoji}
                  onChange={(event) => updateOption(index, "emoji", event.target.value)}
                  placeholder="Emoji (optional)"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                />
                <input
                  type="url"
                  value={option.imageUrl}
                  onChange={(event) => updateOption(index, "imageUrl", event.target.value)}
                  placeholder="Image URL (optional)"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= MAX_OPTIONS || type === "rating"}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add option
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create poll"}
      </button>
    </form>
  );
}
