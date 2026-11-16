"""
food_ordering.py - Core Object-Oriented Domain Classes
Online Food Ordering System
Directly implemented from the StarUML Class Diagram (15 Classes)
Author: S HARIPRIYA | USN: IMP24CG039 | CSD
"""

from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
from typing import List, Optional


# ==========================================
# Enumerations
# ==========================================

class OrderStatus(Enum):
    """Fixed list of order stages."""
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PREPARING = "PREPARING"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentMethod(Enum):
    """Fixed list of payment options."""
    UPI = "UPI"
    CARD = "CARD"
    WALLET = "WALLET"
    COD = "COD"


# ==========================================
# User Hierarchy
# ==========================================

class User(ABC):
    """Base class for every user of the system."""
    def __init__(self, user_id: int, name: str, email: str, password: str):
        self._userId = user_id
        self._name = name
        self._email = email
        self._password = password

    def login(self) -> bool:
        """Authenticates user session."""
        return True

    def logout(self) -> None:
        """Terminates user session."""
        pass


class Customer(User):
    """The person who orders food."""
    def __init__(self, user_id: int, name: str, email: str, password: str, phone: str, wallet_balance: float = 1500.0):
        super().__init__(user_id, name, email, password)
        self._phone = phone
        self._walletBalance = wallet_balance
        self.addresses: List['Address'] = []
        self.cart: Optional['Cart'] = None

    def browseRestaurants(self) -> List['Restaurant']:
        return []

    def placeOrder(self) -> 'Order':
        if not self.cart:
            raise ValueError("Cart is empty")
        return self.cart.checkout()

    def trackOrder(self) -> None:
        pass

    def cancelOrder(self) -> None:
        pass


class Admin(User):
    """Manages the whole platform."""
    def manageRestaurants(self) -> None:
        pass

    def manageUsers(self) -> None:
        pass

    def viewReports(self) -> None:
        pass


class DeliveryPartner(User):
    """Delivers the order to the customer."""
    def __init__(self, user_id: int, name: str, email: str, password: str, vehicle_no: str, is_available: bool = True):
        super().__init__(user_id, name, email, password)
        self._vehicleNo = vehicle_no
        self._isAvailable = is_available

    def acceptDelivery(self) -> None:
        self._isAvailable = False

    def updateDeliveryStatus(self) -> None:
        pass


# ==========================================
# Domain Entities
# ==========================================

class Address:
    """Stores a delivery address."""
    def __init__(self, line: str, city: str, pincode: str):
        self._line = line
        self._city = city
        self._pincode = pincode


class FoodItem:
    """A dish on the restaurant menu."""
    def __init__(self, item_id: int, name: str, price: float, category: str, is_available: bool = True):
        self._itemId = item_id
        self._name = name
        self._price = price
        self._category = category
        self._isAvailable = is_available

    def updatePrice(self, new_price: float) -> None:
        self._price = new_price

    def setAvailability(self, available: bool) -> None:
        self._isAvailable = available


class Restaurant:
    """The place that sells food."""
    def __init__(self, restaurant_id: int, name: str, location: str, rating: float = 4.5, is_open: bool = True):
        self._restaurantId = restaurant_id
        self._name = name
        self._location = location
        self._rating = rating
        self._isOpen = is_open
        self.menu: List[FoodItem] = []

    def manageMenu(self) -> None:
        pass

    def acceptOrder(self) -> None:
        pass

    def updateOrderStatus(self) -> None:
        pass


class CartItem:
    """One food item inside the cart."""
    def __init__(self, food_item: FoodItem, quantity: int):
        self.food_item = food_item
        self._quantity = quantity
        self._subTotal = food_item._price * quantity

    def calculateSubTotal(self) -> None:
        self._subTotal = self.food_item._price * self._quantity


class Cart:
    """The customer's basket before ordering."""
    def __init__(self, cart_id: int):
        self._cartId = cart_id
        self._totalAmount = 0.0
        self.items: List[CartItem] = []

    def addItem(self, item: CartItem) -> None:
        self.items.append(item)
        self._totalAmount += item._subTotal

    def removeItem(self, item: CartItem) -> None:
        if item in self.items:
            self.items.remove(item)
            self._totalAmount -= item._subTotal

    def clearCart(self) -> None:
        self.items.clear()
        self._totalAmount = 0.0

    def checkout(self) -> 'Order':
        order_items = [OrderItem(i.food_item._name, i.food_item._price, i._quantity) for i in self.items]
        return Order(order_id=101, items=order_items, total_amount=self._totalAmount)


class OrderItem:
    """A saved copy of an ordered item (Snapshot Pattern)."""
    def __init__(self, item_name: str, unit_price: float, quantity: int):
        self._itemName = item_name
        self._unitPrice = unit_price
        self._quantity = quantity


class Payment:
    """Records the payment for an order."""
    def __init__(self, payment_id: int, method: PaymentMethod, status: str, amount: float):
        self._paymentId = payment_id
        self._method = method
        self._status = status
        self._amount = amount

    def processPayment(self) -> bool:
        self._status = "COMPLETED"
        return True

    def refund(self) -> None:
        self._status = "REFUNDED"


class Coupon:
    """A discount code."""
    def __init__(self, code: str, discount_percent: float, expiry_date: datetime):
        self._code = code
        self._discountPercent = discount_percent
        self._expiryDate = expiry_date

    def isValid(self) -> bool:
        return datetime.now() <= self._expiryDate

    def apply(self, amount: float) -> float:
        if self.isValid():
            discount = (self._discountPercent / 100.0) * amount
            return max(0.0, amount - discount)
        return amount


class Order:
    """The central class of the system."""
    def __init__(self, order_id: int, items: List[OrderItem], total_amount: float):
        self._orderId = order_id
        self._orderDate = datetime.now()
        self._status = OrderStatus.PLACED
        self._totalAmount = total_amount
        self.items = items
        self.payment: Optional[Payment] = None
        self.deliveryPartner: Optional[DeliveryPartner] = None
        self.coupon: Optional[Coupon] = None

    def calculateTotal(self) -> float:
        return self._totalAmount

    def updateStatus(self, status: OrderStatus) -> None:
        self._status = status

    def cancelOrder(self) -> None:
        if self._status in [OrderStatus.PLACED, OrderStatus.CONFIRMED]:
            self._status = OrderStatus.CANCELLED
            if self.payment:
                self.payment.refund()
