import React from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  MessageCircle, 
  Clock, 
  Calendar, 
  User, 
  Share2 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { getGeneralWhatsAppLink } from '../utils/whatsapp';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenPost: (slug: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigate, onOpenPost }) => {
  const { blogPosts, settings } = useStoreData();
  const post = blogPosts.find(b => b.slug === slug || b.id === slug);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 bg-[#15100D] text-[#FAF6F0]">
        <h2 className="font-serif text-3xl text-[#FAF6F0]">Article Not Found</h2>
        <button
          onClick={() => onNavigate('/blog')}
          className="px-6 py-2.5 bg-[#768A7D] text-white text-xs font-semibold rounded-xl"
        >
          Back to Guides & Journal
        </button>
      </div>
    );
  }

  const related = blogPosts.filter(b => b.id !== post.id).slice(0, 2);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 bg-[#15100D] text-[#FAF6F0]">
      
      {/* Breadcrumb - Centered */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <button onClick={() => onNavigate('/blog')} className="hover:text-white transition-colors">Blog</button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880] truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Header - BIGGER & IN MIDDLE */}
      <header className="max-w-3xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs text-[#C5A880] font-semibold">
          <span>{post.category}</span>
          <span aria-hidden="true">·</span>
          <span>{post.published_at}</span>
          <span aria-hidden="true">·</span>
          <span>{post.read_time}</span>
          <span aria-hidden="true">·</span>
          <span>By {post.author || 'Imran Shah'}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-stone-300 leading-relaxed italic border-l-2 border-[#C5A880] pl-4 max-w-2xl mx-auto text-left">
          "{post.excerpt}"
        </p>
      </header>

      {/* Featured Image */}
      <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl bg-[#221812] border border-[#443227]">
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-stone-300 leading-relaxed space-y-6 text-sm sm:text-base bg-[#221812] p-8 sm:p-12 rounded-3xl border border-[#443227]">
        <div className="whitespace-pre-line leading-relaxed font-sans">
          {post.content}
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#1A130F] border border-[#443227] text-center space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
          Want Expert Woodworking Advice?
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto">
          Contact our master craftsmen in Shamsabad directly to discuss wood seasoning, polish care, or bespoke home furniture.
        </p>
        <div className="pt-2">
          <a
            href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition-luxury"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
};
