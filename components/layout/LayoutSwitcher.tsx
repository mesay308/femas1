'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import api from '@/api/axios';
import siteConfig from '@/config/siteConfig';

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isLogin = pathname?.startsWith('/login');

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [brandReady, setBrandReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api.get('/profile')
      .then((res) => {
        if (cancelled || !res.data) return;
        const profile = res.data;

        // Update logo
        if (profile.logo_light) {
          let cleanPath = profile.logo_light.startsWith('/')
            ? profile.logo_light
            : `/${profile.logo_light}`;
          const base = process.env.NEXT_PUBLIC_API_URL || '';
          if (!process.env.NEXT_PUBLIC_API_URL) {
            if ((cleanPath.startsWith('/uploads') && !cleanPath.startsWith('/api/uploads')) ||
                (cleanPath.startsWith('/images') && !cleanPath.startsWith('/api/images'))) {
              cleanPath = `/api${cleanPath}`;
            }
          }
          setLogoUrl(base ? `${base}${cleanPath}` : cleanPath);
        }

        // Update CSS custom properties for brand colors
        if (profile.primary_color) {
          document.documentElement.style.setProperty('--brand-primary', profile.primary_color.trim());
        }
        if (profile.secondary_color) {
          document.documentElement.style.setProperty('--brand-secondary', profile.secondary_color.trim());
        }
      })
      .catch(() => {
        // Silently fall back to defaults
      })
      .finally(() => {
        if (!cancelled) setBrandReady(true);
      });

    return () => { cancelled = true; };
  }, []);

  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  // Split the brand name into letters for staggered entrance animation
  const brandName = siteConfig.companyName || 'Femas';
  const letters = Array.from(brandName);

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  } as const;

  const letterVariants = {
    initial: { opacity: 0, y: 40, scale: 0.6, rotate: -5 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotate: 0,
      transition: { 
        type: "spring",
        damping: 10,
        stiffness: 90
      }
    }
  } as const;

  const taglineVariants = {
    initial: { opacity: 0, y: 10, letterSpacing: "0.2em" },
    animate: { 
      opacity: 1, 
      y: 0, 
      letterSpacing: "0.3em",
      transition: { duration: 1.2, delay: 0.7, ease: "easeOut" } 
    }
  } as const;

  const progressVariants = {
    initial: { width: "0%" },
    animate: { 
      width: "100%", 
      transition: { duration: 2.2, delay: 0.2, ease: [0.4, 0, 0.2, 1] } 
    }
  } as const;

  return (
    <>
      <AnimatePresence mode="wait">
        {!brandReady && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.04,
              filter: "blur(12px)",
              transition: { duration: 0.75, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
          >
            {/* Elegant Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Primary Matte Black/Slate Glow */}
              <motion.div
                animate={{
                  x: [-30, 30, -30],
                  y: [-20, 20, -20],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#1a1a1a]/20 blur-[120px]"
              />
              {/* Secondary Aluminum Glow */}
              <motion.div
                animate={{
                  x: [30, -30, 30],
                  y: [20, -20, 20],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-[#C0C0C0]/15 blur-[130px]"
              />
              {/* Central Premium Texture Overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 select-none">
              
              {/* Staggered Brand Letters styled in Matura Font */}
              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="flex items-center gap-1 md:gap-2 mb-3 cursor-default"
              >
                {letters.map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="font-matura text-7xl md:text-8xl lg:text-9xl text-white tracking-wider inline-block select-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:text-brand-orange hover:scale-105 transition-colors duration-300"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              {/* Tagline */}
              <motion.div
                variants={taglineVariants}
                initial="initial"
                animate="animate"
                className="text-white/60 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] drop-shadow-sm select-none"
              >
                {siteConfig.companyTagline || "Premium Kitchen Solutions"}
              </motion.div>

              {/* High-Fidelity Loading Progress Bar */}
              <div className="mt-10 relative w-48 md:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  variants={progressVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-blue via-[#a855f7] to-brand-orange shadow-[0_0_8px_rgba(230,180,0,0.5)]"
                />
              </div>

              {/* Pulse ambient logo highlight */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 -z-10 rounded-full filter blur-3xl bg-gradient-to-r from-[#1a1a1a]/30 to-[#C0C0C0]/25 transform scale-[1.8]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Layout Wrapper */}
      <AnimatePresence>
        {brandReady && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen flex-grow flex flex-col"
          >
            <Header logoUrl={logoUrl} />
            <main className="flex-grow">
              {children}
            </main>
            <Footer logoUrl={logoUrl} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
