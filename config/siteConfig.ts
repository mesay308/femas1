/**
 * Site Configuration — Single Source of Truth
 * =============================================
 * Brand-neutral defaults. Override via .env.local or by populating the
 * site_settings / company_profile tables in the database.
 */

const siteConfig = {
  // --- Company Identity ---
  companyName:      process.env.NEXT_PUBLIC_COMPANY_NAME       || 'Femas',
  companyLegalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || 'Femas Kitchen Appliance',
  companyTagline:   process.env.NEXT_PUBLIC_COMPANY_TAGLINE    || 'Premium Kitchen Solutions',

  // --- Brand Colors (defaults match the actual Femas database values & globals.css) ---
  brandColorPrimary:   process.env.NEXT_PUBLIC_BRAND_PRIMARY   || '#1a1a1a',
  brandColorSecondary: process.env.NEXT_PUBLIC_BRAND_SECONDARY || '#C0C0C0',

  // --- Locale / Currency ---
  defaultLocale:   process.env.NEXT_PUBLIC_DEFAULT_LOCALE   || 'en',
  currencyCode:    process.env.NEXT_PUBLIC_CURRENCY_CODE    || 'ETB',
  currencySymbol:  process.env.NEXT_PUBLIC_CURRENCY_SYMBOL  || 'Br',

  // --- Site URL (used for SEO / OpenGraph / sitemap) ---
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export default siteConfig;
