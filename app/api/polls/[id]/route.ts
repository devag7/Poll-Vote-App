import { NextResponse } from "next/server";
import { getPoll, getTotalVotes } from "@/app/lib/polls";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  const poll = getPoll(params.id);

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const totalVotes = getTotalVotes(poll);

  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      votes: option.votes,
      percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
    })),
    totalVotes,
  });
}
