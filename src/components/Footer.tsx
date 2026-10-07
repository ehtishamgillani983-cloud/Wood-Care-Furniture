import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  ArrowUpRight, 
  Lock 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { resolveSafeImageUrl } from './SafeImage';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, categories } = useStoreData();

  return (
    <footer className="bg-[#0E1524] text-[#FAF9F5] pt-16 pb-12 border-t border-[#1C263B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-[#1C263B]">
          
          {/* Col 1 & 2: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={resolveSafeImageUrl(settings.logo_url) || '/wood_care_logo.svg'} 
                alt={settings.brand_name || 'Woodgear Furniture'} 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/wood_care_logo.svg'; }}
                className="h-10 sm:h-12 w-auto object-contain max-w-[160px] shrink-0 rounded-lg shadow-2xs"
              />
              <div>
                <span className="font-serif text-xl sm:text-2xl tracking-wider uppercase font-semibold text-[#FAF9F5] block">
                  {settings.brand_name || 'WOODGEAR FURNITURE'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#D4AF37] block mt-0.5">
                  Rawalpindi & Islamabad, Pakistan
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed max-w-md pt-2">
              {settings.footer_description}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-3">
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2D241E] hover:bg-[#8A5A36] text-[#FAF9F5] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2D241E] hover:bg-[#8A5A36] text-[#FAF9F5] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}

              {settings.google_maps_url && (
                <a 
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2D241E] hover:bg-[#8A5A36] text-[#FAF9F5] flex items-center justify-center transition-colors"
                  aria-label="Google Maps Location"
                  title="Google Maps Location"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 3: Furniture Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#B68D40]">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button 
                  onClick={() => onNavigate('/custom')}
                  className="text-[#B68D40] hover:underline transition-colors text-left flex items-center gap-1"
                >
                  <span>Custom Orders</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Explore */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#B68D40]">
              Company & Guides
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  Our Story & Workshop
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/gallery')} className="hover:text-white transition-colors">
                  Completed Spaces Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/services')} className="hover:text-white transition-colors">
                  Manufacturing & Wholesale
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/videos')} className="hover:text-white transition-colors">
                  Inspiration Videos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/reviews')} className="hover:text-white transition-colors">
                  Client Reviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/blog')} className="hover:text-white transition-colors">
                  Wood & Furniture Guides
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Showroom & Visit */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#B68D40]">
              Showroom & Contact
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B68D40] shrink-0 mt-0.5" />
                <span>
                  {settings.address}
                  <br />Postal Code: {settings.postal_code}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B68D40] shrink-0" />
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B68D40] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors truncate">
                  {settings.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#B68D40] shrink-0" />
                <span>{settings.opening_hours}</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => onNavigate('/contact')}
                className="w-full text-center text-xs font-medium text-[#211B17] bg-[#FAF9F5] hover:bg-[#B68D40] hover:text-white py-2 px-3 rounded transition-colors"
              >
                Plan Showroom Visit
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>{settings.copyright_text}</p>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('/contact')} 
              className="hover:text-stone-200 transition-colors"
            >
              Shamsabad, Rawalpindi
            </button>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-300 transition-colors"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
