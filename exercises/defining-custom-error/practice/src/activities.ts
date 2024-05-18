// TODO Part B: Import CreditCardNumberError and InvalidddressError from `shared.ts`.
import { Address, Bill, Distance, InvalidChargeError, OrderConfirmation } from './shared';
import { log } from '@temporalio/activity';

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

  let chargeAmount = bill.amount;

  // This month's special offer: Get $5 off all orders over $30
  if (bill.amount > 3000) {
    log.info('Applying discount');

    chargeAmount -= 500; // reduce amount charged by 500 cents
  }

  // reject invalid amounts before calling the payment processor
  if (chargeAmount < 0) {
    throw new InvalidChargeError(chargeAmount);
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

export async function validateAddress(address: Address): Promise<void> {
  log.info('validateAddress invoked', { Address: address });

  // Regular expression to check for special characters
  const specialCharRegex = /[!@#$%^&*()?":{}|<>]/;

  // Check if the zip code has exactly 5 characters
  const isPostalCodeValid = address.postalCode.length == 5;

  // Check if any address fields contain special characters
  const hasSpecialChars = [address.line1, address.line2, address.city, address.state].some(
    (field) => field && specialCharRegex.test(field)
  );

  if (!isPostalCodeValid || hasSpecialChars) {
    // TODO Part C: Replace line 75 with throwing a new InvalidAddressError
    // You can use line 39 as a reference.
    // Pass in the address into the Error.
    log.error('invalid address');
  }

  log.info('validateAddress complete', { Address: address });
}

export async function validateCreditCard(creditCardNumber: string): Promise<void> {
  log.info('validateCreditCard invoked', { CreditCardNumber: creditCardNumber });

  // Check if the credit card number has 16 digits
  const isValid = creditCardNumber.length == 16;

  if (!isValid) {
    // TODO Part C: Replace line 91 with throwing a new CreditCardNumberError
    // You can use line 39 as a reference.
    // Pass in the creditCardNumber into the Error.
    log.error('invalid credit card number');
  }

  log.info('Credit card validated:', { CreditCardNumber: creditCardNumber });
}
