import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${siteConfig.companyName}. Learn how we collect, use, and protect your information.`,
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          Privacy Policy
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="space-y-8 text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              Welcome to <strong>{siteConfig.companyName}</strong>. We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website, including any other media form, media channel, mobile website, or mobile application related or connected thereto.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">
              We may collect information about you in a variety of ways. The information we may collect on the site includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you request information about our products or contact us via our site.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the site.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respond to product inquiries, distributor applications, and customer support requests.</li>
              <li>Manage and deliver product catalogs, brochures, and related promotional materials.</li>
              <li>Monitor and analyze usage and trends to improve your experience with our website.</li>
              <li>Notify you of updates, new products, and other information related to {siteConfig.companyName}.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Disclosure of Your Information
            </h2>
            <p className="leading-relaxed">
              We do not sell, trade, or otherwise transfer your personally identifiable information to external third parties. We may share information we have collected about you in certain situations, such as when required by law or to protect rights, property, and safety.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions or comments about this Privacy Policy, please contact us using our contact form or the information listed in the footer of our website.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
