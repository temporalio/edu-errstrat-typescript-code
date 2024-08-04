## Exercise #3: Rollback with the Saga Pattern

During this exercise, you will:

- Orchestrate Activities using a Saga pattern to implement compensating transactions
- Handle failures with rollback logic

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/rollback-with-saga/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Create a Test Error

In this part of the exercise, you will define a Test Error that you will use to test the rolling back of compensations with the Saga Pattern.

1. Edit the `activities.ts` file.
2. At the very top of the `sendBill` Activity, throw an Application Failure that just sends the message: `Test Error`. We will throw this error in the `SendBill` Activity to roll back compensations since that step. Set the error's `nonRetryable` key to `true`. This way, when we run into this intentional error, we can skip the retrying error to see the rollback of the saga pattern.
3. Save the file.

## Part B: Create your Compensation Activities

Before you begin, there is already an `updateInventory` Activity provided for you. This Activity reduces the stock from the pizza inventory once the pizza order comes through. This step is done before the `sendBill` Activity is called.

Imagine that there is an error in the `sendBill` Activity. We would then want to roll back on sending the bill by invoking a `refundCustomer` Activity. We would also want to roll back on the `updateInventory` Activity by invoking a `revertInventory` Activity, which would add the ingredients back into the pizza inventory.

In this part of the exercise, you will create your compensation Activities. When one of the Activities fails, the Workflow will "compensate" by calling Activities configured as reversals of successful calls to that point.

1. Edit the `activities.ts` file.
2. Uncomment the `revertInventory` Activity.
3. Uncomment the `refundCustomer` Activity.
4. Pass in `bill` with the type `Bill` (imported from `shared.ts`) into the `refundCustomer` Activity.
5. Edit the `workflows.ts` file.
6. Add your `refundCustomer` and `revertInventory` Activities in the `proxyActivities`.

## Part C: Create Your Compensation List

In this part of the exercise, you will create an array of compensation objects. Each compensation object will include an Activity that would cause the rolling back of the Activity that would fail.

We want the array of compensation objects to take on a shape like this: `[{message: 'unable to call Activity A successfully', fn: revertActivityA()}, {message: 'unable to call Activity B successfully', fn: revertActivityB()}]`.

1. Edit `shared.ts` file.
2. You will first create an interface called `Compensation`.
3. It will take in a key of `message` of type string.
4. It will also take in a key of `fn` with the value of `() => Promise<void>`.
5. Save your file.

## Part D: Create Your Compensation Function

In this part of the exercise, you will create a function which will loop through the array of compensation objects in a synchronous order. In the case of an error, we will invoke this function to roll back on any Activities we want to undo.

1. Edit the `compensationUtils.ts` file.
2. Import your `Compensation` interface from `shared.ts` that you defined in Part C.
3. Notice that we have already provided for you an `errorMessage` function which takes in the error message from a failing Activity and displays it in a more readable fashion.
4. Now, look at the next function: `compensate`. This function will take in a list of the `Compensation` objects that you defined in part C and defaults as an empty array. It will then iterate through a list of `Compensation` objects, log the error message provided in the `Compensation` object, and call the function provided in the `Compensation` object.
5. Surround the `try/catch` block with a `foreach` statement that iterates over the `compensations` array, using `comp` as the name for each element (thereby matching the name of the object referenced in the `await` statement).
6. Save the file. Note that in most production setup, failure to compensate would require human intervention, or at very least, filing the event to some external system.

## Part E: Fill in Your Compensation Array

In this part of the exercise, you will fill in the `compensations` array that you will call the `compensate` function on.

Before we call an Activity, we want to add the correlating compensation Activity into the `compensations` list. For example, before we call `sendBill`, we want to add `refundCustomer` into the list of compensations.

Then, if `sendBill` throws an error, we call the `compensate` function which rolls back on the `sendBill` Activity by calling `refundCustomer`.

1. Edit the `workflows.ts` file.
2. Import your `Compensation` interface from `shared.ts` that you defined in Part C. Notice that at the beginning of the `pizzaWorkflow`, we define a variable called `compensations`, which is a list of `Compensation` objects (and defaulted as an empty array).
3. Look at the first compensation (compensation for `updateInventory`) which is provided for you. Before we call `updateInventory`, we add its compensating counterpart - `revertInventory` into the array of `compensations`. We use the `unshift` method, which adds an item in the beginning of an array. This ensures that the compensations are executed in the reverse order of their addition, which is important for correctly reversing the steps of the Workflow.
4. Following the pattern in step 3, add a compensation for an error in the `sendBill` Activity. Add in a compensation object for `sendBill` by calling `refundCustomer` which takes in a `bill` argument.
5. At this point, as you go through the pizza Workflow, your `compensations` array should look like this: `[
  { message: 'reversing send bill: ', fn: refundCustomer },
  { message: 'reversing update inventory: ', fn: revertInventory }]`.

## Part F: Call the `compensate` Function

In this part of the exercise, you will call the `compensate` function that you defined in Part D.

1. Edit the `workflows.ts` file.
2. Import your `compensate` function and `errorMessage` function from the `compensationUtils` file you looked at in part D.
3. In the `try/catch` block of your calling of `sendBill` Activity, call `await compensate(compensations)`. Now if `sendBill` fails, first we roll back on `sendBill` by calling `refundCustomer`. Next, we will roll back on `updateInventory` by calling `revertInventory`.
4. Save the file.

## Part G: Test the Rollback of Your Activities

To run the Workflow:

1. In one terminal, start the Worker by running `npm run start`.
2. In another terminal, start the Workflow by running `npm run workflow`.
3. You should see the Workflow Execution failed. There is now a `WorkflowExecutionFailed` Event in the Web UI.
4. Over in the Web UI (or the terminal window where your Worker ran), you can see that after the `sendBill` Activity failed, we then called the Activities: `refundCustomer` and `revertInventory`.

### This is the end of the exercise.
