const { z } = require('zod');

const slug = z.string().trim().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must contain lowercase letters, numbers and hyphens');
const categorySchema = z.object({ name: z.string().trim().min(2).max(120), slug: slug.max(140), parent_id: z.number().int().positive().nullable().optional(), is_active: z.boolean().optional() });
const productSchema = z.object({ name: z.string().trim().min(2).max(180), slug, description: z.string().max(5000).optional(), status: z.enum(['draft','published','archived']).optional(), category_id: z.number().int().positive() });
const skuSchema = z.object({ sku_code: z.string().trim().min(2).max(80).regex(/^[A-Za-z0-9_-]+$/), price: z.number().finite().nonnegative(), stock_quantity: z.number().int().nonnegative(), variant_id: z.number().int().positive().nullable().optional(), is_active: z.boolean().optional() });
const variantSchema = z.object({ name: z.string().trim().min(1).max(120), option_values: z.record(z.string()).default({}), is_active: z.boolean().optional() });
module.exports = { categorySchema, productSchema, skuSchema, variantSchema };
