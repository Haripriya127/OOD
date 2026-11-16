/**
 * SAVOR - Food Platform
 * Direct Object-Oriented implementation matching UML Class Diagram
 * Configured with Indian Rupees (₹) and fully interactive role dashboards
 */

// ==================== ENUMS ====================
const OrderStatus = Object.freeze({
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
});

const PaymentMethod = Object.freeze({
  UPI: 'UPI',
  CARD: 'CARD',
  WALLET: 'WALLET',
  COD: 'COD'
});

// ==================== UML DOMAIN CLASSES ====================

class Address {
  constructor(line, city, pincode) {
    this.line = line;
    this.city = city;
    this.pincode = pincode;
  }

  getFormatted() {
    return `${this.line}, ${this.city} • ${this.pincode}`;
  }
}

class User {
  constructor(userId, name, email, password) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.isLoggedIn = true;
  }

  login() {
    this.isLoggedIn = true;
    return true;
  }

  logout() {
    this.isLoggedIn = false;
  }
}

class Customer extends User {
  constructor(userId, name, email, password, phone, walletBalance, address) {
    super(userId, name, email, password);
    this.phone = phone;
    this.walletBalance = walletBalance;
    this.address = address;
    this.cart = new Cart(101);
    this.activeOrders = [];
  }

  browseRestaurants(restaurants) {
    return restaurants.filter(r => r.isOpen);
  }

  placeOrder(restaurant, paymentMethod, coupon = null) {
    const order = this.cart.checkout(this, restaurant, coupon);
    if (!order) return null;

    const payment = new Payment(
      Math.floor(1000 + Math.random() * 9000),
      paymentMethod,
      order.totalAmount
    );

    const paid = payment.processPayment(this);
    if (!paid) {
      alert("Payment failed: Insufficient wallet balance. Please recharge your wallet or choose UPI/Cash.");
      return null;
    }

    order.payment = payment;
    order.updateStatus(OrderStatus.PLACED);
    this.activeOrders.push(order);
    this.cart.clearCart();
    return order;
  }

  trackOrder(orderId) {
    return this.activeOrders.find(o => o.orderId === orderId);
  }

  cancelOrder(orderId) {
    const order = this.trackOrder(orderId);
    if (order && order.status !== OrderStatus.DELIVERED) {
      order.cancelOrder();
      if (order.payment && order.payment.status === 'PAID') {
        order.payment.refund(this);
      }
      return true;
    }
    return false;
  }

  addWalletFunds(amount) {
    this.walletBalance = Number((this.walletBalance + amount).toFixed(2));
    return this.walletBalance;
  }
}

class Admin extends User {
  constructor(userId, name, email, password) {
    super(userId, name, email, password);
  }

  manageRestaurants(restaurants) {
    return restaurants;
  }

  manageUsers(users) {
    return users;
  }

  viewReports() {
    return {
      totalRevenue: "₹48,250",
      activeOrdersToday: 42,
      platformCommission: "₹7,237",
      activeKitchens: 4
    };
  }
}

class DeliveryPartner extends User {
  constructor(userId, name, email, password, vehicleNo, isAvailable = true) {
    super(userId, name, email, password);
    this.vehicleNo = vehicleNo;
    this.isAvailable = isAvailable;
    this.completedDeliveries = 8;
    this.todayEarnings = 1250;
    this.rating = 4.9;
  }

  acceptDelivery(order) {
    if (this.isAvailable) {
      this.isAvailable = false;
      order.deliveryPartner = this;
      order.updateStatus(OrderStatus.OUT_FOR_DELIVERY);
      return true;
    }
    return false;
  }

  updateDeliveryStatus(order, newStatus) {
    order.updateStatus(newStatus);
    if (newStatus === OrderStatus.DELIVERED) {
      this.isAvailable = true;
      this.completedDeliveries += 1;
      this.todayEarnings += 120;
    }
  }
}

class FoodItem {
  constructor(itemId, name, price, category, isAvailable = true, description = "", restaurantId = 1) {
    this.itemId = itemId;
    this.name = name;
    this.price = price;
    this.category = category;
    this.isAvailable = isAvailable;
    this.description = description;
    this.restaurantId = restaurantId;
  }

  updatePrice(newPrice) {
    this.price = newPrice;
  }

  setAvailability(status) {
    this.isAvailable = status;
  }
}

