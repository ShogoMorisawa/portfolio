export const LETTER_API_BASE_URL =
  process.env.NEXT_PUBLIC_LETTER_API_URL ?? "http://localhost:8000";

export type LetterReply = {
  id: number;
  name: string;
  message: string;
  reply: string;
  replied_at: string;
  created_at: string;
};

export async function submitLetter(payload: {
  name: string;
  email?: string;
  message: string;
  turnstileToken: string;
  website: string;
}): Promise<void> {
  const response = await fetch(`${LETTER_API_BASE_URL}/letterbox/letters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message ?? "送信に失敗しました");
  }
}

export async function checkLetters(): Promise<LetterReply[]> {
  const response = await fetch(`${LETTER_API_BASE_URL}/letterbox/replies`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  const data = await response.json().catch(() => null);
  return Array.isArray(data?.data) ? (data.data as LetterReply[]) : [];
}

export async function markLettersRead(letterIds: number[]): Promise<void> {
  if (letterIds.length === 0) return;
  await fetch(`${LETTER_API_BASE_URL}/letterbox/read-receipts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ letterIds }),
  });
}
