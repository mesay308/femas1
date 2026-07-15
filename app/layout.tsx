import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import LayoutSwitcher from '@/components/layout/LayoutSwitcher';
import siteConfig from '@/config/siteConfig';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.companyTagline
      ? `${siteConfig.companyName} | ${siteConfig.companyTagline}`
      : siteConfig.companyName,
    template: `%s | ${siteConfig.companyName}`,
  },
  description: siteConfig.companyTagline,
  authors: [{ name: siteConfig.companyName }],
  creator: siteConfig.companyName,
  publisher: siteConfig.companyName,
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    url: siteConfig.siteUrl,
    siteName: siteConfig.companyName,
    title: siteConfig.companyName,
    description: siteConfig.companyTagline,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.companyName,
    description: siteConfig.companyTagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use static defaults — brand colors and logo are loaded client-side
  // via LayoutSwitcher which fetches /profile on mount. This eliminates
  // the SSR → API dependency that breaks Vercel deployments.
  const brandPrimary = siteConfig.brandColorPrimary;
  const brandSecondary = siteConfig.brandColorSecondary;

  // Build Organization JSON-LD with static defaults
  const orgJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.companyName,
    url: siteConfig.siteUrl,
    logo: '/logo.png',
  };

  return (
    <html
      lang={siteConfig.defaultLocale}
      className={`${inter.variable} ${fraunces.variable} antialiased`}
      suppressHydrationWarning
      style={{
        // @ts-ignore
        '--brand-primary': brandPrimary,
        '--brand-secondary': brandSecondary,
      }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,am,om,tr',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script 
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
        <AuthProvider>
          <LayoutSwitcher>{children}</LayoutSwitcher>
        </AuthProvider>
      </body>
    </html>
  );
}
