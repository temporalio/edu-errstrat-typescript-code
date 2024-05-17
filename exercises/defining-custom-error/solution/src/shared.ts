import { ApplicationFailure } from "@temporalio/common";

export const TASK_QUEUE_NAME = 'pizza-tasks';

export class OutOfServiceAreaError extends ApplicationFailure {
  constructor() {
    super('Customer lives too far away for delivery');
  }
}

export class CreditCardNumberError extends Error {
  constructor(creditCardNumber: string) {
    super(`Invalid credit card number: ${creditCardNumber}: (must contain exactly 16 digits)`);
  }
}

export class InvalidAddressError extends Error {
  constructor(address: Address) {
    super(`Invalid address: ${JSON.stringify(address)}: (postal code must be 5 digits and no special characters in address fields)`);
  }
}

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