class Restaurant {
  constructor(restaurantId, name, location, rating = 4.5, isOpen = true) {
    this.restaurantId = restaurantId;
    this.name = name;
    this.location = location;
    this.rating = rating;
    this.isOpen = isOpen;
    this.menu = [];
  }

  manageMenu(foodItem) {
    this.menu.push(foodItem);
  }

  acceptOrder(order) {
    order.updateStatus(OrderStatus.CONFIRMED);
  }

  updateOrderStatus(order, status) {
    order.updateStatus(status);
  }
}

class CartItem {
  constructor(foodItem, quantity = 1) {
    this.foodItem = foodItem;
    this.quantity = quantity;
    this.subTotal = 0;
    this.calculateSubTotal();
  }

  calculateSubTotal() {
    this.subTotal = Number((this.foodItem.price * this.quantity).toFixed(2));
    return this.subTotal;
  }
}

class Cart {
  constructor(cartId) {
    this.cartId = cartId;
    this.items = [];
    this.totalAmount = 0;
  }

  addItem(foodItem) {
    const existing = this.items.find(i => i.foodItem.itemId === foodItem.itemId);
    if (existing) {
      existing.quantity += 1;
      existing.calculateSubTotal();
    } else {
      this.items.push(new CartItem(foodItem, 1));
    }
    this.calculateTotal();
  }

  removeItem(itemId) {
    const idx = this.items.findIndex(i => i.foodItem.itemId === itemId);
    if (idx !== -1) {
      if (this.items[idx].quantity > 1) {
        this.items[idx].quantity -= 1;
        this.items[idx].calculateSubTotal();
      } else {
        this.items.splice(idx, 1);
      }
    }
    this.calculateTotal();
  }

  clearCart() {
    this.items = [];
    this.totalAmount = 0;
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.calculateSubTotal(), 0);
    this.totalAmount = Number(this.totalAmount.toFixed(2));
    return this.totalAmount;
  }

  checkout(customer, restaurant, coupon = null) {
    if (this.items.length === 0) return null;

    const orderItems = this.items.map(ci => new OrderItem(ci.foodItem.name, ci.foodItem.price, ci.quantity));
    const orderId = Math.floor(1000 + Math.random() * 9000);
    
    let total = this.totalAmount;
    if (coupon && coupon.isValid()) {
      total = coupon.apply(total);
    }
    // Standard delivery fee in Rupees: ₹40
    total = Number((total + 40).toFixed(2));

    const order = new Order(orderId, new Date(), orderItems, total, restaurant, customer);
    order.appliedCoupon = coupon;
    return order;
  }
}

class OrderItem {
  constructor(itemName, unitPrice, quantity) {
    this.itemName = itemName;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }
}

class Coupon {
  constructor(code, discountPercent, expiryDate = new Date(Date.now() + 864000000)) {
    this.code = code.toUpperCase();
    this.discountPercent = discountPercent;
    this.expiryDate = expiryDate;
  }

  isValid() {
    return new Date() <= this.expiryDate;
  }

  apply(amount) {
    const discount = (amount * this.discountPercent) / 100;
    return Number((amount - discount).toFixed(2));
  }
}

class Payment {
  constructor(paymentId, method, amount) {
    this.paymentId = paymentId;
    this.method = method;
    this.amount = amount;
    this.status = 'PENDING';
  }

  processPayment(customer) {
    if (this.method === PaymentMethod.WALLET) {
      if (customer.walletBalance >= this.amount) {
        customer.walletBalance = Number((customer.walletBalance - this.amount).toFixed(2));
        this.status = 'PAID';
        return true;
      } else {
        this.status = 'FAILED';
        return false;
      }
    }
    // For UPI, CARD, COD simulate success
    this.status = 'PAID';
    return true;
  }

  refund(customer) {
    if (this.status === 'PAID') {
      if (this.method === PaymentMethod.WALLET) {
        customer.walletBalance = Number((customer.walletBalance + this.amount).toFixed(2));
      }
      this.status = 'REFUNDED';
    }
  }
}

class Order {
  constructor(orderId, orderDate, items, totalAmount, restaurant, customer) {
    this.orderId = orderId;
    this.orderDate = orderDate;
    this.status = OrderStatus.PLACED;
    this.items = items;
    this.totalAmount = totalAmount;
    this.restaurant = restaurant;
    this.customer = customer;
    this.deliveryPartner = null;
    this.appliedCoupon = null;
    this.payment = null;
  }

