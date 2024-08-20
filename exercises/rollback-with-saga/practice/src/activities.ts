import { Address, Bill, Distance, OrderConfirmation } from './shared';
import { ApplicationFailure } from '@temporalio/common';
import { log } from '@temporalio/activity';
import { PizzaOrder } from './shared';

export async function getDistance(address: Address): Promise<Distance> {
  log.info('getDistance invoked; determining distance to customer address');

  // this is a simulation, which calculates a fake (but consistent)
  // distance for a customer address based on its length. The value
  // will therefore be different when called with different addresses,
  // but will be the same across all invocations with the same address.
  let kilometers: number = address.line1.length + address.line2.length - 10;
  if (kilometers < 1) {
    kilometers = 5;
  }

  const distance = {
    kilometers,
  };

  log.info('getDistance complete', { distance });
  return distance;
}

export async function sendBill(bill: Bill): Promise<OrderConfirmation> {
  log.info('sendBill invoked', { Customer: bill.customerID, Amount: bill.amount });

  // TODO Part A: Create a Test Error.
  // Throw an Application Failure that is nonRetryable.
  // The message should just say `Test Error`.

  let chargeAmount = bill.amount;

  // This month's special offer: Get $5 off all orders over $30
  if (bill.amount > 3000) {
    log.info('Applying discount');

    chargeAmount -= 500; // reduce amount charged by 500 cents
  }

  // reject invalid amounts before calling the payment processor
  if (chargeAmount < 0) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `Invalid charge amount: ${chargeAmount} (must be above zero)`,
      details: [chargeAmount],
    });
  }

  // pretend we called a payment processing service here :-)

  const confirmation = {
    orderNumber: bill.orderNumber,
    confirmationNumber: 'AB9923',
    status: 'SUCCESS',
    billingTimestamp: Date.now(),
    amount: chargeAmount,
  };

  log.info('sendBill complete', { confirmation });

  return confirmation;
}

export async function validateCreditCard(creditCardNumber: string): Promise<void> {
  log.info('validateCreditCard invoked', { CreditCardNumber: creditCardNumber });

  // Check if the credit card number has 16 digits
  const isValid = creditCardNumber.length == 16;

  if (!isValid) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `Invalid credit card number: ${creditCardNumber}: (must contain exactly 16 digits)`,
      details: [creditCardNumber],
    });
  }

  log.info('Credit card validated:', { CreditCardNumber: creditCardNumber });
}

export async function updateInventory(items: PizzaOrder['items']): Promise<void> {
  // Here you would call your inventory management system to reduce the stock of your pizza inventory

  log.info('updateInventory complete', { items });
}

// TODO Part B: Uncomment the  `revertInventory` Activity.
// This Activity will roll back on the `updateInventory` Activity.
// export async function revertInventory(items: PizzaOrder['items']): Promise<void> {
//   // Here you would call your inventory management system to add the ingredients back into the pizza inventory.
//   log.info('revertInventory complete', { items });
// }

// TODO Part B: Uncomment the `refundCustomer` Activity/
// This Activity will roll back on the `sendBill` Activity.
// Pass into the `refundCustomer` an argument of `bill`
// which takes the `Bill` type.
// export async function refundCustomer(): Promise<void> {
//   // Simulate refunding the customer
//   log.info(`Refunding ${bill.amount} to customer ${bill.customerID} for order ${bill.orderNumber}`);;
// }
