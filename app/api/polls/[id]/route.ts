import { NextResponse } from "next/server";
import { getPoll, getTotalVotes, isPollExpired } from "@/app/lib/polls";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const poll = getPoll(id);

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const totalVotes = getTotalVotes(poll);

  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    type: poll.type,
    endAt: poll.endAt,
    isExpired: isPollExpired(poll),
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      emoji: option.emoji,
      imageUrl: option.imageUrl,
      votes: option.votes,
      percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
    })),
    totalVotes,
  });
}
