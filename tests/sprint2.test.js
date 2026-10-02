process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { categorySchema, productSchema, skuSchema } = require('../src/validation');

jest.mock('../src/repository', () => ({
  createCategory: jest.fn(async x => ({id:1,...x})),
  listCategories: jest.fn(async () => []),
  updateCategory: jest.fn(async (id,x) => ({id,...x})),
  deactivateCategory: jest.fn(async id => ({id,is_active:false})),
  createProduct: jest.fn(async x => ({id:1,...x})),
  updateProduct: jest.fn(async (id,x) => ({id,...x})),
  listProducts: jest.fn(async () => []),
  deactivateProduct: jest.fn(async id => ({id,status:'archived'})),
  createVariant: jest.fn(async (id,x) => ({id:1,product_id:id,...x})),
  listVariants: jest.fn(async () => []),
  updateVariant: jest.fn(async (id,x) => ({id,...x})),
  deactivateVariant: jest.fn(async id => ({id,is_active:false})),
  createSku: jest.fn(async (id,x) => ({id:1,product_id:id,...x})),
  updateSku: jest.fn(async (id,x) => ({id,...x})),
  listSkus: jest.fn(async () => []),
  deactivateSku: jest.fn(async id => ({id,is_active:false}))
}));

describe('Sprint 2 validation/model rules', () => {
  test('product requires name, slug and category', () => {
    expect(productSchema.safeParse({name:'Rice',slug:'rice',category_id:1}).success).toBe(true);
    expect(productSchema.safeParse({name:'Rice',slug:'rice'}).success).toBe(false);
  });
  test('SKU rejects negative stock and negative price', () => {
    expect(skuSchema.safeParse({sku_code:'RICE-1',price:10,stock_quantity:0}).success).toBe(true);
    expect(skuSchema.safeParse({sku_code:'RICE-1',price:-1,stock_quantity:2}).success).toBe(false);
    expect(skuSchema.safeParse({sku_code:'RICE-1',price:10,stock_quantity:-2}).success).toBe(false);
  });
  test('slug rules reject uppercase/space values', () => {
    expect(categorySchema.safeParse({name:'Pantry',slug:'pantry'}).success).toBe(true);
    expect(categorySchema.safeParse({name:'Pantry',slug:'Pantry Items'}).success).toBe(false);
  });
  test('duplicate slug and SKU are database constraints', () => {
    const migration = require('fs').readFileSync(require('path').join(__dirname,'../migrations/001_init.sql'),'utf8');
    expect(migration).toMatch(/slug VARCHAR\(200\) NOT NULL UNIQUE/);
    expect(migration).toMatch(/sku_code VARCHAR\(80\) NOT NULL UNIQUE/);
  });
  test('category cycle prevention is database enforced', () => {
    const migration = require('fs').readFileSync(require('path').join(__dirname,'../migrations/001_init.sql'),'utf8');
    expect(migration).toMatch(/prevent_category_cycle/);
    expect(migration).toMatch(/category hierarchy cycle detected/);
  });
  test('money uses decimal and stock has a non-negative CHECK constraint', () => {
    const migration = require('fs').readFileSync(require('path').join(__dirname,'../migrations/001_init.sql'),'utf8');
    expect(migration).toMatch(/price DECIMAL\(12,2\)/);
    expect(migration).toMatch(/stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK \(stock_quantity >= 0\)/);
  });
});

describe('Sprint 2 authorization and admin API', () => {
  test('unauthenticated admin request is rejected', async () => {
    const res = await request(app).get('/api/v1/admin/products');
    expect(res.status).toBe(401);
  });
  test('authenticated non-admin request is rejected', async () => {
    const token = jwt.sign({sub:99,role:'customer',email:'customer@example.com'},process.env.JWT_SECRET);
    const res = await request(app).get('/api/v1/admin/products').set('Authorization',`Bearer ${token}`);
    expect(res.status).toBe(403);
  });
  test('admin can create a product through the protected route', async () => {
    const token = jwt.sign({sub:1,role:'admin',email:'admin@freshcart.local'},process.env.JWT_SECRET);
    const res = await request(app).post('/api/v1/admin/products').set('Authorization',`Bearer ${token}`).send({name:'Rice',slug:'rice',category_id:1});
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('rice');
  });
  test('admin can deactivate a product rather than hard-delete it', async () => {
    const token = jwt.sign({sub:1,role:'admin'},process.env.JWT_SECRET);
    const res = await request(app).delete('/api/v1/admin/products/1').set('Authorization',`Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('archived');
  });
});
