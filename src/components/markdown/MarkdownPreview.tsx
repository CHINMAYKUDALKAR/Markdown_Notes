
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  theme: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme }) => {
  return (
    <div className={cn("markdown-editor px-2", 
      theme === 'dark' ? 'prose-invert' : 'prose',
      "prose max-w-none")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            return !match ? (
              <code className={cn("rounded bg-muted px-1 py-0.5", className)} {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={theme === 'dark' ? tomorrow : oneLight}
                language={match[1]}
                PreTag="div"
                wrapLines={true}
                className="rounded-md !bg-muted/50 dark:!bg-muted/20"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          a({node, className, children, ...props}) {
            return (
              <a 
                className={cn("text-primary hover:underline", className)} 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          h1({node, className, children, ...props}) {
            return <h1 className={cn("text-2xl font-bold mt-6 mb-4", className)} {...props}>{children}</h1>;
          },
          h2({node, className, children, ...props}) {
            return <h2 className={cn("text-xl font-bold mt-5 mb-3", className)} {...props}>{children}</h2>;
          },
          h3({node, className, children, ...props}) {
            return <h3 className={cn("text-lg font-bold mt-4 mb-2", className)} {...props}>{children}</h3>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
