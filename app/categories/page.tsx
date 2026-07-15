import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';
import CategoriesPageContent from './CategoriesPageContent';

export const metadata: Metadata = {
  title: `Solutions Catalog | ${siteConfig.companyName}`,
  description: 'Explore our comprehensive range of solutions across all categories.',
};

export default function CategoriesPage() {
  return <CategoriesPageContent />;
}
