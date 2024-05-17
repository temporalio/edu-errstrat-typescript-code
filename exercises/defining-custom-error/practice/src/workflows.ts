// TODO Part F: Add ApplicationFailure and ActivityFailure
// into your imports from @temporalio/workflow
import { proxyActivities, log, sleep } from '@temporalio/workflow';
import type * as activities from './activities';
// TODO Part G: Import OutOfServiceAreaError from shared.ts
import { Distance, OrderConfirmation, PizzaOrder } from './shared';

const { sendBill, getDistance, validateAddress, validateCreditCard } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: {
    maximumInterval: '10 seconds',
  },
});

export async function pizzaWorkflow(order: PizzaOrder): Promise<OrderConfirmation> {
  let totalPrice = 0;

  // Validate the address
  try {
    await validateAddress(order.address);
  } catch (err) {
    if (err instanceof ActivityFailure && err.cause instanceof ApplicationFailure) {
      log.error(err.cause.message);
    } else {
      log.error(`error validating address: ${err}`);
    }
  }

  if (order.isDelivery) {
    let distance: Distance | undefined = undefined;

    try {
      distance = await getDistance(order.address);
    } catch (err) {
      log.error('Unable to get distance', {});
      throw err;
    }
    if (distance.kilometers > 25) {
      log.error('Customer lives too far away for delivery');
      // TODO Part G: Add a line to throw OutOfServiceAreaError
    }
  }

  for (const pizza of order.items) {
    totalPrice += pizza.price;
  }

  // Validate the credit card number
  try {
    await validateCreditCard(order.customer.creditCardNumber);
  } catch (err) {
    // TODO Part F: Following line 22 as an example
    // Log the message of the error if there is an error thrown
    // In the validateCreditCard Activity
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
    return await sendBill(bill);
  } catch (err) {
    log.error('Unable to bill customer', {});
    throw err;
  }
}
