import React, { useState } from 'react';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send, 
  Check, 
  Instagram, 
  Facebook, 
  ArrowUpRight 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { Store } from '../services/store';
import { createWhatsAppLink, getGeneralWhatsAppLink } from '../utils/whatsapp';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { settings } = useStoreData();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    interest: 'Living Room Furniture',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    Store.submitLead({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      email: formData.email,
      interest: formData.interest,
      message: formData.message,
      source_page: 'contact-page'
    });

    setSubmitted(true);
  };

  const getWhatsAppDirectLink = () => {
    const msg = `Hi ${settings.brand_name}, I am reaching out from your website contact page.\nName: ${formData.name || 'Visitor'}\nPhone: ${formData.phone || 'N/A'}\nMessage: ${formData.message || 'I would like to visit the showroom or discuss custom furniture.'}`;
    return createWhatsAppLink(settings.whatsapp, msg);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 bg-[#15100D] text-[#FAF6F0]">
      
      {/* Breadcrumb - Centered */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880]">Contact & Showroom</span>
      </nav>

      {/* Header - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          SHOWROOM & MANUFACTURING WORKSHOP
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          Visit or Contact Us
        </h1>
        <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
          We invite you to touch our solid wood grains, test ergonomics, or discuss bespoke blueprints at our facility in Shamsabad, Rawalpindi.
        </p>
      </div>

      {/* Main Grid: Details Left, Contact Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Info Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl p-8 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
              Showroom Location & Timings
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-stone-300">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Physical Address</strong>
                  <span>{settings.address || 'M33J+C6H, Shamsabad, Rawalpindi, Pakistan (46000)'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Showroom & Workshop Hours</strong>
                  <span>{settings.opening_hours || 'Monday – Sunday: 9:00 AM – 9:00 PM (Daily)'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block font-semibold mb-0.5">WhatsApp Master Artisan</strong>
                  <span>{settings.whatsapp || '+92 332 5099930'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Direct Showroom Phone</strong>
                  <span>{settings.phone || '+92 332 5099930'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F0] block font-semibold mb-0.5">Email Support</strong>
                  <span>{settings.email || 'imranshah1984@gmail.com'}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="pt-2 border-t border-[#443227]">
              <a
                href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-2xl transition-luxury flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>Chat Instantly on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#221812] border border-[#443227] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0]">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              Leave your inquiry below. Our team in Shamsabad will get back to you promptly.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-[#1A130F] rounded-2xl border border-[#768A7D] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#768A7D]/30 text-[#768A7D] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">Message Sent Successfully!</h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                Thank you {formData.name}. We will review your inquiry and reply via WhatsApp or phone call.
              </p>
              <div className="pt-2">
                <a
                  href={getWhatsAppDirectLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-black text-xs font-bold rounded-xl"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Direct Chat</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-200 font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Qureshi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                <div>
                  <label className="block text-stone-200 font-medium mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +92 332 5099930"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-200 font-medium mb-1">Area of Interest</label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                >
                  <option value="Living Room Sofas & Sectionals">Living Room Sofas & Sectionals</option>
                  <option value="Solid Sheesham Master Beds">Solid Sheesham Master Beds</option>
                  <option value="Dining Tables & Chairs">Dining Tables & Chairs</option>
                  <option value="Executive Office Furniture">Executive Office Furniture</option>
                  <option value="Custom Architectural Woodworking">Custom Architectural Woodworking</option>
                  <option value="Commercial / Wholesale Furnishing">Commercial / Wholesale Furnishing</option>
                  <option value="Showroom Visit Appointment">Showroom Visit Appointment</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-200 font-medium mb-1">Message / Requirements</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the dimensions, wood preferences, or questions you have..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-2xl transition-colors shadow-lg text-sm"
              >
                Send Message to Showroom
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Embedded Google Map */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-bold block">
            LOCATION MAP
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
            Find Us in Shamsabad, Rawalpindi
          </h2>
        </div>

        <div className="rounded-3xl overflow-hidden border border-[#443227] h-80 sm:h-96 w-full shadow-2xl bg-[#15100D]">
          <iframe
            title="Wood Care Furniture Google Maps Location"
            src="https://maps.google.com/maps?q=Shamsabad%20Rawalpindi&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 grayscale contrast-125 opacity-90"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
