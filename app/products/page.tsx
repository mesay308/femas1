import { Metadata } from 'next';
import ProductsContent from './ProductsContent';
import siteConfig from '@/config/siteConfig';

export const metadata: Metadata = {
  title: `Product Catalog | ${siteConfig.companyName}`,
  description: 'Browse our full catalog of products and equipment.',
};

export default function ProductsPage() {
  return <ProductsContent />;
}
