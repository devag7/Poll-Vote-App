import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getPoll } from "@/app/lib/polls";
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

  if (hasVoted) {
    redirect(`/poll/${params.id}/results`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl p-6 md:p-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{poll.question}</h1>
      <VoteForm
        pollId={poll.id}
        options={poll.options.map((option) => ({
          id: option.id,
          text: option.text,
        }))}
      />
    </main>
  );
}
