## Exercise #1: Defining a Custom Error

During this exercise, you will:

- Define, throw, and handle Custom errors in Temporal Workflows and Activities
- Handle Activity failures in errors

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/defining-custom-error/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Defining Custom Errors for Activities

In this part of the exercise, you will define your custom errors that will fail your Activities.

1. Edit the `shared.ts` file.
2. Using the `InvalidChargeError` as a template, create two more errors that will be used to fail the Activity. These two errors will be called `InvalidAddressError` and `CreditCardNumberError`.
3. The `CreditCardNumberError` will take in a parameter of `creditCardNumber` of string type and return the message: `Invalid credit card number: ${creditCardNumber}: (must contain exactly 16 digits)`.
4. The `InvalidAddressError` will take in a parameter of `address` of the `Address` type (defined in `shared.ts`) and return the message `Invalid address: ${JSON.stringify(address)}: (postal code must be 5 digits and no special characters in address fields)`.

## Part B: Import the Custom Errors in Your Activities

1. Edit the `activities.ts` file.
2. Import `InvalidAddressError` and `CreditCardNumberError` from `shared.ts` at the top of your file.

## Part C: Throwing the Custom Errors in Your Activities

In this part of the exercise, you will throw your custom errors that will fail your Activities.

1. Edit the `activities.ts` file.
2. In the `validateAddress` Activity, replace line 75 with throwing a new `InvalidAddressError`. Pass in the address into the Error.
3. In the `validateCreditCard` Activity, replace line 91 with throwing a new `CreditCardNumberError`. Pass in `creditCardNumber`.
4. Save the file.

## Part D: Importing `ApplicationFailure`

1. Edit the `shared.ts` file.
2. Uncomment line 2 to import `ApplicationFailure`.

## Part E: Defining Custom Errors for Failing Workflows

In this part of the exercise, you will define your custom errors that will fail your Workflow.

1. Edit the `shared.ts` file.
2. Create an error called `OutOfServiceAreaError`. This error should extend `ApplicationFailure` that you just imported. It does not need to take in a parameter and it will return the message: `Customer lives too far away for delivery`.
3. Save the file.

## Part F: Throwing the Activity Failures in Your Workflow

In this part of the exercise, you will throw your Activity Failures that will fail your Activity Executions.

1. Edit the `workflows.ts` file.
2. Add `ApplicationFailure` and `ActivityFailure` in your imports from `@temporalio/workflow` at the top of your file.
3. Look at the example on line 22. If there is an error thrown in your `validateAddress`, then we throw an `ActivityFailure` which fails the Activity Execution. In the `catch` statement, we check if the error is an instance of `ActivityFailure` and if the cause of the error is an instance of the `ApplicationFailure`. If it is, we log the message of the error.
4. Follow the pattern and do the same on line 52, so we can log the error the `catch` block of running the `validateCreditCard` Activity.

## Part G: Failing the Workflow

In this part of the exercise, you will throw your Custom Error that will fail your Workflow Execution.

1. Edit the `workflows.ts` file.
2. Import `OutOfServiceAreaError` from `shared.ts` at the top of your file.
3. In your Workflow, in the part of the logic that determines if the distance is more than 25 kilometers (line 40), add a line where you throw the `OutofServiceAreaError`. 
4. Save your file.

## Part H: Run the Workflow with an Invalid Credit Card Number

First, let's fail the Activity by testing this with an invalid credit card number.

1. Edit `client.ts`.
2. Uncomment the invalid credit card number on line 35.
3. Uncomment the valid address on lines 52-58.
4. Save the file.

To run the Workflow:

1. In one terminal, start the Worker by running `npm run start`.
2. In another terminal, start the Workflow by running `npm run workflow`.
3. You should see in the Web UI an `ActivityTaskFailed` Event for the `validateCreditCard` Activity.

## Part I: Run the Workflow with an Invalid Address

Next, let's fail the Workflow by testing this with an invalid address but valid credit card number. 

1. Edit `client.ts`.
2. Add back the comment for the invalid credit card number (line 35).
3. Uncomment the valid edit card number on line 37.
4. Add back the comments for the valid address (lines 52-58).
5. Uncomment the valid address for lines 44-50.
6. Save the file.

To run the Workflow:

1. In one terminal, start the Worker by running `npm run start`.
2. In another terminal, start the Workflow by running `npm run workflow`.
3. You should see in the Web UI a `WorkflowExecutionFailed` Event.

### This is the end of the exercise.
