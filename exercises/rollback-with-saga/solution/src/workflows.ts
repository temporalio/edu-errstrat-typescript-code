import { proxyActivities, ApplicationFailure, ActivityFailure, log, sleep } from '@temporalio/workflow';
import type * as activities from './activities';
import { compensate, errorMessage } from './compensationUtils';
import { Distance, PizzaOrder, OrderConfirmation, Compensation } from './shared';

const { sendBill, getDistance, validateCreditCard, refundCustomer, updateInventory, revertInventory } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5 seconds',
  retry: {
    maximumInterval: '10 seconds',
  },
});

export async function pizzaWorkflow(order: PizzaOrder): Promise<OrderConfirmation> {
  let compensations: Compensation[] = [];
  let totalPrice = 0;

  if (order.isDelivery) {
    let distance: Distance | undefined = undefined;

    try {
      distance = await getDistance(order.address);
    } catch (e) {
      log.error(`Unable to get distance: ${e}`);
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
    if (err instanceof ActivityFailure) {
      log.error('Unable to process credit card');
      throw ApplicationFailure.create({
        message: 'Invalid credit card number error',
        details: [order.customer.creditCardNumber],
      });
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
    // Add compensation for updating inventory by removing it
    compensations.unshift({
      message: errorMessage('reversing update inventory'),
      fn: () => revertInventory(order.items),
    });

    // Update inventory by removing pizza ingredients from stock
    await updateInventory(order.items);

    // Add compensation for sending bill by refunding
    compensations.unshift({
      message: errorMessage('reversing send bill'),
      fn: () => refundCustomer(bill),
    });

    // Try to send bill
    await sendBill(bill);

    const orderConfirmation = {
      orderNumber: bill.orderNumber,
      confirmationNumber: 'AB9923',
      status: 'SUCCESS',
      billingTimestamp: Date.now(),
      amount: bill.amount,
    };
    return orderConfirmation;
  } catch (err) {
    log.error(`Unable to bill customer: ${err}`);
    await compensate(compensations);
    throw err;
  }
}
