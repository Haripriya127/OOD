# SAVOR — Food Delivery Platform

A clean, minimal food ordering and delivery homepage built strictly based on Object-Oriented Domain (OOD) UML modeling.

---

## Getting Started

### Prerequisites

- Modern Web Browser (Chrome, Firefox, Safari, Edge)
- *Optional:* Node.js (v16+) or Python (3.8+) for running a local server

### Installation and Run

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Start the local server (choose either Node.js or Python)
# Using Node.js:
node server.js

# OR using Python:
python -m http.server 3000

# 3. Open in your browser
# Visit http://localhost:3000 in your browser
# (Alternatively, you can simply double-click and open index.html directly)
```

---

## Features & UML Mapping

- **Customer Operations**: Browse partner kitchens, add items to cart, apply discount coupon (`FEAST20`), and manage wallet balance.
- **Cart & Subtotal Calculation**: Real-time quantity adjustments, subtotal, and discount deductions.
- **Payment Processing**: Flexible checkout with Customer Wallet, Instant UPI, Cards, and Cash on Delivery.
- **Live Order Tracking**: Visual 5-step status progression (`PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) with delivery partner assignment and order cancellation with instant wallet refund.
- **Rider & Kitchen Portals**: Interactive shift toggle, live delivery acceptance, and platform financial summaries.
