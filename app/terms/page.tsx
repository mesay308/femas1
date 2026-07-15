import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${siteConfig.companyName}. Learn about our website usage terms and conditions.`,
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          Terms of Service
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="space-y-8 text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Agreement to Terms
            </h2>
            <p className="leading-relaxed">
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and <strong>{siteConfig.companyName}</strong>, concerning your access to and use of our website as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Intellectual Property Rights
            </h2>
            <p className="leading-relaxed">
              Unless otherwise indicated, the site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. User Representations
            </h2>
            <p className="leading-relaxed mb-4">
              By using the site, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All registration or contact information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update it as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You will not use the site for any illegal or unauthorized purpose.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Prohibited Activities
            </h2>
            <p className="leading-relaxed mb-4">
              You may not access or use the site for any purpose other than that for which we make the site available. Prohibited activities include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Systematically retrieving data or other content from the site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Circumventing, disabling, or otherwise interfering with security-related features of the site.</li>
              <li>Engaging in unauthorized framing of or linking to the site.</li>
              <li>Using any automated system, such as robots, spiders, or offline readers, to access the site.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Product Catalog & Descriptions
            </h2>
            <p className="leading-relaxed">
              We make every effort to display as accurately as possible the colors, features, specifications, and details of our products available on the site (including freestanding stoves, round ovens, custom cabinetry, etc.). However, we do not guarantee that the colors, features, specifications, and details of the products will be absolutely accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
