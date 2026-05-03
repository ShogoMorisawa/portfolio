## GLB モデルの変換（-transformed.glb）

`computer-transformed.glb` のように最適化した GLB を作るには [glTF Transform CLI](https://gltf-transform.donmccurdy.com/cli.html) を使います。

```bash
# CLI をグローバルにインストール
npm install --global @gltf-transform/cli

# 変換（例: computer.glb → computer-transformed.glb）
gltf-transform optimize public/models/computer.glb public/models/computer-transformed.glb
```

`optimize` で Draco 圧縮などを使う場合は `--compress draco` などを付けてください。変換後、コードで `*-transformed.glb` を参照するようにパスを合わせます。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
