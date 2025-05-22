import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                // @ts-ignore - Type issues with react-syntax-highlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Style for links
          a: ({ node, ...props }: any) => (
            <a
              {...props}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          // Style for headings
          h1: ({ node, ...props }: any) => (
            <h1 {...props} className="text-xl font-bold mt-4 mb-2" />
          ),
          h2: ({ node, ...props }: any) => (
            <h2 {...props} className="text-lg font-bold mt-3 mb-2" />
          ),
          h3: ({ node, ...props }: any) => (
            <h3 {...props} className="text-md font-bold mt-3 mb-1" />
          ),
          // Style for lists
          ul: ({ node, ...props }: any) => (
            <ul {...props} className="list-disc pl-5 my-2" />
          ),
          ol: ({ node, ...props }: any) => (
            <ol {...props} className="list-decimal pl-5 my-2" />
          ),
          // Style for blockquotes
          blockquote: ({ node, ...props }: any) => (
            <blockquote
              {...props}
              className="border-l-4 border-muted pl-4 italic my-2"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
