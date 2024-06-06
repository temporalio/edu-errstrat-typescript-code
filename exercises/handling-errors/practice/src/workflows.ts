// TODO Part B: Add ApplicationFailure and ActivityFailure
// into your imports from @temporalio/workflow
import { proxyActivities, log, sleep } from '@temporalio/workflow';
import type * as activities from './activities';
import { Distance, OrderConfirmation, PizzaOrder } from './shared';

const { sendBill, getDistance, validateCreditCard } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
});

export async function pizzaWorkflow(order: PizzaOrder): Promise<OrderConfirmation> {
  let totalPrice = 0;

  // Validate the credit card number
  try {
    await validateCreditCard(order.customer.creditCardNumber);
  } catch (err) {
    // TODO Part B: Fill out the message and details
    log.error(`Invalid credit card number`);
    throw ApplicationFailure.create({
      message: '',
      details: [],
    });
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
      // TODO C: Throw an Application Failure
      // if the customer lives more than 26km away.
    }
  }

  for (const pizza of order.items) {
    totalPrice += pizza.price;
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
