import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  // Define components with proper TypeScript types
  const components: Components = {
    // Code block with syntax highlighting
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
    // Links with proper styling and security
    a({ node, ...props }: any) {
      return (
        <a
          {...props}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        />
      );
    },
    // Enhanced headings
    h1({ node, ...props }: any) {
      return <h1 {...props} className="text-xl font-bold mt-4 mb-2" />;
    },
    h2({ node, ...props }: any) {
      return <h2 {...props} className="text-lg font-bold mt-3 mb-2" />;
    },
    h3({ node, ...props }: any) {
      return <h3 {...props} className="text-md font-bold mt-3 mb-1" />;
    },
    h4({ node, ...props }: any) {
      return <h4 {...props} className="text-sm font-bold mt-2 mb-1" />;
    },
    // Lists
    ul({ node, ...props }: any) {
      return <ul {...props} className="list-disc pl-5 my-2" />;
    },
    ol({ node, ...props }: any) {
      return <ol {...props} className="list-decimal pl-5 my-2" />;
    },
    // List items with support for task lists
    li({ node, checked, ...props }: any) {
      if (checked !== undefined && checked !== null) {
        return (
          <li className="flex items-start">
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mt-1 mr-2"
            />
            <span {...props} />
          </li>
        );
      }
      return <li {...props} />;
    },
    // Blockquotes
    blockquote({ node, ...props }: any) {
      return (
        <blockquote
          {...props}
          className="border-l-4 border-primary/30 pl-4 italic my-2 text-muted-foreground"
        />
      );
    },
    // Tables (from GFM)
    table({ node, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table {...props} className="min-w-full divide-y divide-border" />
        </div>
      );
    },
    thead({ node, ...props }: any) {
      return <thead {...props} className="bg-muted/50" />;
    },
    tbody({ node, ...props }: any) {
      return <tbody {...props} className="divide-y divide-border" />;
    },
    tr({ node, ...props }: any) {
      return <tr {...props} />;
    },
    th({ node, ...props }: any) {
      return (
        <th
          {...props}
          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
        />
      );
    },
    td({ node, ...props }: any) {
      return <td {...props} className="px-4 py-2 whitespace-nowrap" />;
    },
    // Images
    img({ node, ...props }: any) {
      return (
        <img
          {...props}
          className="max-w-full h-auto rounded-md my-2"
          loading="lazy"
        />
      );
    },
    // Horizontal rule
    hr({ node, ...props }: any) {
      return <hr {...props} className="my-4 border-t border-border" />;
    },
    // Paragraphs
    p({ node, ...props }: any) {
      return <p {...props} className="my-2" />;
    },
    // Strong and emphasis
    strong({ node, ...props }: any) {
      return <strong {...props} className="font-bold" />;
    },
    em({ node, ...props }: any) {
      return <em {...props} className="italic" />;
    },
    // Strikethrough (from GFM)
    del({ node, ...props }: any) {
      return <del {...props} className="line-through" />;
    },
  };

  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
