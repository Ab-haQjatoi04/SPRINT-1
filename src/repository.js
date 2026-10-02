const { pool } = require('./db');

function db() { if (!pool) throw new Error('DATABASE_URL is not configured'); return pool; }

async function createCategory(input) {
  const { rows } = await db().query('INSERT INTO categories (name, slug, parent_id, is_active) VALUES ($1,$2,$3,$4) RETURNING *', [input.name, input.slug, input.parent_id ?? null, input.is_active ?? true]);
  return rows[0];
}
async function listCategories() { const { rows } = await db().query('SELECT * FROM categories ORDER BY id'); return rows; }
async function updateCategory(id, input) {
  const { rows } = await db().query('UPDATE categories SET name=COALESCE($1,name), slug=COALESCE($2,slug), parent_id=COALESCE($3,parent_id), is_active=COALESCE($4,is_active), updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *', [input.name ?? null,input.slug ?? null,input.parent_id ?? null,input.is_active ?? null,id]);
  return rows[0];
}
async function createProduct(input) {
  const { rows } = await db().query('INSERT INTO products (category_id,name,slug,description,status) VALUES ($1,$2,$3,$4,$5) RETURNING *', [input.category_id,input.name,input.slug,input.description ?? '',input.status ?? 'draft']);
  return rows[0];
}
async function updateProduct(id,input) {
  const { rows } = await db().query('UPDATE products SET category_id=COALESCE($1,category_id),name=COALESCE($2,name),slug=COALESCE($3,slug),description=COALESCE($4,description),status=COALESCE($5,status),updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',[input.category_id ?? null,input.name ?? null,input.slug ?? null,input.description ?? null,input.status ?? null,id]); return rows[0];
}
async function listProducts() { const { rows } = await db().query('SELECT * FROM products ORDER BY id'); return rows; }
async function createVariant(productId,input) { const { rows } = await db().query('INSERT INTO variants(product_id,name,option_values,is_active) VALUES($1,$2,$3,$4) RETURNING *',[productId,input.name,JSON.stringify(input.option_values||{}),input.is_active ?? true]); return rows[0]; }
async function listVariants(productId) { const { rows } = await db().query('SELECT * FROM variants WHERE product_id=$1 ORDER BY id',[productId]); return rows; }
async function updateVariant(id,input) { const { rows } = await db().query('UPDATE variants SET name=COALESCE($1,name),option_values=COALESCE($2,option_values),is_active=COALESCE($3,is_active) WHERE id=$4 RETURNING *',[input.name ?? null,input.option_values ? JSON.stringify(input.option_values) : null,input.is_active ?? null,id]); return rows[0]; }
async function deactivateVariant(id) { const { rows } = await db().query('UPDATE variants SET is_active=FALSE WHERE id=$1 RETURNING *',[id]); return rows[0]; }
async function createSku(productId,input) {
  const { rows } = await db().query('INSERT INTO skus(product_id,variant_id,sku_code,price,stock_quantity,is_active) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[productId,input.variant_id ?? null,input.sku_code,input.price,input.stock_quantity,input.is_active ?? true]); return rows[0];
}
async function updateSku(id,input) { const { rows } = await db().query('UPDATE skus SET price=COALESCE($1,price),stock_quantity=COALESCE($2,stock_quantity),is_active=COALESCE($3,is_active),updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *',[input.price ?? null,input.stock_quantity ?? null,input.is_active ?? null,id]); return rows[0]; }
async function listSkus(productId) { const { rows } = await db().query(productId ? 'SELECT * FROM skus WHERE product_id=$1 ORDER BY id' : 'SELECT * FROM skus ORDER BY id', productId ? [productId] : []); return rows; }
async function deactivateProduct(id) { const { rows } = await db().query("UPDATE products SET status='archived',updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *",[id]); return rows[0]; }
async function deactivateCategory(id) { const { rows } = await db().query('UPDATE categories SET is_active=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *',[id]); return rows[0]; }
async function deactivateSku(id) { const { rows } = await db().query('UPDATE skus SET is_active=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=$1 RETURNING *',[id]); return rows[0]; }
module.exports = { createCategory,listCategories,updateCategory,createProduct,updateProduct,listProducts,createVariant,listVariants,updateVariant,deactivateVariant,createSku,updateSku,listSkus,deactivateProduct,deactivateCategory,deactivateSku };
