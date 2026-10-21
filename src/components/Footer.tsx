import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  ArrowUpRight, 
  Lock,
  MessageCircle
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { resolveSafeImageUrl } from './SafeImage';
import { getGeneralWhatsAppLink } from '../utils/whatsapp';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, categories } = useStoreData();

  return (
    <footer className="bg-[#140F0C] text-[#FAF6F0] pt-20 pb-12 border-t border-[#2E2018] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 5-Column Luxury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-[#2C1E16]">
          
          {/* Col 1 & 2: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3.5">
              <img 
                src={resolveSafeImageUrl(settings.logo_url) || '/wood_care_logo.svg'} 
                alt={settings.brand_name || 'Wood Care Furniture'} 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/wood_care_logo.svg'; }}
                className="h-12 w-auto object-contain max-w-[160px] shrink-0 rounded-full border border-[#443227] bg-[#1A130F] p-1 shadow-md"
              />
              <div>
                <span className="font-serif text-xl sm:text-2xl tracking-[0.12em] uppercase font-bold text-[#FAF6F0] block">
                  {settings.brand_name || 'WOOD CARE FURNITURE'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#C5A880] block mt-0.5 font-medium">
                  Rawalpindi & Islamabad, Pakistan
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed max-w-md font-light">
              {settings.footer_description || 'Generational solid hardwood furniture manufacturer in Shamsabad, Rawalpindi. Kiln-seasoned Sheesham, Burmese Teak, and bespoke luxury living suites.'}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#241A14] hover:bg-[#8C5D36] text-[#FAF6F0] flex items-center justify-center transition-all duration-300 border border-[#3E2B20] hover:scale-105"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-[#C5A880]" />
                </a>
              )}

              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#241A14] hover:bg-[#8C5D36] text-[#FAF6F0] flex items-center justify-center transition-all duration-300 border border-[#3E2B20] hover:scale-105"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-[#C5A880]" />
                </a>
              )}

              {settings.google_maps_url && (
                <a 
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#241A14] hover:bg-[#8C5D36] text-[#FAF6F0] flex items-center justify-center transition-all duration-300 border border-[#3E2B20] hover:scale-105"
                  aria-label="Google Maps Location"
                  title="Google Maps Location"
                >
                  <MapPin className="w-4 h-4 text-[#C5A880]" />
                </a>
              )}

              <a 
                href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#241A14] hover:bg-[#25D366] text-[#FAF6F0] hover:text-black flex items-center justify-center transition-all duration-300 border border-[#3E2B20] hover:scale-105"
                aria-label="WhatsApp Concierge"
                title="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] hover:text-black" />
              </a>
            </div>
          </div>

          {/* Col 3: Furniture Collections */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-[0.2em] uppercase text-[#C5A880]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300 font-light">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="hover:text-[#DFC06A] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button 
                  onClick={() => onNavigate('/custom')}
                  className="text-[#C5A880] hover:underline transition-colors text-left flex items-center gap-1 font-medium"
                >
                  <span>Custom Commissions</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Explore */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-[0.2em] uppercase text-[#C5A880]">
              The Atelier
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300 font-light">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-[#DFC06A] transition-colors">
                  Our Story & Values
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services')} className="hover:text-[#DFC06A] transition-colors">
                  Workshop Services Direct
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/gallery')} className="hover:text-[#DFC06A] transition-colors">
                  Completed Spaces Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/reviews')} className="hover:text-[#DFC06A] transition-colors">
                  Verified Client Reviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/blog')} className="hover:text-[#DFC06A] transition-colors">
                  Woodworking Guides & Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-[#DFC06A] transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Showroom & Visit */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold tracking-[0.2em] uppercase text-[#C5A880]">
              Shamsabad Showroom
            </h4>
            <div className="space-y-3 text-xs text-stone-300 leading-relaxed font-light">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>
                  {settings.address || 'M33J+C6H, Shamsabad, Rawalpindi'}
                  <br />Postal Code: {settings.postal_code || '46000'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a href={`tel:${settings.phone ? settings.phone.replace(/[^0-9+]/g, '') : ''}`} className="hover:text-[#DFC06A] transition-colors">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#DFC06A] transition-colors truncate">
                  {settings.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>{settings.opening_hours || 'Mon–Sat: 10:00 AM – 9:00 PM'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => onNavigate('/contact')}
                className="w-full text-center text-xs font-semibold tracking-wider uppercase text-white bg-[#8C5D36] hover:bg-[#6D4323] py-2.5 px-3.5 rounded-xl transition-all shadow-sm"
              >
                Plan Showroom Visit
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p className="font-light">
            {settings.copyright_text || `© ${new Date().getFullYear()} Wood Care Furniture. All rights reserved.`}
          </p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('/contact')} 
              className="hover:text-stone-200 transition-colors"
            >
              Shamsabad, Rawalpindi, Pakistan
            </button>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <button 
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1.5 text-stone-500 hover:text-[#C5A880] transition-colors"
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
