## Exercise #1: Handling Errors

During this exercise, you will:

- Throw and handle exceptions in Temporal Workflows and Activities
- Use non-retryable errors to fail an Activity
- Locate the details of a failure in Temporal Workflows and Activities in the Event History

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/handling-errors/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Defining Errors for Activities

In this part of the exercise, you will throw an Application Failure that will fail your Activities.

Application Failures are used to communicate application-specific failures in Workflows and Activities. In Activities, if you throw an `ApplicationFailure`, the Activity will fail. However, unless this Activity is specified as non-retryable, it will retry according to the Retry Policy. To have an Activity fail when an `ApplicationFailure` is thrown, set it as non-retryable. Any other error that is thrown in TypeScript is automatically converted to an `ActivityFailure` upon being thrown.

1. Edit the `activities.ts` file.
2. Import `ApplicationFailure` from `@temporalio/common`.
3. In the `sendBill` Activity, we want to throw a non-retryable `ApplicationFailure` if the charge is negative. It is important to use a non-retryable failure here, as you want to fail the Activity if the amount was calculated to be negative. The Application Failure includes a message as well as a details array with a list of details pertaining to the failure. Since we want our custom error data to be serialized and transmitted over the network, we must set our custom data in the `details` field. Add a `nonRetryable` key and set it to `true`.
4. Go to the `validateCreditCard` Activity. In the `!isValid` if statement, throw throw an `ApplicationFailure` if the entered credit card number does not have 16 digits. In the `detailsField`, add your credit card number. Set the `nonRetryable` key to `true`.You can follow the pattern you saw in step 3.

## Part B: Throw the Activity Failures in Your Workflow

In this part of the exercise, you will catch the `ApplicationFailure` that was thrown from the `validateCreditCard` Activity and handle it.

1. Edit the `workflows.ts` file.
2. Add `ApplicationFailure` in your imports from `@temporalio/workflow` at the top of your file.
3. Look at the call to the `validateCreditCard` Activity. 
    i. If a non-retryable `ApplicationFailure` is thrown, the Workflow Execution will fail. However, it is possible to catch this failure and either handle it, or continue to propagate it up.
    ii. We wrapped the call to the `validateCreditCard` Activity in a `try/catch` block. Since the `ApplicationFailure` in the Activity is designated as non-retryable, by the time it reaches the Workflow it is converted to an `ActvityFailure`. 
    iii. Within the `catch` block, add a logging statement stating that the Activity has failed.
    iv. After the logging statement, throw another `ApplicationFailure`, passing in the message 'Invalid credit card number error'. This will cause the Workflow to fail, as you were unable to bill the customer.
4. Save your file.

## Part C: Run the Workflow

In this part of the exercise, you will run your Workflow and see both your Workflow and Activity fail.

First, run the Workflow successfully:

1. In one terminal, start the Worker by running `npm run start.watch`.
2. In another terminal, start the Workflow by running `npm run workflow`.
3. In the Web UI, verify that the Workflow Execution ran successfully to completion.

Next, you'll modify the credit card number to cause the Workflow Execution to fail:

1. In the `client.ts` file, append '123' to the `creditCardNumber` value on the `customer` object in the `createPizzaOrder` function to make it throw an error in the `validateCreditCard` Activity. Save the file.
2. Rerun the Workflow execution by rerunning `npm run workflow`.
3. You should see in the Web UI an `ActivityTaskFailed` Event for the `validateCreditCard` Activity. You can see in the Event History the details of the failure including its payloads, its attributes etc.
4. You should see in the Web UI a `WorkflowExecutionFailed` Event with the message: " "Invalid credit card number error".

### This is the end of the exercise.
