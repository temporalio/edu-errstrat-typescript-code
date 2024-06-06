import { proxyActivities, ApplicationFailure, ActivityFailure, log, sleep } from '@temporalio/workflow';
import type * as activities from './activities';
import { Distance, OrderConfirmation, PizzaOrder } from './shared';

const {
  sendBill,
  getDistance,
  validateCreditCard,
  pollDeliveryDriver,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  heartbeatTimeout: '30 seconds',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 1.0,
    maximumInterval: '1 second',
    maximumAttempts: 5,
    nonRetryableErrorTypes: ['InvalidCreditCardErr', 'InvalidChargeAmount']
  },
});

export async function pizzaWorkflow(order: PizzaOrder): Promise<OrderConfirmation> {
  let totalPrice = 0;

  if (order.isDelivery) {
    let distance: Distance | undefined = undefined;

    try {
      distance = await getDistance(order.address);
    } catch (e) {
      log.error('Unable to get distance', {});
      throw e;
    }
    if (distance.kilometers > 25) {
      throw ApplicationFailure.create({
        message: 'Customer lives too far away for delivery',
        details: [distance.kilometers],
      });
    }
  }

  for (const pizza of order.items) {
    totalPrice += pizza.price;
  }

  // Validate the credit card number
  try {
    await validateCreditCard(order.customer.creditCardNumber);
  } catch (err) {
    if (err instanceof ActivityFailure && err.cause instanceof ApplicationFailure) {
      log.error(err.cause.message);
    } else {
      log.error(`error validating credit card number: ${err}`);
    }
  }

  // We use a short Timer duration here to avoid delaying the exercise
  await sleep('3 seconds');

  const bill = {
    customerID: order.customer.customerID,
    orderNumber: order.orderNumber,
    amount: totalPrice,
    description: 'Pizza',
  };

  try {
    await sendBill(bill);
    await pollDeliveryDriver(order);

    const orderConfirmation = {
      orderNumber: bill.orderNumber,
      confirmationNumber: 'AB9923',
      status: 'SUCCESS',
      billingTimestamp: Date.now(),
      amount: bill.amount,
    };

    return orderConfirmation;
  } catch (e) {
    log.error('Unable to bill customer', {});
    throw e;
  }
}
