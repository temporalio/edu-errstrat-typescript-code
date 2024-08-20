import { Connection, Client } from '@temporalio/client';
import { pizzaWorkflow } from './workflows';
import { Pizza, PizzaOrder, TASK_QUEUE_NAME } from './shared';

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({
    connection,
  });

  const order = createPizzaOrder();

  const handle = await client.workflow.start(pizzaWorkflow, {
    args: [order],
    taskQueue: TASK_QUEUE_NAME,
    workflowId: `pizza-workflow-order-${order.orderNumber}`,
  });

  console.log(`Started workflow ${handle.workflowId}`);

  // optional: wait for client result
  await handle.result();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

function createPizzaOrder(): PizzaOrder {
  const customer = {
    customerID: 12983,
    creditCardNumber: '1234567890abcdef',
    name: 'María García',
    email: 'maria1985@example.com',
    phone: '415-555-7418',
  };

  const address = {
    line1: '701 Mission Street',
    line2: 'Apartment 9C',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
  };

  const p1 = {
    type: 'large',
    ingredients: ['mushrooms', 'cheese', 'tomatoes', 'onions'],
    price: 1500,
  };

  const p2 = {
    type: 'small',
    ingredients: ['cheese', 'tomatoes', 'pepperoni'],
    price: 1200,
  };

  const p3 = {
    type: 'medium',
    ingredients: ['cheese', 'tomatoes', 'sausage'],
    price: 1300,
  };

  const items: Pizza[] = [p1, p2, p3];

  const order = {
    orderNumber: 'Z1238',
    customer,
    items,
    address,
    isDelivery: true,
  };

  return order;
}
