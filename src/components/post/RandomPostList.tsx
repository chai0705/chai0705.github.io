import { useEffect, useState } from 'react';

export interface RandomPostItem {
  slug: string;
  link?: string;
  title: string;
  categoryName?: string;
}

interface Props {
  posts: RandomPostItem[];
  count?: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function RandomPostList({ posts, count = 5 }: Props) {
  const [displayPosts, setDisplayPosts] = useState<RandomPostItem[]>([]);

  useEffect(() => {
    const shuffled = shuffleArray(posts).slice(0, count);
    setDisplayPosts(shuffled);
  }, [posts, count]);

  // 初始渲染显示骨架
  if (displayPosts.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-foreground/80 text-2xl font-semibold">随机文章</h2>
        <div className="flex flex-col gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-md p-2">
              <span className="text-foreground/30 shrink-0 font-mono">{i + 1}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="bg-foreground/10 h-3 w-16 animate-pulse rounded" />
                <div className="bg-foreground/10 h-4 w-full animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-foreground/80 text-2xl font-semibold">随机文章</h2>
      <div className="flex flex-col gap-2">
        {displayPosts.map((post, index) => (
          <a
            key={post.slug}
            href={`/post/${post.link ?? post.slug}`}
            className="group hover:text-primary hover:bg-foreground/5 flex gap-3 rounded-md p-2 text-sm transition-colors duration-300"
          >
            <span className="text-foreground/30 shrink-0 font-mono">{index + 1}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              {post.categoryName && <div className="text-foreground/50 truncate text-xs">{post.categoryName}</div>}
              <div className="text-foreground/80 group-hover:text-primary line-clamp-2 transition-colors">{post.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
