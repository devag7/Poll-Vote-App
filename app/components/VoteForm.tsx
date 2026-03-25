"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VoteFormProps = {
  pollId: string;
  options: Array<{
    id: string;
    text: string;
  }>;
};

export default function VoteForm({ pollId, options }: VoteFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      setError("Please select an option");
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
        body: JSON.stringify({ optionId: selected }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Failed to submit vote");
        return;
      }

      router.push(`/poll/${pollId}/results`);
    } catch {
      setError("Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-700">Choose one option</legend>
        {options.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3">
            <input
              type="radio"
              name="voteOption"
              value={option.id}
              checked={selected === option.id}
              onChange={(event) => setSelected(event.target.value)}
              className="h-4 w-4"
            />
            <span className="text-slate-800">{option.text}</span>
          </label>
        ))}
      </fieldset>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit vote"}
      </button>
    </form>
  );
}
