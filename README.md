# Online Food Ordering System

An Object-Oriented Design (OOD) project: a minimal, responsive online food ordering and delivery web application built directly from a **UML class diagram** (StarUML).

Customers can browse local partner restaurants, filter dishes by category, add items to a dynamic cart, apply coupon codes, pay using multiple payment methods (including wallet deduction), and track their order through a real-time lifecycle stepper. Delivery partners and admins have dedicated operational dashboards to accept deliveries, advance orders, and view revenue metrics.

---

## Features

- **Multi-Restaurant & Catalog Browsing**: Explore partner kitchens with real-time open/closed statuses, location tags, and dish filters.
- **Cart & Subtotal Engine**: Real-time quantity steppers (`+` / `−`), automatic subtotal calculation, and delivery fee calculation in Indian Rupees (₹).
- **Coupon Validation**: Active promo support (e.g. `FEAST20` for 20% off) calculating dynamic discounts.
- **Multi-Method Payments**: Supports **Customer Wallet** (with auto-deduction and refund), **Instant UPI**, **Credit/Debit Card**, and **Cash on Delivery**.
- **Live Order Tracking**: Visual 5-step status progression:  
  `PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` (or `CANCELLED`).
- **Order Cancellation & Instant Refund**: Cancel orders with automatic wallet refund before final delivery.
- **Delivery Partner Dashboard**: Rider shift management, vehicle tracking (`TVS Jupiter • KA-04-E-4921`), order acceptance, and earnings report.
- **Kitchen & Admin Portal**: Live platform GMV, commission calculations (15%), active kitchen monitoring, and dynamic new kitchen onboarding.
- **Minimal, Organic UI**: Clean culinary aesthetic (warm terracotta, olive basil, oat linen) avoiding generic purple/blue AI gradients.

---

## Project Structure

```
.
├── index.html          # Semantic HTML5 layout, modals, and templates
├── styles.css          # Design system & responsive styles (warm palette)
├── app.js              # Core OOP domain classes & UI controllers (the UML implemented)
├── server.js           # Lightweight local static server (Node.js built-in)
├── uml.png             # UML class diagram
└── README.md           # Project documentation
```

---

## UML Class Diagram

![UML Class Diagram](uml.png)

### Classes (15)

| Group | Classes | Description |
|---|---|---|
| **Users** | `User` (Base), `Customer`, `Admin`, `DeliveryPartner` | User hierarchy with role-specific methods, wallets, and shift states |
| **Restaurant** | `Restaurant`, `FoodItem` | Kitchen partners and their menus with price & availability management |
| **Shopping** | `Cart`, `CartItem` | Shopping cart engine calculating item quantities and order subtotals |
| **Orders** | `Order`, `OrderItem`, `Payment`, `Coupon`, `Address` | Complete lifecycle management, address resolution, payment and discounts |
| **Enumerations** | `OrderStatus`, `PaymentMethod` | Fixed lifecycle states and supported payment channels |

### Relationships

| Relationship | Entities | Description |
|---|---|---|
| **Inheritance** | `Customer`, `Admin`, `DeliveryPartner` ➔ `User` | Subclasses inherit `userId`, `name`, `email`, `login()`, `logout()` |
| **Composition** | `Cart` ◆── `CartItem` | A cart is composed of items; items cannot exist without a cart |
| **Composition** | `Order` ◆── `OrderItem` | An order owns its immutable order snapshots |
| **Aggregation** | `Restaurant` ◇── `FoodItem` | Restaurants offer food items independently in their catalog |
| **Association** | `Customer` ➔ `Cart`, `Order`, `Address` | Customer owns a cart, saves addresses, and places orders |
| **Association** | `Order` ➔ `Restaurant`, `Payment`, `DeliveryPartner`, `Coupon` | Order links customer, kitchen, rider, payment, and promo |

---

## OOP Concepts Demonstrated

- **Abstraction & Base Class**: `User` encapsulates common authentication and user attributes inherited by specialized user types (`Customer`, `Admin`, `DeliveryPartner`).
- **Inheritance**: `Customer` extends `User` with wallet management (`walletBalance`) and order placement; `DeliveryPartner` extends `User` with vehicle registration (`vehicleNo`) and shift availability.
- **Encapsulation**: State changes (such as cart updates, payment transactions, and order status transitions) occur exclusively through domain methods (`addItem`, `removeItem`, `processPayment`, `updateStatus`, `cancelOrder`).
- **Composition vs. Aggregation**:
  - `CartItem` and `OrderItem` lifecycle is tightly bound to `Cart` and `Order` (Composition).
  - `FoodItem` exists independently within `Restaurant` catalogs (Aggregation).
- **Snapshot Design Pattern**: `OrderItem` captures the price and item name at the exact moment of order placement, preventing retroactive pricing changes from mutating historical invoices.
- **Enumerations**: Fixed state machine constraints using `OrderStatus` and `PaymentMethod`.

---

## Getting Started

### Prerequisites

- Modern Web Browser (Chrome, Firefox, Safari, Edge)
- *(Optional)* Node.js 16+ or Python 3.8+ for running a local server

### Installation and Run

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Start the local server (choose either Node.js or Python)

# Option A — Using Node.js:
node server.js

# Option B — Using Python:
python -m http.server 3000

# 3. Open in your browser
# Visit http://localhost:3000
```

> **Note:** Because this project is self-contained with pure vanilla web standards, you can also open `index.html` directly in any web browser without installing anything!

---

## How to Use

1. **Browse Menu**: Filter dishes by category (*Artisan Pizza, Healthy Bowls, Asian Bowls, Artisan Bakery*) or click any Partner Kitchen card to filter by restaurant.
2. **Add to Cart**: Click `+ Add` on dishes to populate your cart and adjust quantities in real time.
3. **Cart & Promo Code**: Open the cart drawer, enter coupon `FEAST20`, and click **Apply** for a 20% discount.
4. **Checkout & Payment**: Select a payment method (**Customer Wallet**, **Instant UPI**, **Card**, or **Cash on Delivery**) and place your order.
5. **Live Order Tracking**: Watch the order advance through the 5 status steps (`PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`). Click **Advance Order Status** to simulate the kitchen and rider progressing the delivery.
6. **Role Dashboards**: Click the **Portals** buttons in the top banner (`Customer`, `Delivery Partner`, `Admin`) to inspect live shift metrics, add wallet funds, accept delivery orders, or onboard new kitchens.

---

## Tech Stack

- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+ Classes), Modern CSS3 (CSS Custom Properties & Flexbox/Grid)
- **Design System**: Warm organic palette (Terracotta, Olive Basil, Oatmeal Linen) avoiding purple/blue AI gradients
- **Currency**: Indian Rupee (₹)
- **Modeling Tool**: StarUML (OOD Class Diagram)

---

## Author

**[HARIPRIYA]** - [BGS / CSD]
