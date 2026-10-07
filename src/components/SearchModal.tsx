import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Heart } from 'lucide-react';
import { useStoreData, useWishlist } from '../hooks/useStore';
import { SafeImage } from './SafeImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { products, categories, blogPosts } = useStoreData();
  const { toggle, isSaved } = useWishlist();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProducts = q
    ? products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      )
    : products.slice(0, 4);

  const filteredCategories = q
    ? categories.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    : [];

  const filteredArticles = q
    ? blogPosts.filter(b => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q))
    : [];

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF9F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E6E1D6] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E6E1D6] flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search sofas, beds, dining sets, teak, sheesham..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-base text-[#2D241E] focus:outline-none placeholder:text-stone-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-stone-400 hover:text-stone-600 px-1"
            >
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-6">
          
          {/* Categories matches */}
          {filteredCategories.length > 0 && (
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 block mb-2">
                Collections
              </span>
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(`/category/${cat.slug}`)}
                    className="p-3 bg-[#F4F1EA] hover:bg-[#EAE6DF] rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <span className="font-serif font-semibold text-sm text-[#2D241E]">{cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products matches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                {q ? `Furniture Results (${filteredProducts.length})` : 'Popular Pieces'}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">
                No furniture pieces matched "{query}". Try searching "sofa", "bed", or "dining".
              </p>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelect(`/product/${prod.slug}`)}
                    className="p-2 sm:p-3 hover:bg-[#F4F1EA] rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <SafeImage 
                        src={prod.main_image} 
                        alt={prod.name} 
                        className="w-14 h-14 rounded-lg object-cover bg-[#E6E1D6]"
                      />
                      <div>
                        <h4 className="font-serif text-sm sm:text-base font-semibold text-[#2D241E] group-hover:text-[#8A5A36] transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {prod.material.split('/')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#8A5A36] font-medium hidden sm:inline">
                        View Piece →
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(prod.id);
                        }}
                        className="p-1.5 hover:text-[#8A5A36] transition-colors"
                        title="Save to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isSaved(prod.id) ? 'fill-[#8A5A36] text-[#8A5A36]' : 'text-stone-400'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Articles matches */}
          {filteredArticles.length > 0 && (
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 block mb-2">
                Articles & Furniture Guides
              </span>
              <div className="space-y-2">
                {filteredArticles.map(art => (
                  <button
                    key={art.id}
                    onClick={() => handleSelect(`/blog/${art.slug}`)}
                    className="w-full p-3 bg-[#F4F1EA] hover:bg-[#EAE6DF] rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-serif font-semibold text-sm text-[#2D241E] block">{art.title}</span>
                      <span className="text-xs text-stone-500">{art.read_time}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer tip */}
        <div className="p-3 bg-[#F4F1EA] border-t border-[#E6E1D6] text-center text-xs text-stone-500">
          Press <kbd className="px-1.5 py-0.5 bg-white border border-[#E6E1D6] rounded text-[10px]">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};
