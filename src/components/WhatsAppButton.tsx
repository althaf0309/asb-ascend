import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => (
  <a
    href="https://wa.me/918714773304?text=Hi%20ASB%20Training%20Hub%2C%20I%20would%20like%20to%20know%20more%20about%20your%20courses."
    target="_blank"
    rel="noopener noreferrer"
    title="Chat with ASB Training Hub on WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-800 hover:shadow-xl animate-pulse-glow"
    aria-label="WhatsApp Us - chat with ASB Training Hub"
    style={{ boxShadow: '0 0 20px hsla(142, 71%, 45%, 0.4)' }}
  >
    <MessageCircle className="h-6 w-6" aria-hidden />
    <span className="hidden sm:inline">WhatsApp Us</span>
  </a>
);

export default WhatsAppButton;
