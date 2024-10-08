export const TASK_QUEUE_NAME = 'pizza-tasks';

export interface Compensation {
  message: string;
  fn: () => Promise<void>;
}

export interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Customer {
  customerID: number;
  creditCardNumber: string;
  name: string;
  email: string;
  phone: string;
}

export interface Pizza {
  type: string;
  ingredients: string[];
  price: number;
}

export interface PizzaOrder {
  orderNumber: string;
  customer: Customer;
  items: Pizza[];
  isDelivery: boolean;
  address: Address;
}

export interface Distance {
  kilometers: number;
}

export interface Bill {
  customerID: number;
  orderNumber: string;
  description: string;
  amount: number;
}

export interface OrderConfirmation {
  orderNumber: string;
  status: string;
  confirmationNumber: string;
  billingTimestamp: number;
  amount: number;
}
