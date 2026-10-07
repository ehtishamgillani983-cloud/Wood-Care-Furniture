import React from 'react';
import { 
  ChevronRight, 
  MessageCircle, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Hammer,
  Truck,
  Building2,
  Sparkles
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { createWhatsAppLink } from '../utils/whatsapp';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { services, settings } = useStoreData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 bg-[#15100D] text-[#FAF6F0]">
      
      {/* Breadcrumb - Centered */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880]">Our Services</span>
      </nav>

      {/* Header - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          FACTORY DIRECT CAPABILITIES
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          Bespoke Services
        </h1>
        <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
          From custom residential drawing room furniture to commercial wholesale projects across Rawalpindi and Islamabad, our master artisans deliver generational woodwork.
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-12">
        {services.map((service, index) => {
          const isEven = index % 2 === 1;
          const whatsAppLink = createWhatsAppLink(
            settings.whatsapp, 
            `Hi ${settings.brand_name}, I am interested in your "${service.title}" service. Please share details and custom options.`
          );

          return (
            <div 
              key={service.id}
              className="p-8 sm:p-12 rounded-3xl border border-[#443227] bg-[#221812] shadow-2xl space-y-8"
            >
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C5A880]">
                  SERVICE 0{index + 1}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF6F0]">
                  {service.title}
                </h2>
                {service.short_description && (
                  <p className="text-sm sm:text-base text-[#C5A880] font-medium">
                    {service.short_description}
                  </p>
                )}
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl mx-auto">
                  {service.description}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
                <div className="p-4 rounded-2xl bg-[#1A130F] border border-[#443227] text-center space-y-1">
                  <Hammer className="w-5 h-5 text-[#768A7D] mx-auto" />
                  <span className="font-semibold text-xs sm:text-sm text-[#FAF6F0] block">Master Joinery</span>
                  <span className="text-xs text-stone-400">Kiln Seasoned Hardwood</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#1A130F] border border-[#443227] text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-[#C5A880] mx-auto" />
                  <span className="font-semibold text-xs sm:text-sm text-[#FAF6F0] block">Quality Guaranteed</span>
                  <span className="text-xs text-stone-400">Termite-Proof Treated</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#1A130F] border border-[#443227] text-center space-y-1">
                  <Truck className="w-5 h-5 text-[#768A7D] mx-auto" />
                  <span className="font-semibold text-xs sm:text-sm text-[#FAF6F0] block">Twin Cities Delivery</span>
                  <span className="text-xs text-stone-400">Padded Assembly & Setup</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center pt-2">
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-luxury shadow-lg"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                  <span>Enquire on WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#1A130F] border border-[#443227] text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
          Need Custom Architectural Furniture?
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
          Bring your blueprints, Pinterest mood boards, or room dimensions directly to our Shamsabad workshop for custom consultations.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('/custom')}
            className="px-6 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-md"
          >
            Start Custom Order Design →
          </button>
        </div>
      </div>
    </div>
  );
};
