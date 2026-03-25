import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getPoll, isPollExpired } from "@/app/lib/polls";
import VoteForm from "@/app/components/VoteForm";

type PollPageProps = {
  params: {
    id: string;
  };
};

function getVoteCookieKey(pollId: string) {
  return `poll-voted-${pollId}`;
}

export default function PollPage({ params }: PollPageProps) {
  const poll = getPoll(params.id);

  if (!poll) {
    notFound();
  }

  const hasVoted = cookies().get(getVoteCookieKey(params.id))?.value === "1";
  const isExpired = isPollExpired(poll);

  if (hasVoted || isExpired) {
    redirect(`/poll/${params.id}/results`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{poll.question}</h1>
      <VoteForm
        pollId={poll.id}
        pollType={poll.type}
        endAt={poll.endAt}
        options={poll.options.map((option) => ({
          id: option.id,
          text: option.text,
          emoji: option.emoji,
          imageUrl: option.imageUrl,
        }))}
      />
    </main>
  );
}
