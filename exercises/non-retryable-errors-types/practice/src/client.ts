import { Connection, Client, WorkflowIdReusePolicy  } from '@temporalio/client';
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
    workflowIdReusePolicy: WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING
  });

  // optional: wait for client result
  console.log(await handle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

function createPizzaOrder(): PizzaOrder {
  const customer = {
    customerID: 12983,
    //TODO Part E: Change your credit card number to `1234567890123456`. Save your file.
    creditCardNumber: '1234567890123456123',
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
    description: 'Large, with mushrooms and onions',
    price: 1500,
  };

  const p2 = {
    description: 'Small, with pepperoni',
    price: 1200,
  };

  const p3 = {
    description: 'Medium, with extra cheese',
    price: 1300,
  };

  const items: Pizza[] = [p1, p2, p3];

  const order = {
    orderNumber: 'Z1238',
    customer,
    items,
    address,
    isDelivery: true,
    pollExternalDriver: false,
  };

  return order;
}
