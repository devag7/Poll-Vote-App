export type PollOption = {
  id: string;
  text: string;
  votes: number;
  emoji?: string;
  imageUrl?: string;
};

export type PollType = "single" | "multiple" | "rating";

export type Poll = {
  id: string;
  question: string;
  type: PollType;
  options: PollOption[];
  createdAt: string;
  endAt: string | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __pollStore__: Map<string, Poll> | undefined;
}

const polls = globalThis.__pollStore__ ?? new Map<string, Poll>();

if (!globalThis.__pollStore__) {
  globalThis.__pollStore__ = polls;
}

const MAX_OPTIONS = 6;
const POLL_TYPES: PollType[] = ["single", "multiple", "rating"];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeImageUrl(value: unknown): string | undefined {
  const url = normalizeText(value);
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function normalizeType(value: unknown): PollType {
  if (typeof value === "string" && POLL_TYPES.includes(value as PollType)) {
    return value as PollType;
  }
  return "single";
}

function normalizeEndAt(value: unknown): string | null {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const endDate = new Date(text);
  if (Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid end date/time");
  }

  if (endDate.getTime() <= Date.now()) {
    throw new Error("End date/time must be in the future");
  }

  return endDate.toISOString();
}

export function isPollExpired(poll: Poll): boolean {
  if (!poll.endAt) {
    return false;
  }
  return new Date(poll.endAt).getTime() <= Date.now();
}

export function createPoll(input: { question: unknown; options: unknown; type: unknown; endAt: unknown }): Poll {
  const question = normalizeText(input.question);
  const type = normalizeType(input.type);
  const endAt = normalizeEndAt(input.endAt);
  const rawOptions = Array.isArray(input.options) ? input.options : [];

  const options =
    type === "rating"
      ? Array.from({ length: 5 }).map((_, index) => ({
          id: String(index + 1),
          text: `${index + 1} Star${index === 0 ? "" : "s"}`,
          votes: 0,
          emoji: "⭐",
        }))
      : rawOptions
          .map((option, index) => {
            if (typeof option === "string") {
              const text = normalizeText(option);
              if (!text) {
                return null;
              }
              return { id: String(index), text, votes: 0 };
            }

            if (option && typeof option === "object") {
              const text = normalizeText((option as { text?: unknown }).text);
              if (!text) {
                return null;
              }
              const emoji = normalizeText((option as { emoji?: unknown }).emoji);
              return {
                id: String(index),
                text,
                votes: 0,
                emoji: emoji || undefined,
                imageUrl: normalizeImageUrl((option as { imageUrl?: unknown }).imageUrl),
              };
            }

            return null;
          })
          .filter((option): option is PollOption => Boolean(option))
          .slice(0, MAX_OPTIONS);

  if (!question) {
    throw new Error("Question is required");
  }

  if (type !== "rating" && options.length < 2) {
    throw new Error("At least two options are required");
  }

  const id = crypto.randomUUID();
  const poll: Poll = {
    id,
    question,
    type,
    options,
    createdAt: new Date().toISOString(),
    endAt,
  };

  polls.set(id, poll);
  return poll;
}

export function getPoll(id: string): Poll | null {
  return polls.get(id) ?? null;
}

export function votePoll(id: string, optionIds: string[]): Poll | null {
  const poll = polls.get(id);

  if (!poll) {
    return null;
  }

  if (isPollExpired(poll)) {
    throw new Error("This poll has expired");
  }

  const uniqueOptionIds = Array.from(new Set(optionIds));

  if (poll.type === "single" || poll.type === "rating") {
    if (uniqueOptionIds.length !== 1) {
      throw new Error("Please select exactly one option");
    }
  }

  if (poll.type === "multiple" && uniqueOptionIds.length < 1) {
    throw new Error("Please select at least one option");
  }

  for (const optionId of uniqueOptionIds) {
    const option = poll.options.find((item) => item.id === optionId);
    if (!option) {
      throw new Error("Invalid option");
    }
    option.votes += 1;
  }

  return poll;
}

export function getTotalVotes(poll: Poll): number {
  return poll.options.reduce((sum, option) => sum + option.votes, 0);
}
