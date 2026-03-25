"use client";

import { useEffect, useState } from "react";

type DashboardPoll = {
  id: string;
  question: string;
  type: "single" | "multiple" | "rating";
  endAt: string | null;
};

const CREATOR_SESSION_KEY = "poll_creator_session_id";
const CREATOR_POLLS_KEY_PREFIX = "poll_creator_polls_";

export default function DashboardPage() {
  const [polls, setPolls] = useState<DashboardPoll[]>([]);

  useEffect(() => {
    async function loadPolls() {
      const sessionId = window.localStorage.getItem(CREATOR_SESSION_KEY);
      if (!sessionId) {
        setPolls([]);
        return;
      }

      const pollIds = JSON.parse(
        window.localStorage.getItem(`${CREATOR_POLLS_KEY_PREFIX}${sessionId}`) ?? "[]",
      ) as string[];

      const entries = await Promise.all(
        pollIds.map(async (id) => {
          const response = await fetch(`/api/polls/${id}`, { cache: "no-store" });
          if (!response.ok) {
            return null;
          }
          const payload = (await response.json()) as DashboardPoll;
          return payload;
        }),
      );

      setPolls(entries.filter((entry): entry is DashboardPoll => Boolean(entry)));
    }

    loadPolls();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl p-6 md:p-10">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Creator dashboard</h1>
      <p className="mb-6 text-slate-600">Polls from your current browser session.</p>
      <div className="space-y-3">
        {polls.length < 1 ? <p className="text-sm text-slate-500">No polls created yet in this session.</p> : null}
        {polls.map((poll) => (
          <div key={poll.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-medium text-slate-900">{poll.question}</p>
            <p className="mt-1 text-sm text-slate-600">Type: {poll.type}</p>
            <p className="text-sm text-slate-600">Ends: {poll.endAt ? new Date(poll.endAt).toLocaleString() : "No expiry"}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <a href={`/poll/${poll.id}`} className="text-blue-700 underline">
                Vote page
              </a>
              <a href={`/poll/${poll.id}/results`} className="text-blue-700 underline">
                Results page
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
