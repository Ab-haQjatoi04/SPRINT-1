# E-Commerce — Sprint 1

## System Architecture & Scope

**Project Name:** FreshCart  
**Project Type:** Online Grocery E-Commerce Platform  
**Sprint:** 1 — System Architecture & Scope

---

# 1. Target Audience & Market Focus

## 1.1 Primary Persona

The primary users of FreshCart are **retail consumers and households** who want to purchase grocery and daily-use products through an online platform.

### User Persona

- **Name:** Ahmed
- **Age:** 20–45 years
- **Occupation:** Student, employee, or household member
- **Technical Level:** Basic to intermediate
- **Goal:** Purchase groceries conveniently without visiting a physical store.

Ahmed wants to search for grocery products, check prices and availability, add products to a cart, and place an order through a simple online platform.

---

## 1.2 Core Pain Point

Traditional grocery shopping requires customers to physically visit stores, search for products, wait at checkout counters, and manually carry their purchases.

FreshCart addresses this problem by providing a centralized online grocery shopping platform where customers can:

- Browse grocery products online.
- Search for required products.
- Filter products by category.
- Manage a shopping cart.
- Place orders online.
- View order information.

The system aims to make grocery shopping **faster, simpler, and more convenient**.

---

## 1.3 Domain Scope

FreshCart operates in the **Online Grocery and Consumer Retail E-Commerce** domain.

The platform focuses on products such as:

- Fruits & Vegetables
- Dairy Products
- Bakery Items
- Beverages
- Snacks
- Household Essentials
- Personal Care Products

The MVP focuses on product browsing, authentication, cart management, checkout/order processing, and basic administrative inventory management.

---

# 2. Minimum Viable Product (MVP) Feature Scope

The MVP contains the core workflows required for a functional online grocery shopping platform.

| Category | Feature Name | Description | Priority |
|---|---|---|---|
| Authentication | User Registration & Authentication | User registration and secure login using password hashing and JWT-based authentication. | High (MVP) |
| Catalog | Product List & Search | Customers can browse products and search/filter products by category. | High (MVP) |
| Cart | Cart Management | Users can add products to the cart, modify quantities, and remove items. | High (MVP) |
| Checkout | Order Processing | Customers can confirm their cart and create an order using a mock payment or Stripe integration. | High (MVP) |
| Admin | Inventory Control | Administrators can create, update, and delete products and manage stock quantities. | Medium |

---

## 2.1 User Registration & Authentication

Users will be able to create accounts using their basic information.

The authentication system will provide:

- User registration
- User login
- Password hashing
- JWT-based authentication
- Protected user operations

**Priority:** High (MVP)

---

## 2.2 Product List & Search

Customers will be able to browse the available grocery products.

The feature will support:

- Product listing
- Product search
- Category filtering
- Product price display
- Stock availability

**Priority:** High (MVP)

---

## 2.3 Cart Management

The shopping cart will allow users to manage products before checkout.

Users can:

- Add products to cart.
- Increase product quantity.
- Decrease product quantity.
- Remove products from cart.
- View cart subtotal.
- Review selected products before checkout.

**Priority:** High (MVP)

---

## 2.4 Order Processing

After managing their cart, customers can proceed to checkout.

The checkout workflow includes:

1. Review cart.
2. Confirm order information.
3. Calculate order total.
4. Process mock or Stripe payment.
5. Create order.
6. Store order items.

**Priority:** High (MVP)

---

## 2.5 Inventory Control

Administrators will have basic inventory management functionality.

Administrators can:

- Add products.
- Update product information.
- Update stock quantity.
- Delete products.
- Manage product categories.

**Priority:** Medium

---

# 3. Tech Stack Selection & Justification

## 3.1 Frontend Framework

**Selected Technology:** React.js

### Justification

React.js is selected because it supports component-based user interface development and is suitable for building interactive e-commerce interfaces. Compared with traditional server-rendered approaches, React provides reusable components and efficient client-side updates, making it appropriate for product catalogs, shopping carts, and checkout interfaces.

---

## 3.2 Backend Infrastructure

**Selected Technology:** Node.js with Express.js

### Justification

Node.js with Express.js is selected because it provides a lightweight and scalable environment for developing REST APIs. Compared with heavier backend frameworks, Express provides flexibility and integrates naturally with JavaScript-based frontend development, making it suitable for authentication, product management, cart operations, and order processing.

---

## 3.3 Database Management System

**Selected Technology:** PostgreSQL

### Justification

PostgreSQL is selected because FreshCart contains strongly related entities such as users, products, categories, orders, and order items. A relational database provides strong data integrity, foreign-key constraints, and reliable transaction handling, which are important for e-commerce order processing. MongoDB could provide greater schema flexibility, but PostgreSQL is more appropriate for the relational structure required by this application.

---

## 3.4 Caching & Asynchronous Processing

**Selected Technology:** Redis — Optional

### Justification

Redis can be introduced for caching frequently accessed data and improving application performance. It may also support temporary session-related data and background processing in future versions. Since caching is optional for Sprint 1, Redis is not considered a mandatory MVP component.

---

# 4. Entity-Relationship Diagram (ERD)

FreshCart uses a relational database structure containing the following major entities:

- Users
- Products
- Categories
- Orders
- Order_Items
- Cart
- Cart_Items

The relationships between these entities are represented below using Mermaid ERD syntax.

```mermaid
erDiagram

    USERS ||--o{ ORDERS : places
    USERS ||--o| CART : owns
    CATEGORIES ||--o{ PRODUCTS : contains
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    CART ||--|{ CART_ITEMS : contains
    PRODUCTS ||--o{ CART_ITEMS : added_to

    USERS {
        INTEGER id PK
        VARCHAR name
        VARCHAR email
        VARCHAR password_hash
        TIMESTAMP created_at
    }

    CATEGORIES {
        INTEGER id PK
        VARCHAR name
        VARCHAR description
    }

    PRODUCTS {
        INTEGER id PK
        INTEGER category_id FK
        VARCHAR name
        VARCHAR description
        DECIMAL price
        INTEGER stock_quantity
        TIMESTAMP created_at
    }

    ORDERS {
        INTEGER id PK
        INTEGER user_id FK
        DECIMAL total_amount
        VARCHAR status
        TIMESTAMP created_at
    }

    ORDER_ITEMS {
        INTEGER id PK
        INTEGER order_id FK
        INTEGER product_id FK
        INTEGER quantity
        DECIMAL unit_price
    }

    CART {
        INTEGER id PK
        INTEGER user_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    CART_ITEMS {
        INTEGER id PK
        INTEGER cart_id FK
        INTEGER product_id FK
        INTEGER quantity
    }