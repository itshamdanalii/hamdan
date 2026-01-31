
export interface Product {
  id?: number;
  name: string;
  price: number;
  category?: string;
}

export interface BillItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export type PaymentMode = 'Cash' | 'UPI';

export interface Bill {
  id?: number;
  billNumber: string;
  date: Date;
  items: BillItem[];
  subTotal: number;
  tax: number;
  total: number;
  paymentMode: PaymentMode;
}

export interface Expense {
  id?: number;
  amount: number;
  note: string;
  date: Date;
}

export interface Settings {
  id?: number;
  shopName: string;
  shopPhone: string;
  currencySymbol: string;
}
