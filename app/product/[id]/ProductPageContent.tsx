'use client';

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductTabs from '@/components/product/ProductTabs';
import WhyUsMini from '@/components/product/WhyUsMini';
import RelatedProducts from '@/components/product/RelatedProducts';
import PageSkeleton from '@/components/shared/PageSkeleton';
import siteConfig from '@/config/siteConfig';
import { mapApiProductToPage, mapRelatedProduct } from '@/lib/mapPublicProduct';

interface ProductPageContentProps {
    productId: string;
}

export default function ProductPageContent({ productId }: ProductPageContentProps) {
    const [product, setProduct] = useState<ReturnType<typeof mapApiProductToPage> | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ReturnType<typeof mapRelatedProduct>[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchProduct() {
            try {
                const res = await api.get(`/products/${productId}`);
                if (cancelled) return;

                const p = res.data as Record<string, unknown>;
                const mapped = mapApiProductToPage(p);
                setProduct(mapped);

                // Update page title dynamically
                document.title = `${mapped.title} | ${siteConfig.companyName}`;

                // Fetch related products
                if (p.category_id) {
                    try {
                        const relRes = await api.get(`/products?category_id=${p.category_id}&limit=12`);
                        if (!cancelled) {
                            const relData = relRes.data.data || relRes.data;
                            const related = (Array.isArray(relData) ? relData : [])
                                .filter((rp: Record<string, unknown>) => rp.product_id !== p.product_id)
                                .slice(0, 4)
                                .map((rp: Record<string, unknown>) => mapRelatedProduct(rp));
                            setRelatedProducts(related);
                        }
                    } catch { /* ignore */ }
                }
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchProduct();
        return () => { cancelled = true; };
    }, [productId]);

    if (loading) {
        return <PageSkeleton message="Loading product..." />;
    }

    if (notFound || !product) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Product Not Found</h1>
                    <p className="text-slate-600">The requested product could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
                <div className="site-container py-2">
                    <ProductBreadcrumb
                        category={product.category}
                        categorySlug={product.categorySlug}
                        productName={product.title}
                    />
                </div>
            </div>

            <div className="site-container py-8 md:py-12">
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm min-w-0 md:rounded-[2.5rem] md:p-10">
                    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/40 to-sky-50/30 p-5 shadow-inner md:rounded-[2.5rem] md:p-8 lg:p-10">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-blue/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:gap-14">
                            <ProductGallery images={product.images} title={product.title} />
                            <ProductInfo product={product} />
                        </div>
                    </div>

                    <div className="mt-12 border-t border-slate-100 pt-10 md:mt-14 md:pt-12">
                        <ProductTabs
                            description={product.description}
                            featureChips={product.featureChips}
                            documents={product.documents}
                            models={product.models}
                            videoUrls={product.videoUrls}
                            showcaseVideoUrl={product.showcaseVideoUrl}
                            guideInstructionVideoUrls={product.guideInstructionVideoUrls}
                            galleryImages={product.images}
                            guideScope={product.guideScope}
                            guideInstructionImages={product.guideInstructionImages}
                        />
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="site-container pb-12">
                    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:rounded-[2.5rem] md:p-10">
                        <RelatedProducts products={relatedProducts} />
                    </div>
                </div>
            )}

            <div className="site-container">
                <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:rounded-[2.5rem] md:p-10">
                    <WhyUsMini />
                </div>
            </div>
        </div>
    );
}
