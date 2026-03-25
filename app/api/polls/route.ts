import { NextResponse } from "next/server";
import { createPoll } from "@/app/lib/polls";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const poll = createPoll({
      question: body?.question,
      options: body?.options,
    });

    return NextResponse.json({ id: poll.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create poll";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
