import siteConfig from '@/config/siteConfig';
import { resolveImageUrl } from '@/utils/imageUtils';

export function parseJsonSafe<T>(data: unknown, fallback: T): T {
    if (data == null || data === '') return fallback;
    if (typeof data === 'string') {
        try {
            return JSON.parse(data) as T;
        } catch {
            return fallback;
        }
    }
    return data as T;
}

function badgeStyle(label: string): 'primary' | 'secondary' {
    const t = label.toLowerCase();
    if (t.includes('new') || t.includes('best') || t.includes('featured') || t.includes('limited')) return 'primary';
    return 'secondary';
}

/** Build full image URL list: cover first, then gallery (deduped). */
export function buildProductImageUrls(cover: string | null | undefined, galleryRaw: unknown): string[] {
    const gallery = parseJsonSafe<string[]>(galleryRaw, []);
    const urls: string[] = [];
    const seen = new Set<string>();

    const push = (u: string) => {
        const abs = resolveImageUrl(u);
        if (!abs || seen.has(abs)) return;
        seen.add(abs);
        urls.push(abs);
    };

    if (cover) push(cover);
    gallery.filter((u) => typeof u === 'string' && u.trim()).forEach(push);
    return urls;
}

export function formatStockLabel(status: string | null | undefined): string {
    switch (status) {
        case 'in_stock':
            return 'In stock';
        case 'low_stock':
            return 'Low stock';
        case 'out_of_stock':
            return 'Out of stock';
        default:
            return 'Availability on request';
    }
}

export function mapApiProductToPage(p: Record<string, unknown>) {
    const galleryRaw = p.gallery_images;
    const images = buildProductImageUrls(p.cover_image_url as string | null, galleryRaw);

    const badgeList = parseJsonSafe<string[]>(p.badge, []);
    const badges = badgeList.map((text) => ({
        type: badgeStyle(text),
        text,
    }));

    const applications = parseJsonSafe<string[]>(p.applications, []);
    const documents = parseJsonSafe<unknown[]>(p.documents, []);
    const parsedDocs = documents.map((doc: unknown) => {
        const docUrl = typeof doc === 'string' ? doc : (doc as { url?: string; path?: string })?.url || (doc as { path?: string })?.path || '';
        const docTitle =
            typeof doc === 'string'
                ? doc.split('/').pop() || 'Document'
                : (doc as { title?: string; name?: string })?.title || (doc as { name?: string })?.name || 'Technical document';
        return {
            title: docTitle,
            url: resolveImageUrl(docUrl),
            meta: (doc as { meta?: string })?.meta || 'PDF',
        };
    });

    const videoUrls = parseJsonSafe<string[]>(p.video_urls, []).filter((v) => v && String(v).trim());

    const attrs = (p.attributes as Record<string, unknown>[] | undefined) || [];
    const specs = attrs.map((attr) => ({
        label: String(attr.name ?? ''),
        value:
            attr.value_text != null
                ? String(attr.value_text)
                : attr.value_number != null
                  ? `${attr.value_number}${attr.unit ? ` ${attr.unit}` : ''}`.trim()
                  : attr.value_boolean != null
                    ? String(attr.value_boolean) === 'true' ||
                        attr.value_boolean === true ||
                        Number(attr.value_boolean) === 1
                        ? 'Yes'
                        : 'No'
                    : '—',
    }));

    const slug = (p.slug as string) || (p.product_id as string);
    const price =
        p.base_price != null && Number(p.base_price) > 0
            ? `${siteConfig.currencySymbol} ${Number(p.base_price).toLocaleString()}`
            : null;

    return {
        id: slug,
        productId: p.product_id as string,
        title: String(p.name ?? 'Product'),
        sku: (p.sku as string) || '',
        slug,
        category: (p.category_name as string) || 'Kitchen Appliances',
        categorySlug: (p.category_slug as string) || '',
        brandName: (p.brand_name as string) || '',
        price,
        stockStatus: (p.stock_status as string) || 'in_stock',
        isFeatured: Boolean(p.is_featured),
        images,
        badges,
        applications,
        /** Same as applications — shown as “Ideal for” chips in overview */
        featureChips: applications,
        shortDescription: String(p.short_description ?? ''),
        description: String(p.detailed_description ?? ''),
        guideScope: String(p.guide_scope ?? ''),
        guideInstructionImages: parseJsonSafe<string[]>(p.guide_instruction_images, []),
        guideInstructionVideoUrls: parseJsonSafe<string[]>(p.guide_instruction_video_urls, []),
        showcaseVideoUrl: String(p.showcase_video_url ?? ''),
        specs,
        specsHighlights: specs.slice(0, 4),
        documents: parsedDocs,
        videoUrls,
        models: (p.models as Record<string, unknown>[]) || [],
        modelsPdfUrl: (p.models_list_pdf_url as string) || '',
        metaTitle: (p.meta_title as string) || '',
        metaDescription: (p.meta_description as string) || '',
    };
}

export function mapRelatedProduct(rp: Record<string, unknown>) {
    const imgs = buildProductImageUrls(rp.cover_image_url as string | null, rp.gallery_images);
    const badgeList = parseJsonSafe<string[]>(rp.badge, []);
    return {
        id: ((rp.slug as string) || (rp.product_id as string)) as string,
        title: String(rp.name ?? ''),
        sku: (rp.sku as string) || '',
        price:
            rp.base_price != null && Number(rp.base_price) > 0
                ? `${siteConfig.currencySymbol} ${Number(rp.base_price).toLocaleString()}`
                : null,
        images: imgs,
        badges: badgeList.map((b) => ({ type: badgeStyle(b), text: b })),
        benefits: parseJsonSafe<string[]>(rp.applications, []),
        applicationNote: String(rp.short_description ?? ''),
    };
}
