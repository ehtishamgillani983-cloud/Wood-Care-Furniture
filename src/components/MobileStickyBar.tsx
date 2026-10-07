import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { getGeneralWhatsAppLink } from '../utils/whatsapp';

export const MobileStickyBar: React.FC = () => {
  const { settings } = useStoreData();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#E6E1D6] px-4 py-2.5 shadow-lg">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <a
          href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
          className="flex-1 py-2.5 px-3 bg-[#2D241E] hover:bg-[#8A5A36] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-luxury active:scale-98"
        >
          <Phone className="w-3.5 h-3.5 text-[#B68D40]" />
          <span>Call Showroom</span>
        </a>

        <a
          href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-3 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-luxury active:scale-98 shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Inquiry</span>
        </a>
      </div>
    </div>
  );
};
