import React from 'react';
import { ChevronRight, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { SafeImage } from '../components/SafeImage';

interface BlogPageProps {
  onNavigate: (path: string) => void;
  onOpenPost: (slug: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, onOpenPost }) => {
  const { blogPosts } = useStoreData();
  const published = blogPosts.filter(b => b.is_published);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 bg-[#15100D] text-[#FAF6F0]">
      
      {/* Breadcrumb - Centered */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880]">Furniture Guides & Articles</span>
      </nav>

      {/* Header - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          WOODWORKING JOURNAL
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          Guides & Articles
        </h1>
        <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Expert recommendations on seasoned Sheesham wood, Burmese Teak, sofa ergonomics, and preserving fine furniture in Rawalpindi & Islamabad.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {published.map(post => (
          <article
            key={post.id}
            onClick={() => onOpenPost(post.slug)}
            className="group bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-luxury flex flex-col justify-between hover:border-[#768A7D]"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-[#15100D]">
              <SafeImage
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#C5A880] font-semibold">
                  <span>{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.read_time}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-400">{post.published_at}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0] group-hover:text-[#C5A880] transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#443227] flex items-center justify-between">
                <span className="text-xs text-stone-400">By {post.author || 'Imran Shah'}</span>
                <span className="text-xs font-semibold text-[#768A7D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Article →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
