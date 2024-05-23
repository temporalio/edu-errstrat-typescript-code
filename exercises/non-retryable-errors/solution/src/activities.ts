import { Address, Bill, Distance, OrderConfirmation } from './shared';
import axios from 'axios';
import { ApplicationFailure } from '@temporalio/common';
import { log, heartbeat, activityInfo } from '@temporalio/activity';
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
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `Invalid address: ${JSON.stringify(
        address
      )}: (postal code must be 5 digits and no special characters in address fields)`,
      details: [address],
    });
  }
  log.info('validateAddress complete', { Address: address });
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

export async function notifyInternalDeliveryDriver(order: PizzaOrder): Promise<void> {
  log.info('notifyInternalDeliveryDriver invoked', { Order: order });
  // Simulate that the internal driver is not available
  throw ApplicationFailure.create({
    message: `Error fetching internal driver`,
    details: [order],
  });
}

// If an internal driver is not available, we poll the externalDeliveryDriver service
export async function pollExternalDeliveryDriver(order: PizzaOrder): Promise<void> {
  log.info('pollExternalDeliveryDriver invoked', { Order: order });

  // Allow for resuming from heartbeat
  const startingPoint = activityInfo().heartbeatDetails || 1;

  const url = 'http://localhost:9998/getExternalDeliveryDriver';

  log.info('Starting activity at progress', { startingPoint });
  for (let progress = startingPoint; progress <= 10; progress++) {
    try {
      log.info('Polling external delivery driver...', { progress });
      const response = await axios.get(url);
      const content = response.data;
      heartbeat(progress);

      // Skips polling if status code is in the 500s or 403
      if (response.status >= 500 || response.status == 403) {
        throw ApplicationFailure.create({ message: `Error. Status Code: ${response.status}`, nonRetryable: true });
      }

      log.info(`External delivery driver assigned from: ${content.service}`);

      // Break the loop if the response is successful
      break;
    } catch (error: any) {
      if (error.response) {
        log.error('External delivery driver request failed:', {
          status: error.response.status,
          data: error.response.data,
        });
        throw new Error(`HTTP Error ${error.response.status}: ${error.response.data}`);
      } else if (error.request) {
        log.error('External delivery driver request failed:', { request: error.request });
        throw new Error(`Request error: ${error.request}`);
      } else {
        log.error('Something else failed during polling external delivery driver.');
        throw new Error('Something else failed during polling external delivery driver.');
      }
    }
  }
}
