import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  HelpCircle 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { getGeneralWhatsAppLink } from '../utils/whatsapp';

interface FAQPageProps {
  onNavigate: (path: string) => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const { faqs, settings } = useStoreData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id || null);

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = selectedCategory === 'All'
    ? faqs.filter(f => f.is_active !== false)
    : faqs.filter(f => f.is_active !== false && f.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 bg-[#15100D] text-[#FAF6F0]">
      
      {/* Breadcrumb - Centered */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880]">FAQ</span>
      </nav>

      {/* Header - BIGGER & IN MIDDLE */}
      <div className="text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          QUESTIONS & ANSWERS
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Clear answers regarding solid timber seasoning, bespoke manufacturing, delivery across the Twin Cities, and showroom visits.
        </p>
      </div>

      {/* Category Pills - Centered */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#768A7D] text-white shadow-md'
                : 'bg-[#221812] text-stone-300 hover:text-white hover:bg-[#2A1D16] border border-[#443227]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-4">
        {filteredFaqs.map(faq => {
          const isExpanded = expandedId === faq.id;
          return (
            <div 
              key={faq.id}
              className="bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold block">
                    {faq.category}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF6F0]">
                    {faq.question}
                  </h3>
                </div>
                <div className="p-2 rounded-full bg-[#15100D] border border-[#443227] text-stone-300 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#C5A880]" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-[#443227]/50 mt-1">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions CTA */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#221812] border border-[#443227] text-center space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
          Have a Specific Custom Furniture Query?
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
          Chat directly with our master woodcraftsman on WhatsApp to discuss wood grains, foam grades, or request a showroom visit.
        </p>
        <div className="pt-2">
          <a
            href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition-luxury"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>Chat on WhatsApp Directly</span>
          </a>
        </div>
      </div>
    </div>
  );
};
