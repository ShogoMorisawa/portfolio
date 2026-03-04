import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.MY_EMAIL) {
      return NextResponse.json(
        { error: "手紙の配送中にエラーが起きました" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { name, email, message, meta } = body;

    // Resendを使ってあなたのメアドへ送信！
    const { data, error } = await resend.emails.send({
      // ドメインの認証が終わっていない無料枠のうちは、
      // 必ず 'onboarding@resend.dev' から送る仕様になっています。
      // ここを勝手に変えるとエラーで弾かれるので注意
      from: "Portfolio Post <onboarding@resend.dev>",
      to: process.env.MY_EMAIL as string,
      subject: `📜 ポストに手紙が届きました（${name ? `${name} さん` : "差出人不明"}）`,
      text: `
        ポートフォリオサイトのポストに新しい手紙が届きました。

        ■ 差出人
        おなまえ: ${name || "（未記入）"}
        返信先: ${email || "（未記入・返信不要）"}

        ■ 本文
        --------------------------------------------------
        ${message || "（未記入）"}
        --------------------------------------------------

        ■ メタデータ
        送信日時: ${meta?.sentAt ?? "不明"}
        User-Agent: ${meta?.userAgent ?? "不明"}
        画面: ${meta?.screenSize ?? "不明"}
        言語: ${meta?.language ?? "不明"}
              `.trim(),
    });

    if (error) {
      return NextResponse.json(
        { error: "手紙の配送中にエラーが起きました" },
        { status: 500 },
      );
    }

    // 成功したらフロントエンドに「無事届いたよ」と返す
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "サーバー内で問題が発生しました" },
      { status: 500 },
    );
  }
}
