# Online Food Ordering System
## 👤 Student & Academic Details

- **Student Name:** S Haripriya
- **USN:** 1MP24CG039
- **Semester:** 5th Semester
- **Department:** Department of Computer Science and Design
- **Institution:** BGS College of Engineering and Technology (BGSCET)
- **Course / Lab:** BCGL504 Object-Oriented Design Patterns Lab
- **Event:** PatternXthon
- **Problem Statement:** ONLINE FOOD ORDERING SYSTEM
#

An Object-Oriented Design (OOD) project: a minimal, responsive online food ordering and delivery web application built directly from a **UML class diagram** (StarUML).

Customers can browse local partner restaurants, filter dishes by category, add items to a dynamic cart, apply coupon codes, pay using multiple payment methods (including wallet deduction), and track their order through a real-time lifecycle stepper. Delivery partners and admins have dedicated operational dashboards to accept deliveries, advance orders, and view revenue metrics.

An interactive **UML Class Details** page is directly accessible via a floating action button on the home page, presenting the high-resolution architecture diagram and all 15 domain classes in structured UML tables.

---

## Features

- **Floating UML Details Navigation**: Seamless floating action button on the right edge of the home page leading to `/uml`.
- **Interactive UML Architecture Viewer**: Full container width high-resolution UML diagram viewer (with one-click full-screen inspection) and 15 structured class specification cards arranged in a responsive 3-column grid.
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
├── index.html              # Semantic HTML5 layout, modals & floating UML button
├── uml.html                # Dedicated UML Class Diagram and 15-class details page (/uml)
├── styles.css              # Design system, responsive grid & card styles
├── app.js                  # Frontend OOP domain classes & UI controllers
├── server.js               # Lightweight local server (Node.js) with /uml routing
├── app.py                  # Python / Flask server
├── food_ordering.py        # Python OOP implementation of all 15 UML domain classes
├── uml.png                 # UML class diagram source image
├── static/
│   └── uml_diagram.png     # Static diagram image served on /uml
└── README.md               # Project documentation
```

---

## UML Class Diagram

![UML Class Diagram](static/uml_diagram.png)

### Classes (15)

| Group | Classes | Description |
|---|---|---|
| **Users** | `User` (Abstract Base), `Customer`, `Admin`, `DeliveryPartner` | User hierarchy with role-specific methods, wallets, and shift states |
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

## GoF Design Patterns Implementation

The patterns below are mapped directly from the classes, methods and relationships in the UML class diagram.

| Pattern | Category | Classes | Role in Online Food Ordering System |
|---|---|---|---|
| **Factory Method** | Creational | `Cart`, `Customer`, `Order`, `OrderItem` | `Cart.checkout(): Order` and `Customer.placeOrder(): Order` build a fully formed `Order` from the cart contents. Each `CartItem` is turned into an `OrderItem` with a price snapshot, so the caller never constructs orders by hand. |
| **Facade** | Structural | `Customer`, `Cart`, `Order`, `Payment`, `Coupon` | `Customer.placeOrder()` and `Cart.checkout()` give one simple entry point. Behind it they coordinate subtotal calculation, coupon validation, order creation and payment processing. |
| **State** | Behavioral | `Order`, `OrderStatus` | `Order.updateStatus()` moves the order through `PLACED → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED`, or to `CANCELLED`. Behaviour such as whether `cancelOrder()` is allowed depends on the current status. |
| **Strategy** | Behavioral | `Payment`, `PaymentMethod`, `Coupon` | `Payment.processPayment()` is chosen at runtime from `PaymentMethod` (`UPI`, `CARD`, `WALLET`, `COD`). `Coupon.apply(amount)` is a swappable discount rule applied to the order total. |
| **Observer** | Behavioral | `Order`, `Customer`, `DeliveryPartner` | When `DeliveryPartner.updateDeliveryStatus()` or `Order.updateStatus()` runs, the status change is pushed to the `Customer`, so `trackOrder()` always shows the latest stage. |

### Notes

- **Factory Method** and **Facade** come from `Cart.checkout()` and `Customer.placeOrder()` returning an `Order`.
- **State** and **Strategy** are suggested by the `OrderStatus` and `PaymentMethod` enumerations linked to `Order` and `Payment`.
- **Observer** comes from the tracking and status-update methods shared between `Customer` and `DeliveryPartner`.
- Inheritance (`Customer`, `Admin`, `DeliveryPartner` extending `User`) and composition/aggregation are OOP relationships, not GoF patterns, so they are listed separately under *OOP Concepts Demonstrated*.

---

## Getting Started

### Prerequisites

- Modern Web Browser (Chrome, Firefox, Safari, Edge)
- *(Optional)* Node.js 16+ or Python 3.8+ (with Flask) for running a local web server

### Installation and Run

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Start the local server (choose either Node.js or Python)

# Option A — Using Node.js (Recommended):
node server.js
# Serves at: http://localhost:3000/
# UML page:  http://localhost:3000/uml

# Option B — Using Python / Flask:
python app.py
# Serves at: http://localhost:5000/
# UML page:  http://localhost:5000/uml

# 3. Direct Browser Access:
# You can also double-click and open index.html directly in any web browser!
```

---

## How to Use

1. **View UML Architecture**: Click the floating orange **"View UML Details"** button on the right edge of the home page to open the `/uml` view containing the full diagram and 15 class cards with detailed operations.
2. **Browse Menu**: Filter dishes by category (*Artisan Pizza, Healthy Bowls, Asian Bowls, Artisan Bakery*) or click any Partner Kitchen card to filter by restaurant.
3. **Add to Cart**: Click `+ Add` on dishes to populate your cart and adjust quantities in real time.
4. **Cart & Promo Code**: Open the cart drawer, enter coupon `FEAST20`, and click **Apply** for a 20% discount.
5. **Checkout & Payment**: Select a payment method (**Customer Wallet**, **Instant UPI**, **Card**, or **Cash on Delivery**) and place your order.
6. **Live Order Tracking**: Watch the order advance through the 5 status steps (`PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`). Click **Advance Order Status** to simulate the kitchen and rider progressing the delivery.
7. **Role Dashboards**: Click the **Portals** buttons in the top banner (`Customer`, `Delivery Partner`, `Admin`) to inspect live shift metrics, add wallet funds, accept delivery orders, or onboard new kitchens.

---

## Tech Stack

- **Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+ Classes), Modern CSS3 (CSS Custom Properties & Flexbox/Grid)
- **Backend**: Node.js HTTP Server (`server.js`) & Python Flask Server (`app.py`)
- **Domain Logic**: StarUML OOD Architecture (`food_ordering.py` & `app.js`)
- **Currency**: Indian Rupee (₹)
- **Modeling Tool**: StarUML (OOD Class Diagram)

---

## Author

**S HARIPRIYA** | USN: IMP24CG039 | CSD
