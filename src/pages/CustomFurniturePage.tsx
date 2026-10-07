import React, { useState } from 'react';
import { 
  ChevronRight, 
  MessageCircle, 
  Check, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Send,
  Hammer,
  Ruler,
  Palette
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { Store } from '../services/store';
import { createWhatsAppLink } from '../utils/whatsapp';

interface CustomFurniturePageProps {
  onNavigate: (path: string) => void;
}

export const CustomFurniturePage: React.FC<CustomFurniturePageProps> = ({ onNavigate }) => {
  const { settings } = useStoreData();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    furnitureType: 'Custom Sectional Sofa',
    woodType: 'Solid Seasoned Sheesham Wood (Tahli)',
    dimensions: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    Store.submitLead({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      email: '',
      interest: `Custom Order: ${formData.furnitureType} (${formData.woodType})`,
      message: `Dimensions: ${formData.dimensions || 'Custom Size'}. Notes: ${formData.notes}`,
      source_page: 'custom-furniture'
    });

    setSubmitted(true);
  };

  const getDirectWhatsAppLink = () => {
    const msg = `Hi ${settings.brand_name}, I would like to order a custom piece.\nName: ${formData.name || 'Client'}\nItem: ${formData.furnitureType}\nWood: ${formData.woodType}\nDimensions: ${formData.dimensions || 'TBD'}\nNotes: ${formData.notes || 'Please consult me.'}`;
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
        <span className="font-semibold text-[#C5A880]">Custom Furniture Manufacturing</span>
      </nav>

      {/* Hero Editorial - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          MADE TO MEASURE
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          Custom Furniture
        </h1>
        <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Built to your exact room dimensions from seasoned solid hardwood. Send reference images, Pinterest pins, or architectural blueprints directly to our workshop.
        </p>

        <div className="pt-2">
          <a
            href={getDirectWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-luxury shadow-lg"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>Consult on WhatsApp Directly</span>
          </a>
        </div>
      </div>

      {/* 4-Step Custom Process - Centered & Big */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-bold block">
            HOW IT WORKS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF6F0]">
            The Bespoke Process
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-[#221812] border border-[#443227] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A130F] border border-[#768A7D]/40 text-[#768A7D] flex items-center justify-center mx-auto text-lg font-bold font-mono">
              01
            </div>
            <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">Share Your Vision</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Send Pinterest images, room sketches, or desired specifications via WhatsApp or our workshop visit.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#221812] border border-[#443227] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A130F] border border-[#768A7D]/40 text-[#768A7D] flex items-center justify-center mx-auto text-lg font-bold font-mono">
              02
            </div>
            <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">Wood & Polish Selection</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Select your seasoned timber (Sheesham, Teak, American Walnut) and inspect fabric swatches or polish finish.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#221812] border border-[#443227] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A130F] border border-[#768A7D]/40 text-[#768A7D] flex items-center justify-center mx-auto text-lg font-bold font-mono">
              03
            </div>
            <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">Master Crafting</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Our Shamsabad artisans cut, hand-carve, join, and polish your piece with generational mortise & tenon joinery.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#221812] border border-[#443227] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1A130F] border border-[#768A7D]/40 text-[#768A7D] flex items-center justify-center mx-auto text-lg font-bold font-mono">
              04
            </div>
            <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">Padded Delivery</h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Delivered safely to your residence across Rawalpindi & Islamabad with on-site professional assembly.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Consultation Form */}
      <div className="max-w-3xl mx-auto bg-[#221812] border border-[#443227] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
            Request a Custom Design Consultation
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            Submit your requirements below or chat with Imran Shah directly on WhatsApp.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 bg-[#1A130F] rounded-2xl border border-[#768A7D] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#768A7D]/30 text-[#768A7D] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">Inquiry Received!</h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
              Thank you {formData.name}. Our master craftsman will review your specifications and contact you on {formData.phone} shortly.
            </p>
            <div className="pt-2">
              <a
                href={getDirectWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-black text-xs font-bold rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open in WhatsApp Now</span>
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
                  placeholder="e.g. Tariq Mehmood"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-medium mb-1">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-200 font-medium mb-1">Furniture Type</label>
                <select
                  value={formData.furnitureType}
                  onChange={(e) => setFormData({ ...formData, furnitureType: e.target.value })}
                  className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                >
                  <option value="Custom Sectional Sofa">Custom Sectional Sofa</option>
                  <option value="Solid Sheesham Master Bed">Solid Sheesham Master Bed</option>
                  <option value="Luxury Dining Table & Chairs">Luxury Dining Table & Chairs</option>
                  <option value="Executive Teak Desk">Executive Teak Desk</option>
                  <option value="Sculptural Accent Chair">Sculptural Accent Chair</option>
                  <option value="Full House Interior Package">Full House Interior Package</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-200 font-medium mb-1">Preferred Wood Species</label>
                <select
                  value={formData.woodType}
                  onChange={(e) => setFormData({ ...formData, woodType: e.target.value })}
                  className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                >
                  <option value="Solid Seasoned Sheesham Wood (Tahli)">Solid Seasoned Sheesham Wood (Tahli)</option>
                  <option value="Golden Burma Teak">Golden Burma Teak</option>
                  <option value="American Walnut">American Walnut</option>
                  <option value="White Ash Wood">White Ash Wood</option>
                  <option value="Recommend Best Wood For Me">Recommend Best Wood For Me</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-200 font-medium mb-1">Room Dimensions or Approximate Size</label>
              <input
                type="text"
                placeholder="e.g. Living room wall is 12ft x 14ft, looking for an 11ft L-shape sectional"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
              />
            </div>

            <div>
              <label className="block text-stone-200 font-medium mb-1">Design Notes & Details</label>
              <textarea
                rows={3}
                placeholder="Describe fabric colors, wood finishes, or references..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3.5 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-2xl transition-colors shadow-lg text-sm"
            >
              Submit Custom Consultation Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
