import {
  parseTipTapDocument,
  safeImageSrc,
  safeLinkHref,
  type TipTapNode,
} from '../lib/article-content'

function InlineContent({ nodes }: { nodes?: TipTapNode[] }) {
  return nodes?.map((node, index) => {
    const isBold = node.marks?.some((mark) => mark.type === 'bold')
    const linkMark = node.marks?.find((mark) => mark.type === 'link')
    const href = safeLinkHref(linkMark?.attrs?.href)
    const classes = isBold ? 'font-black text-[#FF5757] ' : ''

    if (href) {
      return (
        <a
          key={index}
          href={href}
          target={linkMark?.attrs?.target === '_blank' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={`${classes}font-black text-[#FF5757] underline decoration-4 underline-offset-4 transition-colors hover:text-[#7BE0D6]`}
        >
          {node.text}
        </a>
      )
    }

    return (
      <span key={index} className={classes}>
        {node.text}
      </span>
    )
  })
}

export default function TipTapRenderer({ contentJson }: { contentJson: unknown }) {
  const data = parseTipTapDocument(contentJson)
  if (!data?.content) return null

  return (
    <div className="space-y-6 text-[1.02rem] leading-8 text-[#4A4A4A]">
      {data.content.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="mb-4">
              <InlineContent nodes={block.content} />
            </p>
          )
        }

        if (block.type === 'heading' && block.attrs?.level === 2) {
          return (
            <h2
              key={index}
              className="mt-12 mb-4 inline-block border-4 border-[#4A4A4A] bg-[#7BE0D6] px-3 py-1 text-2xl font-black transition-transform hover:-rotate-1"
            >
              <InlineContent nodes={block.content} />
            </h2>
          )
        }

        if (block.type === 'image') {
          const src = safeImageSrc(block.attrs?.src)
          if (!src) return null

          return (
            <div key={index} className="my-10 flex justify-center">
              {/* API-managed media URLs are intentionally rendered without Next image rewriting. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={
                  typeof block.attrs?.alt === 'string'
                    ? block.attrs.alt
                    : 'ブログ画像'
                }
                className="max-w-full rounded-[24px] border-8 border-[#4A4A4A] bg-[#FFF6D1] shadow-[8px_8px_0_0_#4A4A4A] transition-transform hover:-translate-y-1 hover:rotate-1"
              />
            </div>
          )
        }

        if (block.type === 'codeBlock') {
          return (
            <pre
              key={index}
              className="my-6 overflow-x-auto rounded-xl border-8 border-[#4A4A4A] bg-[#4A4A4A] p-4 font-mono text-sm text-[#7BE0D6] shadow-[4px_4px_0_0_#FF5757]"
            >
              <code>{block.content?.[0]?.text}</code>
            </pre>
          )
        }

        return null
      })}
    </div>
  )
}
