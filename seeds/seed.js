require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function seed() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const c = new Client({connectionString:process.env.DATABASE_URL}); await c.connect();
  try {
    await c.query('BEGIN');
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 12);
    const admin = await c.query(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin') ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='admin' RETURNING id`, ['FreshCart Admin', process.env.ADMIN_EMAIL || 'admin@freshcart.local', password]);
    const root = await c.query(`INSERT INTO categories(name,slug,is_active) VALUES('Fresh Food','fresh-food',true) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`);
    const pantry = await c.query(`INSERT INTO categories(name,slug,parent_id,is_active) VALUES('Pantry','pantry',$1,true) ON CONFLICT(slug) DO UPDATE SET parent_id=EXCLUDED.parent_id,name=EXCLUDED.name RETURNING id`, [root.rows[0].id]);
    const drinks = await c.query(`INSERT INTO categories(name,slug,parent_id,is_active) VALUES('Beverages','beverages',$1,true) ON CONFLICT(slug) DO UPDATE SET parent_id=EXCLUDED.parent_id,name=EXCLUDED.name RETURNING id`, [root.rows[0].id]);
    const milk = await c.query(`INSERT INTO products(category_id,name,slug,description,status) VALUES($1,'Fresh Milk 1L','fresh-milk-1l','Pasteurized whole milk.','published') ON CONFLICT(slug) DO UPDATE SET category_id=EXCLUDED.category_id RETURNING id`, [drinks.rows[0].id]);
    const rice = await c.query(`INSERT INTO products(category_id,name,slug,description,status) VALUES($1,'Premium Basmati Rice','premium-basmati-rice','Long-grain basmati rice.','published') ON CONFLICT(slug) DO UPDATE SET category_id=EXCLUDED.category_id RETURNING id`, [pantry.rows[0].id]);
    const juice = await c.query(`INSERT INTO products(category_id,name,slug,description,status) VALUES($1,'Mango Juice','mango-juice','Mango fruit drink.','draft') ON CONFLICT(slug) DO UPDATE SET category_id=EXCLUDED.category_id RETURNING id`, [drinks.rows[0].id]);
    const riceSmall = await c.query(`INSERT INTO variants(product_id,name,option_values,is_active) VALUES($1,'1 kg', '{"weight":"1kg"}',true) ON CONFLICT(product_id,name) DO UPDATE SET option_values=EXCLUDED.option_values RETURNING id`, [rice.rows[0].id]);
    const riceUnavailable = await c.query(`INSERT INTO variants(product_id,name,option_values,is_active) VALUES($1,'10 kg', '{"weight":"10kg"}',true) ON CONFLICT(product_id,name) DO UPDATE SET option_values=EXCLUDED.option_values RETURNING id`, [rice.rows[0].id]);
    const riceLarge = await c.query(`INSERT INTO variants(product_id,name,option_values,is_active) VALUES($1,'5 kg', '{"weight":"5kg"}',true) ON CONFLICT(product_id,name) DO UPDATE SET option_values=EXCLUDED.option_values RETURNING id`, [rice.rows[0].id]);
    const milkSku = await c.query(`INSERT INTO skus(product_id,sku_code,price,stock_quantity,is_active) VALUES($1,'MILK-1L',320,50,true) ON CONFLICT(sku_code) DO UPDATE SET price=EXCLUDED.price,stock_quantity=EXCLUDED.stock_quantity RETURNING id`, [milk.rows[0].id]);
    const rice1 = await c.query(`INSERT INTO skus(product_id,variant_id,sku_code,price,stock_quantity,is_active) VALUES($1,$2,'RICE-1KG',420,35,true) ON CONFLICT(sku_code) DO UPDATE SET price=EXCLUDED.price,stock_quantity=EXCLUDED.stock_quantity RETURNING id`, [rice.rows[0].id,riceSmall.rows[0].id]);
    const rice5 = await c.query(`INSERT INTO skus(product_id,variant_id,sku_code,price,stock_quantity,is_active) VALUES($1,$2,'RICE-5KG',1850,10,true) ON CONFLICT(sku_code) DO UPDATE SET price=EXCLUDED.price,stock_quantity=EXCLUDED.stock_quantity RETURNING id`, [rice.rows[0].id,riceLarge.rows[0].id]);
    const juiceSku = await c.query(`INSERT INTO skus(product_id,sku_code,price,stock_quantity,is_active) VALUES($1,'JUICE-MANGO-1L',280,0,false) ON CONFLICT(sku_code) DO UPDATE SET price=EXCLUDED.price,stock_quantity=EXCLUDED.stock_quantity,is_active=EXCLUDED.is_active RETURNING id`, [juice.rows[0].id]);
    console.log(JSON.stringify({admin_id:admin.rows[0].id,categories:3,products:3,skus:4,unavailable_variant_combination:riceUnavailable.rows[0].id,unavailable_sku:juiceSku.rows[0].id},null,2));
    await c.query('COMMIT');
  } catch(e) { await c.query('ROLLBACK'); throw e; } finally { await c.end(); }
}
seed().then(()=>console.log('Seed completed.')).catch(e=>{console.error(e.message);process.exit(1);});
