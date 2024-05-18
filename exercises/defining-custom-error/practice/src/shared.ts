// TODO Part E: Uncomment the import statement below
// import { ApplicationFailure } from "@temporalio/common";

export const TASK_QUEUE_NAME = 'pizza-tasks';

// TODO Part F: Create a new error called OutOfServiceAreaError
// This error should extend ApplicationFailure
// Let it log theh string: 'Customer lives too far away for delivery'

// TODO Part A: Using the `InvalidChargeError` below as a template,
// create two new errors: `InvalidAddressError` and `CreditCardNumberError`.

export class InvalidChargeError extends Error {
  constructor(chargeAmount: number) {
    super(`invalid charge amount: ${chargeAmount} (must be above zero)`);
  }
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
  description: string;
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
