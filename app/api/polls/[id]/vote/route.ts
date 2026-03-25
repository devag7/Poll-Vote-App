import { NextResponse } from "next/server";
import { getPoll, votePoll } from "@/app/lib/polls";

type Params = {
  params: {
    id: string;
  };
};

function getVoteCookieKey(pollId: string) {
  return `poll-voted-${pollId}`;
}

export async function POST(request: Request, { params }: Params) {
  const pollId = params.id;
  const cookieStore = request.headers.get("cookie") ?? "";
  const voteCookieKey = getVoteCookieKey(pollId);

  if (cookieStore.includes(`${voteCookieKey}=1`)) {
    return NextResponse.json({ error: "You have already voted" }, { status: 409 });
  }

  const poll = getPoll(pollId);

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const optionId = typeof body?.optionId === "string" ? body.optionId : "";

    votePoll(pollId, optionId);

    const response = NextResponse.json({ success: true });
    response.cookies.set(voteCookieKey, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit vote";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
