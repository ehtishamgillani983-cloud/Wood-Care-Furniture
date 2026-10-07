import React from 'react';
import { 
  ChevronRight, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  Hammer, 
  Users, 
  MessageCircle, 
  ArrowRight,
  Check
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { SafeImage } from '../components/SafeImage';
import { getGeneralWhatsAppLink } from '../utils/whatsapp';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings } = useStoreData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 bg-[#1A130F] text-[#FAF6F0]">
      
      {/* Breadcrumb */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-[#FAF6F0] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880]">About Us</span>
      </nav>

      {/* Hero Editorial - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          HERITAGE & CRAFTSMANSHIP
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] leading-tight">
          About Us
        </h1>
        <p className="text-base sm:text-xl text-stone-300 leading-relaxed pt-2 max-w-2xl mx-auto">
          Dedicated to the art of solid wood living in Rawalpindi & Islamabad. Handcrafted by master woodworkers with generational expertise.
        </p>
      </div>

      {/* Large Featured Visual */}
      <div className="relative aspect-[16/8] rounded-3xl overflow-hidden shadow-2xl bg-[#160F0C] border border-[#443227]">
        <SafeImage
          src="/images/hero_luxury_living.jpg"
          alt="Wood Care Furniture Workshop and Showroom"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-6 sm:p-12 text-white">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold block mb-1">
              Shamsabad Workshop & Showroom
            </span>
            <p className="font-serif text-xl sm:text-3xl font-normal leading-snug">
              "Every curve, joint, and hand-rubbed oil coat reflects our passion for enduring craftsmanship."
            </p>
          </div>
        </div>
      </div>

      {/* Our Story & Values */}
      <div className="space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-bold block">
            MANUFACTURER ADVANTAGE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FAF6F0]">
            Direct Manufacturer. Generational Craftsmanship.
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto">
            Unlike retail traders who buy from third-party middlemen, Wood Care Furniture owns and operates its manufacturing workshop in Shamsabad, Rawalpindi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed bg-[#221812] p-8 sm:p-10 rounded-3xl border border-[#443227] flex flex-col justify-center">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0] text-center md:text-left">
              Bespoke Made to Measure
            </h3>
            <p>
              When you commission a dining set, an executive desk, or a curved sectional sofa from us, you deal directly with the master craftsmen who cut the timber, shape the joins, and tailor the upholstery.
            </p>
            <p>
              This direct relationship allows us to guarantee termite-seasoned wood, modify dimensions down to the inch, and accommodate specific architectural requirements for residences across Islamabad, DHA, Bahria Town, and Rawalpindi.
            </p>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed bg-[#221812] p-8 sm:p-10 rounded-3xl border border-[#443227] flex flex-col justify-center">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0] text-center md:text-left">
              Our Materials Philosophy
            </h3>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-1" />
                <div>
                  <strong className="text-[#FAF6F0] block">Kiln-Seasoned Solid Sheesham & Teak:</strong>
                  <span>Every plank is moisture-tested to withstand Twin Cities climatic shifts between monsoon humidity and dry winter chills.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-[#C5A880] shrink-0 mt-1" />
                <div>
                  <strong className="text-[#FAF6F0] block">High-Density Molty Cushioning:</strong>
                  <span>For sofas and dining seats, we only use genuine high-resilience Master cushioning that retains shape for 10+ years without sagging.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hammer className="w-5 h-5 text-[#C5A880] shrink-0 mt-1" />
                <div>
                  <strong className="text-[#FAF6F0] block">Traditional Mortise & Tenon Joinery:</strong>
                  <span>True joinery instead of lightweight staples or glue-only shortcuts ensures our beds and tables endure active daily family use.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production & Workshop Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[#241A14] border border-[#443227] p-8 sm:p-12 rounded-3xl">
        <div className="text-center space-y-1">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-[#C5A880] block">1984</span>
          <span className="text-xs sm:text-sm text-stone-400 font-medium">Generational Roots</span>
        </div>
        <div className="text-center space-y-1">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-[#C5A880] block">2,500+</span>
          <span className="text-xs sm:text-sm text-stone-400 font-medium">Bespoke Pieces Delivered</span>
        </div>
        <div className="text-center space-y-1">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-[#C5A880] block">100%</span>
          <span className="text-xs sm:text-sm text-stone-400 font-medium">Termite Seasoned Wood</span>
        </div>
        <div className="text-center space-y-1">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-[#C5A880] block">4.9 ★</span>
          <span className="text-xs sm:text-sm text-stone-400 font-medium">Customer Satisfaction</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-[#241A14] border border-[#443227] rounded-3xl p-8 sm:p-14 text-center space-y-6">
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
          Ready to Discuss Your Furniture Project?
        </h3>
        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
          Connect directly with Imran Shah on WhatsApp or visit our Shamsabad showroom to see wood seasoning and craftsmanship in person.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <button
            onClick={() => onNavigate('/custom')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2E211A] hover:bg-[#3E2C22] border border-[#443227] text-stone-200 rounded-xl text-xs sm:text-sm font-semibold"
          >
            Request Custom Furniture Quote →
          </button>
        </div>
      </div>

    </div>
  );
};