  calculateTotal() {
    return this.totalAmount;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }

  cancelOrder() {
    this.status = OrderStatus.CANCELLED;
  }
}

// ==================== SEED DATA (RUPEES) ====================

const initialAddress = new Address("142 Riverwalk Road, Indiranagar", "Bengaluru", "560038");
const currentCustomer = new Customer(1, "Sarah Chen", "sarah@example.com", "pass123", "+91 98765 43210", 1500.00, initialAddress);
const defaultDeliveryPartner = new DeliveryPartner(301, "Marcus Vance", "marcus@delivery.com", "pass123", "TVS Jupiter • KA-04-E-4921", true);

const activeCoupons = [
  new Coupon("FEAST20", 20),
  new Coupon("WELCOME10", 10)
];

const restaurants = [
  new Restaurant(1, "Rustic Oven Co.", "Indiranagar 100ft Road", 4.9, true),
  new Restaurant(2, "Verde Botanical Bowls", "Koramangala 4th Block", 4.8, true),
  new Restaurant(3, "Bao & Broth Ramen", "Church Street", 4.7, true),
  new Restaurant(4, "Artisan Hearth Bakery", "Lavelle Road", 4.9, true)
];

const foodCatalog = [
  new FoodItem(101, "Truffle Mushroom Sourdough Pizza", 380, "Artisan Pizza", true, "Wild forest mushrooms, fior di latte, aged pecorino, truffle oil drizzle", 1),
  new FoodItem(102, "Charred Margherita & Basil", 299, "Artisan Pizza", true, "San Marzano tomatoes, fresh buffalo mozzarella, handpicked garden basil", 1),
  new FoodItem(103, "Spicy Calabrian Salami Flatbread", 349, "Artisan Pizza", true, "Artisan spicy soppressata, chili honey drizzle, smoked provolone", 1),
  
  new FoodItem(201, "Green Goddess Quinoa Bowl", 249, "Healthy Bowls", true, "Fresh avocado, roasted chickpeas, kale, edamame, creamy herb vinaigrette", 2),
  new FoodItem(202, "Sesame Crusted Salmon Bowl", 329, "Healthy Bowls", true, "Pan-seared salmon, steamed brown rice, seaweed salad, miso citrus glaze", 2),
  new FoodItem(203, "Warm Roasted Harvest Bowl", 229, "Healthy Bowls", true, "Sweet potatoes, caramelized sprouts, wild grains, maple tahini cream", 2),
  
  new FoodItem(301, "Slow-Simmered Tonkotsu Ramen", 310, "Asian Bowls", true, "24-hr rich broth, tender chashu, ajitsuke tamago egg, scallions, nori", 3),
  new FoodItem(302, "Steamed Crispy Duck Bao (3 pcs)", 260, "Asian Bowls", true, "Hoisin glazed duck, pickled cucumber, scallion curls, crushed roasted peanuts", 3),
  new FoodItem(303, "Miso Shiitake Broth Bowl (Vegan)", 240, "Asian Bowls", true, "Rich umami dashi, hand-pulled noodles, braised bamboo shoots, sesame oil", 3),

  new FoodItem(401, "Cardamom & Pistachio Brioche", 130, "Artisan Bakery", true, "Flaky laminated brioche, fresh ground green cardamom, candied Iranian pistachios", 4),
  new FoodItem(402, "Vanilla Bean Espresso Tart", 160, "Artisan Bakery", true, "Dark chocolate sable crust, Madagascar vanilla ganache, rich espresso glaze", 4)
];

// Attach foods to restaurants
foodCatalog.forEach(f => {
  const r = restaurants.find(res => res.restaurantId === f.restaurantId);
  if (r) r.manageMenu(f);
});

// ==================== UI CONTROLLER ====================

let activeCategory = "All";
let activeRestaurantId = null;
let appliedCoupon = null;
let currentTrackingOrder = null;
let selectedPaymentMethod = PaymentMethod.WALLET;

