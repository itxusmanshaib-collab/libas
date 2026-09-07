export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productImage: string;
  unitPrice: number;
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  quantity: number;
  subTotal: number;
  availableStock: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}
