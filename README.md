# FreshCart — Sprint 2

FreshCart is the online grocery e-commerce platform defined in Sprint 1. Sprint 2 turns the Sprint 1 catalog concept into a database-backed catalog foundation for categories, products, variants, and SKUs.

## Sprint 2 scope

Included:
- Category tree with stable slugs and cycle prevention.
- Product CRUD with unique slugs and status.
- Variants and SKU records with unique codes, price and non-negative stock.
- Authenticated administrator routes.
- PostgreSQL migrations and reproducible seed data.
- Automated model/validation/authorization tests.
- Sprint 2 design and evidence in `docs/SPRINT_2.md`.

Not claimed as Sprint 2 functionality: dynamic specifications, asset upload, public catalog search, publication workflows, payment gateway, orders, shipping, or shopper checkout. These remain Sprint 3+ work.

## Stack

React.js remains the Sprint 1 frontend choice; this sprint implements the selected Node.js + Express.js backend and PostgreSQL data layer.

## Local setup

Requirements: Node.js 18+ and PostgreSQL 14+.

1. Copy `.env.example` to `.env`.
2. Create the database named `freshcart` (or change `DATABASE_URL`).
3. Install dependencies:

```bash
npm install
```

4. Run migrations:

```bash
npm run migrate
```

5. Seed the database:

```bash
npm run seed
```

6. Start the API:

```bash
npm start
```

The API listens on `http://localhost:3000` by default.

## Environment variables

- `PORT` — HTTP port.
- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — secret used to sign admin JWTs. Never commit it.
- `ADMIN_EMAIL` — seed administrator email.
- `ADMIN_PASSWORD` — seed administrator password. Change it outside local demo use.

## Admin authentication

For local demonstration, obtain a token with:

```http
POST /api/v1/admin/login
Content-Type: application/json

{"email":"admin@freshcart.local","password":"ChangeMe123!"}
```

Use the returned token as `Authorization: Bearer <token>` on administrative routes.

## Tests

The test suite is intentionally database-independent so it can run on a clean machine after `npm install`:

```bash
npm test
```

It covers product/SKU required fields, duplicate slugs/SKUs, category cycle prevention, variant/SKU validity and stock rules, and unauthorized administrative access.

## Repository layout

```text
docs/SPRINT_1.md       Sprint 1 architecture
 docs/SPRINT_2.md      Sprint 2 design, ERD, API evidence and test record
migrations/001_init.sql
migrations/run.js
seeds/seed.js
src/app.js
src/server.js
src/db.js
src/auth.js
src/validation.js
src/repository.js
routes/admin.js
tests/sprint2.test.js
```