// DOM Elements
const restaurantsStrip = document.getElementById("restaurantsStrip");
const foodGrid = document.getElementById("foodGrid");
const filterChips = document.getElementById("filterChips");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsList = document.getElementById("cartItemsList");
const cartCountBadge = document.getElementById("cartCountBadge");
const cartNavTotal = document.getElementById("cartNavTotal");
const walletDisplay = document.getElementById("walletDisplay");
const subtotalDisplay = document.getElementById("subtotalDisplay");
const discountRow = document.getElementById("discountRow");
const discountDisplay = document.getElementById("discountDisplay");
const totalDisplay = document.getElementById("totalDisplay");
const btnCheckout = document.getElementById("btnCheckout");
const couponInput = document.getElementById("couponInput");
const couponMsg = document.getElementById("couponMsg");
const searchInput = document.getElementById("searchInput");

// Modal Elements
const orderModalBackdrop = document.getElementById("orderModalBackdrop");
const checkoutStep = document.getElementById("checkoutStep");
const trackingStep = document.getElementById("trackingStep");

// Initialize UI
function init() {
  renderWallet();
  renderRestaurants();
  renderFoodItems();
  updateCartUI();
  setupEventListeners();
}

function renderWallet() {
  if (walletDisplay) {
    walletDisplay.textContent = `₹${currentCustomer.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
}

function renderRestaurants() {
  if (!restaurantsStrip) return;
  restaurantsStrip.innerHTML = restaurants.map(r => `
    <div class="restaurant-card ${activeRestaurantId === r.restaurantId ? 'selected' : ''}" onclick="toggleRestaurantFilter(${r.restaurantId})">
      <div class="restaurant-header">
        <h4 class="restaurant-name">${r.name}</h4>
        <span class="restaurant-rating">★ ${r.rating}</span>
      </div>
      <div class="restaurant-location">📍 ${r.location}</div>
      <div class="restaurant-badge-row">
        <span class="status-pill ${r.isOpen ? 'open' : 'closed'}">${r.isOpen ? 'Open Now' : 'Closed'}</span>
        <span class="status-pill" style="background:#F2EBE3; color:#59534C;">${r.menu.length} Dishes</span>
      </div>
    </div>
  `).join('');
}

function toggleRestaurantFilter(restaurantId) {
  if (activeRestaurantId === restaurantId) {
    activeRestaurantId = null;
  } else {
    activeRestaurantId = restaurantId;
  }
  renderRestaurants();
  renderFoodItems();
}

function renderFoodItems() {
  if (!foodGrid) return;
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let filtered = foodCatalog.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesRestaurant = !activeRestaurantId || item.restaurantId === activeRestaurantId;
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    return matchesCategory && matchesRestaurant && matchesSearch;
  });

  if (filtered.length === 0) {
    foodGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 6px;">No culinary items found matching your filter.</p>
        <span style="font-size: 0.85rem;">Try clearing search or picking another kitchen category.</span>
      </div>
    `;
    return;
  }

  foodGrid.innerHTML = filtered.map(item => {
    const restaurant = restaurants.find(r => r.restaurantId === item.restaurantId);
    const inCart = currentCustomer.cart.items.find(ci => ci.foodItem.itemId === item.itemId);
    const qty = inCart ? inCart.quantity : 0;

    return `
      <div class="food-card">
        <div class="food-card-top">
          <div class="food-category-tag">${item.category}</div>
          <h3 class="food-title">${item.name}</h3>
          <div class="food-restaurant-ref">from ${restaurant ? restaurant.name : 'Artisan Kitchen'}</div>
          <p class="food-desc">${item.description}</p>
        </div>
        <div class="food-card-bottom">
          <div class="food-price">₹${item.price.toLocaleString('en-IN')}</div>
          ${qty > 0 ? `
            <div class="qty-controller">
              <button class="qty-btn" onclick="modifyCart(${item.itemId}, -1)">−</button>
              <span class="qty-value">${qty}</span>
              <button class="qty-btn" onclick="modifyCart(${item.itemId}, 1)">+</button>
            </div>
          ` : `
            <button class="btn-add-food" onclick="modifyCart(${item.itemId}, 1)">+ Add</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function modifyCart(itemId, delta) {
  const item = foodCatalog.find(f => f.itemId === itemId);
  if (!item) return;

  if (delta > 0) {
    currentCustomer.cart.addItem(item);
  } else {
    currentCustomer.cart.removeItem(itemId);
  }
  updateCartUI();
  renderFoodItems();
}

function updateCartUI() {
  const cart = currentCustomer.cart;
  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.totalAmount;

  if (cartCountBadge) cartCountBadge.textContent = count;
  if (cartNavTotal) cartNavTotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  if (subtotalDisplay) subtotalDisplay.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  let discount = 0;
  if (appliedCoupon && appliedCoupon.isValid() && subtotal > 0) {
    const discountedSubtotal = appliedCoupon.apply(subtotal);
    discount = subtotal - discountedSubtotal;
    if (discountRow) discountRow.style.display = 'flex';
    if (discountDisplay) discountDisplay.textContent = `-₹${discount.toLocaleString('en-IN')} (${appliedCoupon.discountPercent}%)`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  const deliveryFee = subtotal > 0 ? 40 : 0;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);
  if (totalDisplay) totalDisplay.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;

  if (btnCheckout) {
    btnCheckout.disabled = cart.items.length === 0;
    btnCheckout.textContent = cart.items.length === 0 ? "Your Cart is Empty" : `Checkout • ₹${finalTotal.toLocaleString('en-IN')}`;
  }

  // Render items inside drawer
  if (cartItemsList) {
    if (cart.items.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🥣</div>
          <p style="font-weight: 600; color: var(--text-main); margin-bottom: 4px;">Your cart is empty</p>
          <span style="font-size: 0.85rem;">Browse handcrafted meals from top local kitchens and add them here.</span>
        </div>
      `;
    } else {
      cartItemsList.innerHTML = cart.items.map(ci => `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <div class="cart-item-name">${ci.foodItem.name}</div>
            <div class="cart-item-unitprice">₹${ci.foodItem.price.toLocaleString('en-IN')} each</div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-controller">
              <button class="qty-btn" onclick="modifyCart(${ci.foodItem.itemId}, -1)">−</button>
              <span class="qty-value">${ci.quantity}</span>
              <button class="qty-btn" onclick="modifyCart(${ci.foodItem.itemId}, 1)">+</button>
            </div>
            <div class="cart-item-subtotal">₹${ci.subTotal.toLocaleString('en-IN')}</div>
          </div>
        </div>
      `).join('');
    }
  }
}

function openCart() {
  if (cartOverlay) cartOverlay.classList.add("open");
  if (cartDrawer) cartDrawer.classList.add("open");
}

function closeCart() {
  if (cartOverlay) cartOverlay.classList.remove("open");
  if (cartDrawer) cartDrawer.classList.remove("open");
}

function applyCouponCode() {
  if (!couponInput) return;
  const code = couponInput.value.trim().toUpperCase();
  const found = activeCoupons.find(c => c.code === code && c.isValid());
  
  if (found) {
    appliedCoupon = found;
    couponMsg.textContent = `Coupon ${found.code} applied! ${found.discountPercent}% discount active.`;
    couponMsg.className = "coupon-status-msg success";
  } else {
    appliedCoupon = null;
    couponMsg.textContent = "Invalid coupon code. Use FEAST20 for 20% off.";
    couponMsg.className = "coupon-status-msg error";
  }
  updateCartUI();
}

function openCheckoutModal() {
  if (currentCustomer.cart.items.length === 0) return;
  closeCart();
  if (orderModalBackdrop) orderModalBackdrop.classList.add("open");
  if (checkoutStep) checkoutStep.style.display = "block";
  if (trackingStep) trackingStep.style.display = "none";
  renderCheckoutSummary();
}

function closeOrderModal() {
  if (orderModalBackdrop) orderModalBackdrop.classList.remove("open");
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll(".payment-option-card").forEach(el => {
    if (el.dataset.method === method) {
      el.classList.add("selected");
    } else {
      el.classList.remove("selected");
    }
  });
}

function renderCheckoutSummary() {
  const cart = currentCustomer.cart;
  const itemsContainer = document.getElementById("checkoutOrderItems");
  const subtotal = cart.totalAmount;
  let discount = 0;
  if (appliedCoupon && appliedCoupon.isValid()) {
    discount = subtotal - appliedCoupon.apply(subtotal);
  }
  const total = Number((subtotal - discount + 40).toFixed(2));

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.items.map(i => `
      <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:6px;">
        <span>${i.quantity}x ${i.foodItem.name}</span>
        <span style="font-weight:600;">₹${i.subTotal.toLocaleString('en-IN')}</span>
      </div>
    `).join('') + `
      <div style="border-top:1px dashed var(--border-color); margin-top:10px; padding-top:10px; display:flex; justify-content:space-between; font-weight:700;">
        <span>Total Payable:</span>
        <span style="color:var(--accent-primary);">₹${total.toLocaleString('en-IN')}</span>
      </div>
    `;
  }

  const walletOptionSub = document.getElementById("walletOptionSub");
  if (walletOptionSub) {
    walletOptionSub.textContent = `Available Balance: ₹${currentCustomer.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
}

function confirmAndPlaceOrder() {
  const firstCartItem = currentCustomer.cart.items[0];
  const restaurant = firstCartItem ? restaurants.find(r => r.restaurantId === firstCartItem.foodItem.restaurantId) || restaurants[0] : restaurants[0];

  const order = currentCustomer.placeOrder(restaurant, selectedPaymentMethod, appliedCoupon);
  if (!order) return;

  // Auto assign delivery partner
  defaultDeliveryPartner.acceptDelivery(order);

  currentTrackingOrder = order;
  renderWallet();
  updateCartUI();
  renderFoodItems();

  // Switch to live tracker view
  if (checkoutStep) checkoutStep.style.display = "none";
  if (trackingStep) trackingStep.style.display = "block";
  renderOrderTracking();
}

function renderOrderTracking() {
  if (!currentTrackingOrder) return;
  const o = currentTrackingOrder;

  const trackerOrderId = document.getElementById("trackerOrderId");
  const trackerTime = document.getElementById("trackerTime");
  const trackerRestaurantName = document.getElementById("trackerRestaurantName");
  const trackerTotal = document.getElementById("trackerTotal");
  const trackerPartnerName = document.getElementById("trackerPartnerName");
  const trackerPartnerVehicle = document.getElementById("trackerPartnerVehicle");

  if (trackerOrderId) trackerOrderId.textContent = `Order #ORD-${o.orderId}`;
  if (trackerTime) trackerTime.textContent = o.orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (trackerRestaurantName) trackerRestaurantName.textContent = o.restaurant ? o.restaurant.name : 'Kitchen';
  if (trackerTotal) trackerTotal.textContent = `₹${o.totalAmount.toLocaleString('en-IN')}`;
  if (trackerPartnerName) trackerPartnerName.textContent = o.deliveryPartner ? o.deliveryPartner.name : 'Awaiting assignment';
  if (trackerPartnerVehicle) trackerPartnerVehicle.textContent = o.deliveryPartner ? o.deliveryPartner.vehicleNo : '-';

  // Update stepper nodes
  const statuses = [
    OrderStatus.PLACED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED
  ];

  const currentIdx = statuses.indexOf(o.status);
  const isCancelled = o.status === OrderStatus.CANCELLED;

  statuses.forEach((st, idx) => {
    const node = document.getElementById(`stepNode_${st}`);
    if (!node) return;
    node.classList.remove("done", "active");

    if (isCancelled) {
      if (idx === 0) node.classList.add("done");
    } else {
      if (idx < currentIdx) {
        node.classList.add("done");
      } else if (idx === currentIdx) {
        node.classList.add("active");
      }
    }
  });

  const simAdvanceBtn = document.getElementById("btnSimAdvance");
  if (simAdvanceBtn) {
    simAdvanceBtn.disabled = o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELLED;
  }
}

function advanceOrderStatusSimulation() {
  if (!currentTrackingOrder) return;
  const flow = [
    OrderStatus.PLACED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED
  ];
  const curIdx = flow.indexOf(currentTrackingOrder.status);
  if (curIdx < flow.length - 1) {
    const nextStatus = flow[curIdx + 1];
    defaultDeliveryPartner.updateDeliveryStatus(currentTrackingOrder, nextStatus);
    renderOrderTracking();
  }
}

function cancelCurrentOrder() {
  if (!currentTrackingOrder) return;
  const success = currentCustomer.cancelOrder(currentTrackingOrder.orderId);
  if (success) {
    alert(`Order #ORD-${currentTrackingOrder.orderId} has been cancelled. ₹${currentTrackingOrder.totalAmount.toLocaleString('en-IN')} refunded to your wallet.`);
    renderWallet();
    renderOrderTracking();
  }
}

// ==================== ROLE PORTALS & OPERATIONAL PANELS ====================
// Replaces raw UML type signatures with real, interactive tools and dashboards
function showRoleOverview(roleName) {
  const modal = document.getElementById("roleOverviewModal");
  const modalTitle = document.getElementById("roleModalTitle");
  const modalContent = document.getElementById("roleOverviewContent");
  if (!modal || !modalContent) return;

  // Update active pill state in top bar
  document.querySelectorAll(".role-pill-btn").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.toLowerCase().includes(roleName.toLowerCase()));
  });

  if (roleName === "Customer") {
    if (modalTitle) modalTitle.textContent = "Customer Profile & Account";
    modalContent.innerHTML = `
      <div class="role-modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <h3 class="role-card-title">${currentCustomer.name}</h3>
            <p class="role-card-subtitle">${currentCustomer.email} &bull; ${currentCustomer.phone}</p>
          </div>
          <span class="status-pill open">Active Member</span>
        </div>

        <div style="background:var(--bg-subtle); padding:12px 14px; border-radius:var(--radius-sm); margin-bottom:16px;">
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:2px;">Primary Delivery Address</div>
          <div style="font-size:0.88rem; font-weight:600; color:var(--text-main);">📍 ${currentCustomer.address.getFormatted()}</div>
        </div>

        <div style="background:#FFF9F5; border:1px solid #F3DEC8; padding:14px; border-radius:var(--radius-sm); margin-bottom:18px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:0.8rem; color:var(--text-muted);">In-App Wallet Balance</div>
            <div style="font-size:1.4rem; font-weight:800; color:var(--accent-primary);">₹${currentCustomer.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <button class="portal-action-btn" onclick="addFundsCustomer(500)">+ Add ₹500 Funds</button>
        </div>

        <h4 style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:10px;">Quick Customer Actions</h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button class="portal-action-btn secondary" onclick="closeRoleOverview(); openCart();">🛒 View Active Cart</button>
          <button class="portal-action-btn secondary" onclick="closeRoleOverview(); checkActiveOrderTrack();">📦 Track Latest Order</button>
          <button class="portal-action-btn secondary" onclick="alert('Indiranagar address is set as your default delivery location.')">📍 Manage Addresses</button>
        </div>
      </div>
    `;
  } else if (roleName === "DeliveryPartner") {
    if (modalTitle) modalTitle.textContent = "Delivery Partner Dashboard";
    modalContent.innerHTML = `
      <div class="role-modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <h3 class="role-card-title">${defaultDeliveryPartner.name}</h3>
            <p class="role-card-subtitle">${defaultDeliveryPartner.vehicleNo} &bull; Rider Rating: ★ ${defaultDeliveryPartner.rating}</p>
          </div>
          <span class="status-pill ${defaultDeliveryPartner.isAvailable ? 'open' : 'closed'}">
            ${defaultDeliveryPartner.isAvailable ? '🟢 Online & Ready' : '🛵 On Live Run'}
          </span>
        </div>

        <!-- Live Performance Metrics -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:18px;">
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Today's Completed Runs</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--text-main);">${defaultDeliveryPartner.completedDeliveries} Orders</div>
          </div>
          <div style="background:var(--accent-green-subtle); border:1px solid rgba(43,110,72,0.2); padding:12px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--accent-green);">Today's Payout</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--accent-green);">₹${defaultDeliveryPartner.todayEarnings.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <h4 style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:10px;">Rider Field Operations</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="portal-action-btn" onclick="riderAcceptJob()">
            ${defaultDeliveryPartner.isAvailable ? '✅ Accept Next Dispatched Order' : '📦 Advance Delivery Step'}
          </button>
          <button class="portal-action-btn secondary" onclick="toggleRiderShift()">
            🔄 Toggle Shift Availability (${defaultDeliveryPartner.isAvailable ? 'Go Offline' : 'Go Online'})
          </button>
        </div>
      </div>
    `;
  } else if (roleName === "Admin") {
    if (modalTitle) modalTitle.textContent = "Kitchen & Platform Operations Portal";
    const reports = new Admin(99, "Operations Admin", "ops@savor.com", "root123").viewReports();
    modalContent.innerHTML = `
      <div class="role-modal-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div>
            <h3 class="role-card-title">Live Platform Performance</h3>
            <p class="role-card-subtitle">Real-time settlement & kitchen management</p>
          </div>
          <span class="status-pill open">System Healthy</span>
        </div>

        <!-- Operations Grid -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:18px;">
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Platform GMV (Today)</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--text-main);">${reports.totalRevenue}</div>
          </div>
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Platform Net Fee (15%)</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--accent-green);">${reports.platformCommission}</div>
          </div>
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Active Kitchens</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--text-main);">${restaurants.length} Open Now</div>
          </div>
          <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem; color:var(--text-muted);">Orders Dispatched</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--text-main);">${reports.activeOrdersToday} Orders</div>
          </div>
        </div>

        <h4 style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:10px;">Platform Management Tools</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="portal-action-btn" onclick="addNewDemoKitchen()">+ Onboard New Kitchen Partner</button>
          <button class="portal-action-btn secondary" onclick="downloadAuditReport()">📊 Export Daily Financial Report (CSV)</button>
        </div>
      </div>
    `;
  }

  modal.classList.add("open");
}

function closeRoleOverview() {
  const modal = document.getElementById("roleOverviewModal");
  if (modal) modal.classList.remove("open");
}

// Supporting Portal Actions
function addFundsCustomer(amount) {
  currentCustomer.addWalletFunds(amount);
  renderWallet();
  showRoleOverview('Customer');
}

function checkActiveOrderTrack() {
  if (currentTrackingOrder) {
    if (orderModalBackdrop) orderModalBackdrop.classList.add("open");
    if (checkoutStep) checkoutStep.style.display = "none";
    if (trackingStep) trackingStep.style.display = "block";
    renderOrderTracking();
  } else {
    alert("No active orders placed yet. Add items to your cart and checkout!");
  }
}

function toggleRiderShift() {
  defaultDeliveryPartner.isAvailable = !defaultDeliveryPartner.isAvailable;
  showRoleOverview('DeliveryPartner');
}

function riderAcceptJob() {
  if (currentTrackingOrder) {
    if (currentTrackingOrder.status !== OrderStatus.DELIVERED && currentTrackingOrder.status !== OrderStatus.CANCELLED) {
      advanceOrderStatusSimulation();
      showRoleOverview('DeliveryPartner');
    } else {
      alert("Current order has already reached its destination.");
    }
  } else {
    alert("No active order currently in the dispatch queue. Place an order from the menu first!");
  }
}

function addNewDemoKitchen() {
  const newId = restaurants.length + 1;
  const newKitchen = new Restaurant(newId, "Saffron & Spice Kitchen", "MG Road Central", 4.9, true);
  const dish = new FoodItem(501, "Awadhi Slow-Dum Biryani Bowl", 340, "Healthy Bowls", true, "Long-grain aged basmati, whole spices, saffron-infused yogurt raita", newId);
  newKitchen.manageMenu(dish);
  restaurants.push(newKitchen);
  foodCatalog.push(dish);
  renderRestaurants();
  renderFoodItems();
  alert("New kitchen 'Saffron & Spice Kitchen' successfully onboarded and visible on homepage!");
  showRoleOverview('Admin');
}

function downloadAuditReport() {
  alert("Financial reconciliation report generated. 42 orders audited with 100% settlement accuracy.");
}

function setupEventListeners() {
  // Category chips
  if (filterChips) {
    filterChips.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.category;
      renderFoodItems();
    });
  }

  // Live search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderFoodItems();
    });
  }
}

// Expose globals for inline onclick handlers
window.toggleRestaurantFilter = toggleRestaurantFilter;
window.modifyCart = modifyCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.applyCouponCode = applyCouponCode;
window.openCheckoutModal = openCheckoutModal;
window.closeOrderModal = closeOrderModal;
window.selectPaymentMethod = selectPaymentMethod;
window.confirmAndPlaceOrder = confirmAndPlaceOrder;
window.advanceOrderStatusSimulation = advanceOrderStatusSimulation;
window.cancelCurrentOrder = cancelCurrentOrder;
window.showRoleOverview = showRoleOverview;
window.closeRoleOverview = closeRoleOverview;
window.addFundsCustomer = addFundsCustomer;
window.checkActiveOrderTrack = checkActiveOrderTrack;
window.toggleRiderShift = toggleRiderShift;
window.riderAcceptJob = riderAcceptJob;
window.addNewDemoKitchen = addNewDemoKitchen;
window.downloadAuditReport = downloadAuditReport;

// Boot
document.addEventListener("DOMContentLoaded", init);
