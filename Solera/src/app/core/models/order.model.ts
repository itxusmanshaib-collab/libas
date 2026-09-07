export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  user: { fullName: string; email: string };
  items: OrderItem[];
}
