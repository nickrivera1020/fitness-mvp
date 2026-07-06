import ReactMarkdown from "react-markdown";

/** Lesson/challenge body text with house typography. */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: (props) => (
          <h2 className="mt-6 mb-2 text-lg font-semibold tracking-tight" {...props} />
        ),
        h2: (props) => (
          <h2 className="mt-6 mb-2 text-lg font-semibold tracking-tight" {...props} />
        ),
        h3: (props) => (
          <h3 className="mt-5 mb-1.5 font-semibold" {...props} />
        ),
        p: (props) => <p className="my-3 leading-relaxed" {...props} />,
        ul: (props) => (
          <ul className="my-3 flex list-disc flex-col gap-1.5 pl-5" {...props} />
        ),
        ol: (props) => (
          <ol className="my-3 flex list-decimal flex-col gap-1.5 pl-5" {...props} />
        ),
        li: (props) => <li className="leading-relaxed" {...props} />,
        strong: (props) => <strong className="font-semibold" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
