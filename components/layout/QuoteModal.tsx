'use client';

import { useState, useEffect } from 'react';
import { X, Send, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuoteModal = ({ isOpen, onClose }: QuoteModalProps) => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
    }
  }, [isOpen]);

  const primaryPhone = settings?.primary_phone || '';
  const telegramUrl = settings?.telegram_url || '#';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-brand-blue text-white p-6 relative">
              <h3 className="text-2xl font-bold mb-1">Project Quote / Partner Inquiry</h3>
              <p className="text-blue-100 text-sm">Tell us about your kitchen project or cabinetry dimensions, and our team will get back to you shortly.</p>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition" placeholder="Your Name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                    <input type="tel" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition" placeholder="+1 555 123 4567" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email (Optional)</label>
                  <input type="email" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition" placeholder="you@example.com" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Product / Service</label>
                  <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition">
                    <option>Femaslux 60x60 Freestanding Dual-Fuel Stove & Oven</option>
                    <option>Lux Compact Round Oven (1300W)</option>
                    <option>Femaslux 50x50 Freestanding Dual-Fuel Stove & Oven</option>
                    <option>Femaslux 60x90 Freestanding 6-Burner Dual-Fuel Stove & Oven</option>
                    <option>Femaslux 50x50 Freestanding All-Electric Stove & Oven</option>
                    <option>Premium Custom-Made Kitchen Cabinet System</option>
                    <option>Become a Retailer / Distributor</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none transition" placeholder="Details about your project..."></textarea>
                </div>

                <button type="button" className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20">
                  <Send size={18} /> Send Request
                </button>
              </form>

              {/* Alternative Contact */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-500 mb-3">Or contact us directly via:</p>
                <div className="flex justify-center gap-4">
                  {primaryPhone && (
                    <a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200 text-sm font-semibold">
                      <Phone size={16} className="text-brand-blue" /> {primaryPhone}
                    </a>
                  )}
                  {telegramUrl && telegramUrl !== '#' && (
                    <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-brand-blue text-sm font-semibold">
                      <MessageCircle size={16} /> Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;
