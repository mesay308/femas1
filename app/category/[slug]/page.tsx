import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';
import CategoryPageContent from './CategoryPageContent';

export const metadata: Metadata = {
  title: `Category | ${siteConfig.companyName}`,
  description: `Explore category solutions at ${siteConfig.companyName}.`,
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  return <CategoryPageContent slug={slug} />;
}
