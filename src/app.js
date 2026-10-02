require('dotenv').config();
const express = require('express');
const { z } = require('zod');
const { login, requireAdmin } = require('./auth');
const repo = require('./repository');
const { categorySchema, productSchema, skuSchema, variantSchema } = require('./validation');

const app = express();
app.use(express.json());

function parse(schema, body) { const result = schema.safeParse(body); if (!result.success) { const err = new Error('validation_error'); err.status=400; err.details=result.error.flatten(); throw err; } return result.data; }
function handleDbError(err, res) {
  if (err.code === '23505') return res.status(409).json({ error: 'duplicate_value', detail: err.detail });
  if (err.code === '23503') return res.status(400).json({ error: 'invalid_reference', detail: err.detail });
  if (err.code === '23514') return res.status(400).json({ error: 'constraint_violation', detail: err.detail });
  if (err.message === 'category hierarchy cycle detected' || err.message === 'category cannot be its own parent') return res.status(400).json({ error: 'category_cycle' });
  return res.status(500).json({ error: 'internal_server_error' });
}

app.get('/health', (_req,res)=>res.json({status:'ok', sprint:'2'}));
app.post('/api/v1/admin/login', async (req,res)=>{
  try { const body = z.object({email:z.string().email(),password:z.string().min(1)}).parse(req.body); const token=await login(body.email,body.password); if(!token) return res.status(401).json({error:'invalid_credentials'}); res.json({token}); }
  catch(e){ return res.status(400).json({error:'invalid_request'}); }
});

app.use('/api/v1/admin', requireAdmin);
app.post('/api/v1/admin/categories', async(req,res)=>{ try{res.status(201).json(await repo.createCategory(parse(categorySchema,req.body)));}catch(e){handleDbError(e,res);} });
app.get('/api/v1/admin/categories', async(_req,res)=>{ try{res.json({data:await repo.listCategories()});}catch(e){handleDbError(e,res);} });
app.delete('/api/v1/admin/categories/:id', async(req,res)=>{ try{const row=await repo.deactivateCategory(Number(req.params.id)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.patch('/api/v1/admin/categories/:id', async(req,res)=>{ try{const row=await repo.updateCategory(Number(req.params.id),parse(categorySchema.partial(),req.body)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.post('/api/v1/admin/products', async(req,res)=>{ try{res.status(201).json(await repo.createProduct(parse(productSchema,req.body)));}catch(e){handleDbError(e,res);} });
app.delete('/api/v1/admin/products/:id', async(req,res)=>{ try{const row=await repo.deactivateProduct(Number(req.params.id)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.patch('/api/v1/admin/products/:id', async(req,res)=>{ try{const row=await repo.updateProduct(Number(req.params.id),parse(productSchema.partial(),req.body)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.get('/api/v1/admin/products', async(_req,res)=>{ try{res.json({data:await repo.listProducts()});}catch(e){handleDbError(e,res);} });
app.post('/api/v1/admin/products/:id/variants', async(req,res)=>{ try{res.status(201).json(await repo.createVariant(Number(req.params.id),parse(variantSchema,req.body)));}catch(e){handleDbError(e,res);} });
app.get('/api/v1/admin/products/:id/variants', async(req,res)=>{ try{res.json({data:await repo.listVariants(Number(req.params.id))});}catch(e){handleDbError(e,res);} });
app.patch('/api/v1/admin/variants/:id', async(req,res)=>{ try{const row=await repo.updateVariant(Number(req.params.id),parse(variantSchema.partial(),req.body)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.delete('/api/v1/admin/variants/:id', async(req,res)=>{ try{const row=await repo.deactivateVariant(Number(req.params.id)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.get('/api/v1/admin/skus', async(req,res)=>{ try{res.json({data:await repo.listSkus(req.query.product_id ? Number(req.query.product_id) : undefined)});}catch(e){handleDbError(e,res);} });
app.post('/api/v1/admin/products/:id/skus', async(req,res)=>{ try{const data=parse(skuSchema,req.body); res.status(201).json(await repo.createSku(Number(req.params.id),data));}catch(e){handleDbError(e,res);} });
app.delete('/api/v1/admin/skus/:id', async(req,res)=>{ try{const row=await repo.deactivateSku(Number(req.params.id)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });
app.patch('/api/v1/admin/skus/:id', async(req,res)=>{ try{const row=await repo.updateSku(Number(req.params.id),parse(skuSchema.partial(),req.body)); if(!row)return res.status(404).json({error:'not_found'}); res.json(row);}catch(e){handleDbError(e,res);} });

app.use((err, _req, res, _next)=>res.status(err.status||500).json({error:err.message||'internal_server_error',details:err.details}));
module.exports = app;
