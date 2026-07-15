const db = require('../config/db');

// Safe parse helper
const safeParseJSON = (data, fallback = []) => {
    if (!data) return fallback;
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch (e) { return fallback; }
    }
    return data;
};

// Get all products with advanced filtering, searching, sorting, and pagination
exports.getProducts = async (req, res) => {
    try {
        const { 
            category_id, 
            brand_id,
            search, 
            min_price, 
            max_price, 
            sort = 'newest', 
            page = 1, 
            limit = 20 
        } = req.query;

        let query = 'SELECT * FROM products WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        // Filtering by category (including children)
        if (category_id) {
            const catIds = category_id.split(',').map(id => id.trim());
            const placeholders = catIds.map(() => `$${paramIndex++}`).join(', ');
            
            const catHierarchyQuery = `
                WITH RECURSIVE cat_tree AS (
                    SELECT category_id FROM categories WHERE category_id IN (${placeholders})
                    UNION ALL
                    SELECT c.category_id FROM categories c
                    JOIN cat_tree ct ON c.parent_category_id = ct.category_id
                )
                SELECT category_id FROM cat_tree
            `;
            query += ` AND category_id IN (${catHierarchyQuery})`;
            countQuery += ` AND category_id IN (${catHierarchyQuery})`;
            params.push(...catIds);
        }

        // Filtering by brand
        if (brand_id) {
            const brandIds = brand_id.split(',').map(id => id.trim());
            const placeholders = brandIds.map(() => `$${paramIndex++}`).join(', ');
            
            query += ` AND brand_id IN (${placeholders})`;
            countQuery += ` AND brand_id IN (${placeholders})`;
            params.push(...brandIds);
        }

        // Searching (name, short_description, sku)
        if (search) {
            query += ` AND (name LIKE $${paramIndex} OR short_description LIKE $${paramIndex + 1} OR sku LIKE $${paramIndex + 2})`;
            countQuery += ` AND (name LIKE $${paramIndex} OR short_description LIKE $${paramIndex + 1} OR sku LIKE $${paramIndex + 2})`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
            paramIndex += 3;
        }

        // Price Filtering
        if (min_price) {
            query += ` AND base_price >= $${paramIndex}`;
            countQuery += ` AND base_price >= $${paramIndex}`;
            params.push(parseFloat(min_price));
            paramIndex++;
        }
        if (max_price) {
            query += ` AND base_price <= $${paramIndex}`;
            countQuery += ` AND base_price <= $${paramIndex}`;
            params.push(parseFloat(max_price));
            paramIndex++;
        }

        // Only active products
        query += ` AND is_active = true`;
        countQuery += ` AND is_active = true`;

        // Sorting
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY base_price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY base_price DESC';
                break;
            case 'name_asc':
                query += ' ORDER BY name ASC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY created_at DESC';
                break;
        }

        // Pagination
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        const offset = (parsedPage - 1) * parsedLimit;

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        // params for limit and offset don't go into countQuery
        
        const countRes = await db.query(countQuery, params);
        const totalItems = parseInt(countRes.rows[0].count, 10);
        const totalPages = Math.ceil(totalItems / parsedLimit);

        params.push(parsedLimit, offset);

        const { rows } = await db.query(query, params);

        res.json({
            data: rows,
            pagination: {
                total: totalItems,
                page: parsedPage,
                limit: parsedLimit,
                totalPages
            }
        });
    } catch (err) {
        console.error('getProducts error:', err);
        res.status(500).json({ error: 'Server error while fetching products' });
    }
};

