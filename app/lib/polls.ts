export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
};

const polls = new Map<string, Poll>();

const MAX_OPTIONS = 6;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function createPoll(input: { question: unknown; options: unknown }): Poll {
  const question = normalizeText(input.question);
  const rawOptions = Array.isArray(input.options) ? input.options : [];
  const options = rawOptions
    .map((option) => normalizeText(option))
    .filter(Boolean)
    .slice(0, MAX_OPTIONS);

  if (!question) {
    throw new Error("Question is required");
  }

  if (options.length < 2) {
    throw new Error("At least two options are required");
  }

  const id = crypto.randomUUID();
  const poll: Poll = {
    id,
    question,
    options: options.map((text, index) => ({ id: String(index), text, votes: 0 })),
    createdAt: new Date().toISOString(),
  };

  polls.set(id, poll);
  return poll;
}

export function getPoll(id: string): Poll | null {
  return polls.get(id) ?? null;
}

export function votePoll(id: string, optionId: string): Poll | null {
  const poll = polls.get(id);

  if (!poll) {
    return null;
  }

  const option = poll.options.find((item) => item.id === optionId);

  if (!option) {
    throw new Error("Invalid option");
  }

  option.votes += 1;
  return poll;
}

export function getTotalVotes(poll: Poll): number {
  return poll.options.reduce((sum, option) => sum + option.votes, 0);
}
