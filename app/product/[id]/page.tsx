import { Metadata } from 'next';
import siteConfig from '@/config/siteConfig';
import ProductPageContent from './ProductPageContent';

export const metadata: Metadata = {
    title: `Product | ${siteConfig.companyName}`,
    description: `Premium Turkish stoves, ovens, and custom cabinetry from ${siteConfig.companyName}.`,
};

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    return <ProductPageContent productId={id} />;
}