// Get single product
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(`
            SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            WHERE p.product_id = $1 OR p.slug = $2
        `, [id, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = rows[0];

        // Fetch product models
        const modelsRes = await db.query('SELECT * FROM product_models WHERE product_id = $1 ORDER BY display_order ASC', [product.product_id]);
        product.models = modelsRes.rows;

        // Fetch product attributes
        const attrsRes = await db.query(`
            SELECT pav.*, a.name, a.unit, a.type, a.options 
            FROM product_attribute_values pav 
            LEFT JOIN attributes a ON pav.attribute_id = a.attribute_id 
            WHERE pav.product_id = $1
        `, [product.product_id]);

        product.attributes = attrsRes.rows;

        res.json(product);
    } catch (err) {
        console.error('getProductById error:', err.message, err.code, err.sql);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, category_id, brand_id, base_price, description, short_description, stock_status, sku, is_featured, is_active, badge, video_url, video_urls, applications, documents, models, attributes, meta_title, meta_description, slug: frontendSlug, guide_scope } = req.body;

        let cover_image_url = req.body.cover_image_url || null;
        if (req.files && req.files['cover_image']) {
            cover_image_url = `/uploads/${req.files['cover_image'][0].filename}`;
        }
        const models_list_pdf_url = req.files && req.files['models_pdf'] ? `/uploads/${req.files['models_pdf'][0].filename}` : null;

        const galleryUrlsFromBody = safeParseJSON(req.body.gallery_image_urls, []);
        const uploadedGalleryPaths = req.files && req.files['gallery_images'] ? req.files['gallery_images'].map((f) => `/uploads/${f.filename}`) : [];
        const galleryFiles = Array.isArray(galleryUrlsFromBody)
            ? [...galleryUrlsFromBody, ...uploadedGalleryPaths]
            : uploadedGalleryPaths;

        const guideUrlsFromBody = safeParseJSON(req.body.guide_instruction_images, []);
        const uploadedGuidePaths = req.files && req.files['guide_images'] ? req.files['guide_images'].map((f) => `/uploads/${f.filename}`) : [];
        const guideInstructionImagesFinal = Array.isArray(guideUrlsFromBody) ? [...guideUrlsFromBody, ...uploadedGuidePaths] : uploadedGuidePaths;
        const guideVideoUrlsArr = safeParseJSON(req.body.guide_instruction_video_urls, []).filter((u) => typeof u === 'string' && u.trim());
        const showcaseVideoUrlRaw = (req.body.showcase_video_url || '').trim();
        const showcaseVideoUrl = showcaseVideoUrlRaw || null;

        const documentFiles = req.files && req.files['document_files'] ? req.files['document_files'].map(f => `/uploads/${f.filename}`) : [];

        // Slug handling: use frontend slug if provided, else generate from name
        let slug = frontendSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slugExists = true;
        let counter = 0;
        let originalSlug = slug;

        while (slugExists) {
            const slugCheck = await db.query('SELECT product_id FROM products WHERE slug = $1', [slug]);
            if (slugCheck.rows.length > 0) {
                // If it's the exact same slug as provided from frontend, we still check uniqueness
                counter++;
                slug = `${originalSlug}-${counter}`;
            } else {
                slugExists = false;
            }
        }

        const price = (base_price && !isNaN(parseFloat(base_price))) ? parseFloat(base_price) : 0;
        const featured = (is_featured === 'true' || is_featured === true);
        const stock = stock_status || 'in_stock';
        const catId = (category_id && category_id !== 'undefined' && category_id !== '') ? category_id : null;
        const brandId = (brand_id && brand_id !== 'undefined' && brand_id !== '') ? brand_id : null;

        let finalSku = sku;
        if (finalSku) {
            let skuExists = true;
            let skuCounter = 0;
            let originalSku = finalSku;

            while (skuExists) {
                const skuCheck = await db.query('SELECT product_id FROM products WHERE sku = $1', [finalSku]);
                if (skuCheck.rows.length > 0) {
                    skuCounter++;
                    finalSku = `${originalSku}-${skuCounter}`;
                } else {
                    skuExists = false;
                }
            }
        }

        const applicationsArr = safeParseJSON(applications, []);
        const badgeArr = safeParseJSON(badge, []);
        let videoUrlsArr = safeParseJSON(video_urls, []);
        if (video_url && !videoUrlsArr.includes(video_url)) videoUrlsArr.push(video_url); // Legacy compat
        const existingDocs = safeParseJSON(documents, []);
        const finalDocs = [...existingDocs, ...documentFiles];
        const modelsArr = safeParseJSON(models, []);

        const product_id = require('crypto').randomUUID();
        const active = (is_active === 'false' || is_active === false) ? false : true;

        const query = `
            INSERT INTO products (product_id, name, slug, category_id, brand_id, base_price, detailed_description, short_description, stock_status, cover_image_url, sku, is_featured, is_active, badge, video_urls, applications, documents, gallery_images, models_list_pdf_url, meta_title, meta_description, guide_scope, guide_instruction_images, guide_instruction_video_urls, showcase_video_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        `;
        const values = [
            product_id, name, slug, catId, brandId, price, description || '', short_description || '', stock,
            cover_image_url, finalSku || null, featured, active, JSON.stringify(badgeArr), JSON.stringify(videoUrlsArr),
            JSON.stringify(applicationsArr), JSON.stringify(finalDocs), JSON.stringify(galleryFiles), models_list_pdf_url,
            meta_title || null, meta_description || null, guide_scope || '',
            JSON.stringify(guideInstructionImagesFinal),
            JSON.stringify(guideVideoUrlsArr),
            showcaseVideoUrl
        ];

        await db.query(query, values);

        // Insert Models
        if (modelsArr && modelsArr.length > 0) {
            for (let i = 0; i < modelsArr.length; i++) {
                const m = modelsArr[i];
                if (!m.name) continue;
                const mId = require('crypto').randomUUID();
                await db.query(`
                    INSERT INTO product_models (model_id, product_id, name, model_number, key_spec, note, display_order)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [mId, product_id, m.name, m.model_number || '', m.key_spec || '', m.note || '', i]);
            }
        }

        // Insert Attributes
        const attrObj = safeParseJSON(attributes, {});
        for (const attr_id in attrObj) {
            const rawVal = attrObj[attr_id];
            if (rawVal === '' || rawVal === null) continue;

            let valText = null;
            let valNum = null;
            let valBool = null;

            if (typeof rawVal === 'boolean' || rawVal === 'true' || rawVal === 'false') {
                valBool = rawVal === 'true' || rawVal === true;
            } else if (!isNaN(rawVal) && rawVal !== '') {
                valNum = parseFloat(rawVal);
            } else {
                valText = String(rawVal);
            }

            const valId = require('crypto').randomUUID();
            await db.query(`
                INSERT INTO product_attribute_values (value_id, product_id, attribute_id, value_text, value_number, value_boolean)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [valId, product_id, attr_id, valText, valNum, valBool]);
        }

        const newProduct = await db.query('SELECT * FROM products WHERE product_id = $1', [product_id]);
        res.status(201).json(newProduct.rows[0]);
    } catch (err) {
        console.error("Create Product Error:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category_id, brand_id, base_price, description, short_description, stock_status, sku, slug, is_featured, is_active, badge, video_url, video_urls, applications, documents, models, removed_models, attributes, meta_title, meta_description, guide_scope } = req.body;

        let cover_image_url = req.body.cover_image_url;
        if (req.files && req.files['cover_image']) {
            cover_image_url = `/uploads/${req.files['cover_image'][0].filename}`;
        }

        let models_list_pdf_url = req.body.models_list_pdf_url;
        if (req.files && req.files['models_pdf']) {
            models_list_pdf_url = `/uploads/${req.files['models_pdf'][0].filename}`;
        }

        const applicationsArr = safeParseJSON(applications, []);
        const badgeArr = safeParseJSON(badge, []);
        let videoUrlsArr = safeParseJSON(video_urls, []);
        if (video_url && !videoUrlsArr.includes(video_url)) videoUrlsArr.push(video_url);

        const existingDocs = safeParseJSON(documents, []);
        const documentFiles = req.files && req.files['document_files'] ? req.files['document_files'].map(f => `/uploads/${f.filename}`) : [];
        const finalDocs = [...existingDocs, ...documentFiles];

        const uploadedGalleryPaths = req.files && req.files['gallery_images'] ? req.files['gallery_images'].map((f) => `/uploads/${f.filename}`) : [];
        const galleryUrlsFromBody = safeParseJSON(req.body.gallery_image_urls, null);
        const prevMediaRows = await db.query('SELECT gallery_images, guide_instruction_images FROM products WHERE product_id = $1', [id]);
        const previousGallery = safeParseJSON(prevMediaRows.rows[0]?.gallery_images, []);
        const previousGuide = safeParseJSON(prevMediaRows.rows[0]?.guide_instruction_images, []);
        const persistedGalleryUrls = Array.isArray(galleryUrlsFromBody)
            ? galleryUrlsFromBody
            : [...previousGallery];
        const finalGalleryImages = [...persistedGalleryUrls, ...uploadedGalleryPaths];

        const uploadedGuidePaths = req.files && req.files['guide_images'] ? req.files['guide_images'].map((f) => `/uploads/${f.filename}`) : [];
        const guideUrlsFromBody = safeParseJSON(req.body.guide_instruction_images, null);
        const persistedGuideUrls = Array.isArray(guideUrlsFromBody) ? guideUrlsFromBody : [...previousGuide];
        const finalGuideInstructionImages = [...persistedGuideUrls, ...uploadedGuidePaths];

        const guideVideoUrlsArr = safeParseJSON(req.body.guide_instruction_video_urls, []).filter((u) => typeof u === 'string' && u.trim());
        const showcaseVideoUrlRaw = (req.body.showcase_video_url || '').trim();
        const showcaseVideoUrl = showcaseVideoUrlRaw || null;

        const query = `
            UPDATE products 
            SET name = $1, category_id = $2, brand_id = $3, base_price = $4, detailed_description = $5, short_description = $6, stock_status = $7, cover_image_url = $8, sku = $9, is_featured = $10, is_active = $11, badge = $12, video_urls = $13, applications = $14, documents = $15, models_list_pdf_url = $16, slug = $17, meta_title = $18, meta_description = $19, guide_scope = $20, guide_instruction_images = $21, guide_instruction_video_urls = $22, showcase_video_url = $23, updated_at = NOW()
            WHERE product_id = $24
        `;
        const values = [
            name, category_id || null, brand_id || null, base_price || 0, description || '', short_description || '',
            stock_status || 'in_stock', cover_image_url, sku || null, is_featured === 'true' || is_featured === true,
            (is_active === 'false' || is_active === false) ? false : true,
            JSON.stringify(badgeArr), JSON.stringify(videoUrlsArr), JSON.stringify(applicationsArr), JSON.stringify(finalDocs),
            models_list_pdf_url, slug, meta_title || null, meta_description || null, guide_scope || '',
            JSON.stringify(finalGuideInstructionImages),
            JSON.stringify(guideVideoUrlsArr),
            showcaseVideoUrl,
            id
        ];

        const { rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Handle Models
        const modelsArr = safeParseJSON(models, []);
        const removedModelsArr = safeParseJSON(removed_models, []);

        if (removedModelsArr.length > 0) {
            for (const rmId of removedModelsArr) {
                await db.query('DELETE FROM product_models WHERE model_id = $1', [rmId]);
            }
        }

        for (let i = 0; i < modelsArr.length; i++) {
            const m = modelsArr[i];
            if (!m.name) continue;
            if (m.model_id && !m.model_id.startsWith('new-')) {
                await db.query(`
                    UPDATE product_models 
                    SET name = $1, model_number = $2, key_spec = $3, note = $4, display_order = $5
                    WHERE model_id = $6
                `, [m.name, m.model_number || '', m.key_spec || '', m.note || '', i, m.model_id]);
            } else {
                const mId = require('crypto').randomUUID();
                await db.query(`
                    INSERT INTO product_models (model_id, product_id, name, model_number, key_spec, note, display_order)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [mId, id, m.name, m.model_number || '', m.key_spec || '', m.note || '', i]);
            }
        }

        // Handle Attributes
        const attrObj = safeParseJSON(attributes, {});
        // Simplest strategy: delete all existing and re-insert
        await db.query('DELETE FROM product_attribute_values WHERE product_id = $1', [id]);
        for (const attr_id in attrObj) {
            const rawVal = attrObj[attr_id];
            if (rawVal === '' || rawVal === null) continue;

            let valText = null;
            let valNum = null;
            let valBool = null;

            if (typeof rawVal === 'boolean' || rawVal === 'true' || rawVal === 'false') {
                valBool = rawVal === 'true' || rawVal === true;
            } else if (!isNaN(rawVal) && rawVal !== '') {
                valNum = parseFloat(rawVal);
            } else {
                valText = String(rawVal);
            }

            const valId = require('crypto').randomUUID();
            await db.query(`
                INSERT INTO product_attribute_values (value_id, product_id, attribute_id, value_text, value_number, value_boolean)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [valId, id, attr_id, valText, valNum, valBool]);
        }

        await db.query('UPDATE products SET gallery_images = $1 WHERE product_id = $2', [
            JSON.stringify(finalGalleryImages),
            id,
        ]);

        const updatedProduct = await db.query('SELECT * FROM products WHERE product_id = $1', [id]);
        res.json(updatedProduct.rows[0]);
    } catch (err) {
        console.error("Update Product Error:", err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await db.query('DELETE FROM products WHERE product_id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
