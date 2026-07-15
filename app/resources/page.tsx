import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';

export const metadata: Metadata = {
  title: `Resources & Care Guides | ${siteConfig.companyName}`,
  description: 'Care guides, specifications, and distributor documentation for the Femas product family.',
};

export default function ResourcesPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pt-32 pb-20">
      <div className="site-container text-center">
        <h1 className="typo-page-h1 text-slate-900 mb-8">Femas Resources &amp; <span className="text-brand-blue">Care Guides</span></h1>
        <p className="typo-hero-support text-slate-500 max-w-2xl mx-auto mb-12">
          Care guides, specifications, and distributor documentation for the Femas product family.
        </p>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h2 className="typo-section-h2 text-slate-900 mb-4">Library Coming Soon</h2>
          <p className="typo-card-desc text-slate-500">We&apos;re updating our library with new care guides and distributor sheets. Reach out for any urgent documentation.</p>
        </div>
      </div>
    </div>
  );
}
