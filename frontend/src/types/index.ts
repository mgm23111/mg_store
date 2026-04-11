// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// Product
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  retailPrice: number;
  wholesalePrice?: number;
  wholesaleMinQuantity?: number;
  discountPercentage?: number; // Calculated field from backend
  totalStock?: number; // Sum of all variants stock
  isActive: boolean;
  isFeatured: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  colorId?: number | null;
}

export interface ProductVariant {
  id: number;
  sku: string;
  color?: Color;
  size?: Size;
  stockQuantity: number;
  reservedQuantity: number;
  availableStock: number;
  isActive: boolean;
}

export interface Color {
  id: number;
  name: string;
  hexCode: string;
}

export interface Size {
  id: number;
  name: string;
  sortOrder: number;
}

// Category
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

// Cart
export interface Cart {
  id: number;
  sessionId: string;
  customerId?: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalItems: number;
  appliedCouponCode?: string;
  appliedGiftCardCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number;
  sku: string;
  color?: Color;
  size?: Size;
  variantInfo?: string; // "Color: Red, Size: M"
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  subtotal: number; // Same as totalPrice
  availableStock: number;
  imageUrl?: string;
  productImage?: string; // Same as imageUrl
}

export interface AddToCartRequest {
  sessionId: string;
  productVariantId: number;
  quantity: number;
}

// Order
export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocumentType?: string;
  customerDocumentNumber?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: number;
  productName: string;
  colorName?: string;
  sizeName?: string;
  variantInfo?: string; // "Color: Red, Size: M"
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  notes?: string;
}

export interface CheckoutRequest {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  shippingMethodId: number;
  paymentMethod: 'CULQI' | 'YAPE';
  couponCode?: string;
  giftCardCode?: string;
}

// Shipping Method
export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  basePrice: number;
  estimatedDays: string;
  isActive: boolean;
}

// Coupon
export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minPurchaseAmount: number;
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isValid: boolean;
}

// Gift Card
export interface GiftCard {
  id: number;
  code: string;
  initialBalance: number;
  currentBalance: number;
  validUntil?: string;
  isActive: boolean;
  isValid: boolean;
}

// Payment
export interface Payment {
  id: number;
  order: Order;
  paymentMethod: string;
  amount: number;
  status: string;
  culqiChargeId?: string;
  culqiTransactionId?: string;
  yapeTransactionImageUrl?: string;
  yapeApprovalNotes?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

// Store Settings
export interface StoreSettings {
  id: number;
  companyName: string;
  logoUrl?: string | null;
  updatedAt?: string;
}
