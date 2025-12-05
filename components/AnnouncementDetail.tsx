import type { PostDetail } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import AnnouncementDetailLayout, {
  type AnnouncementDetailMeta,
} from "./AnnouncementDetailLayout";

interface AnnouncementDetailProps {
  post: PostDetail;
}

export default function AnnouncementDetail({ post }: AnnouncementDetailProps) {
  const { content, ...rest } = post;
  const meta: AnnouncementDetailMeta = {
    slug: post.slug,
    title: rest.title,
    excerpt: rest.excerpt,
    image: rest.image,
    category: rest.category,
    date: rest.date,
    readTime: rest.readTime,
    tags: rest.tags,
    viewCount: rest.viewCount,
    author: rest.author,
  };

  return (
    <AnnouncementDetailLayout announcement={meta}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="heading-lg text-text-primary mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="heading-md text-text-primary mb-3 mt-8">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="heading-sm text-text-primary mb-2 mt-6">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="body-lg text-text-secondary mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-text-secondary body-md">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-text-secondary body-md">
              {children}
            </ol>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">
              {children}
            </strong>
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </AnnouncementDetailLayout>
  );
}
