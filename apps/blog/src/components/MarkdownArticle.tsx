import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownArticleProps = {
  markdown: string
}

export default function MarkdownArticle({ markdown }: MarkdownArticleProps) {
  return (
    <div className="mx-auto max-w-none text-[#4A4A4A] sm:max-w-3xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-12 mb-5 inline-block bg-[#7BE0D6] px-3 py-1 text-3xl leading-tight font-black tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-10 mb-4 inline-block rounded-[18px] border-4 border-[#4A4A4A] bg-[#FFE36E] px-3 py-2 text-2xl leading-tight font-black">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-0 mb-6 text-[1.02rem] leading-8 text-[#4A4A4A]">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="bg-[#FFD3E9] px-1 font-black text-[#4A4A4A]">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="mb-6 ml-6 list-disc space-y-2 text-[1.02rem] leading-8">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 ml-6 list-decimal space-y-2 text-[1.02rem] leading-8">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 rounded-[28px] border-8 border-[#4A4A4A] bg-white px-5 py-5 text-lg leading-8 shadow-[8px_8px_0_0_#4A4A4A] sm:px-7">
              <p className="mb-0 text-[0.78rem] font-black uppercase tracking-[0.22em] text-[#FF5757]">note</p>
              <div className="mt-3">{children}</div>
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-black text-[#FF5757] underline decoration-4 underline-offset-4"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className)

            if (!isBlock) {
              return (
                <code className="rounded-md border-2 border-[#4A4A4A] bg-[#FFE36E] px-1.5 py-0.5 text-[0.92em] font-bold">
                  {children}
                </code>
              )
            }

            return (
              <div className="my-8 overflow-hidden rounded-[28px] border-8 border-[#4A4A4A] bg-[#181818] shadow-[8px_8px_0_0_#4A4A4A]">
                <div className="flex items-center gap-2 border-b-4 border-[#4A4A4A] bg-[#2A2A2A] px-4 py-3">
                  <span className="h-4 w-4 rounded-full border-2 border-[#4A4A4A] bg-[#FF5757]" />
                  <span className="h-4 w-4 rounded-full border-2 border-[#4A4A4A] bg-[#FFE36E]" />
                  <span className="h-4 w-4 rounded-full border-2 border-[#4A4A4A] bg-[#7BE0D6]" />
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-7 text-[#F7F1D1]">
                  <code>{children}</code>
                </pre>
              </div>
            )
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
