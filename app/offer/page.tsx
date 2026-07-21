import OfferClient from './OfferClient';

export const metadata = {
  title: 'Femaslux Kitchen Appliance - Proposal',
  description: 'Digital Marketing & Website Development Proposal',
};

export default function OfferPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <OfferClient />
    </main>
  );
}
