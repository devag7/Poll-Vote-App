import { notFound } from "next/navigation";
import { getPoll, getTotalVotes } from "@/app/lib/polls";
import ResultsChart from "@/app/components/ResultsChart";

type PollResultsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PollResultsPage({ params }: PollResultsPageProps) {
  const { id } = await params;
  const poll = getPoll(id);

  if (!poll) {
    notFound();
  }

  const totalVotes = getTotalVotes(poll);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{poll.question}</h1>
      <p className="mb-6 text-slate-600">Live results update every 3 seconds.</p>
      <ResultsChart
        pollId={poll.id}
        initialData={{
          id: poll.id,
          question: poll.question,
          type: poll.type,
          endAt: poll.endAt,
          isExpired: poll.endAt ? new Date(poll.endAt).getTime() <= Date.now() : false,
          totalVotes,
          options: poll.options.map((option) => ({
            id: option.id,
            text: option.text,
            emoji: option.emoji,
            imageUrl: option.imageUrl,
            votes: option.votes,
            percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
          })),
        }}
      />
    </main>
  );
}
