export const LETTER_API_BASE_URL =
  process.env.NEXT_PUBLIC_LETTER_API_URL ?? "http://localhost:8000";

export type LetterReply = {
  id: number;
  name: string | null;
  message: string;
  reply: string;
  replied_at: string;
  created_at: string;
};

export async function submitLetter(payload: {
  visitor_id: string;
  name: string;
  email?: string;
  message: string;
}): Promise<void> {
  const response = await fetch(`${LETTER_API_BASE_URL}/submit_letter.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "送信に失敗しました");
  }
}

export async function checkLetters(visitor_id: string): Promise<LetterReply[]> {
  const url = new URL(`${LETTER_API_BASE_URL}/check_letter.php`);
  url.searchParams.set("visitor_id", visitor_id);
  const response = await fetch(url.toString());
  if (!response.ok) return [];
  const data = await response.json().catch(() => null);
  return Array.isArray(data?.letters) ? (data.letters as LetterReply[]) : [];
}

export async function markLettersRead(payload: {
  visitor_id: string;
  letter_ids: number[];
}): Promise<void> {
  if (payload.letter_ids.length === 0) return;
  await fetch(`${LETTER_API_BASE_URL}/mark_read.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
