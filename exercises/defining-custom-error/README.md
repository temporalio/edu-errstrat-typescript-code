## Exercise #1: Defining a Custom Error

During this exercise, you will:

- Define, throw, and handle errors in Temporal Workflows and Activities

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/defining-custom-error/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Defining Custom Errors for Activities

In this part of the exercise, you will throw an Application Failure that will fail your Activities.

Application Failures are used to communicate application-specific failures in Workflows and Activities. In Workflows, if you throw an `ApplicationFailure`, the Workflow Execution will fail. In Activities, you can either throw an ApplicationFailure or another Error to fail the Activity Task. 

1. Edit the `activities.ts` file.
2. Import `ApplicationFailure` from `@temporalio/common`.
3. In the `sendBill` Activity, notice how we throw an error on line 38. If the charged amount is a negative amount, we throw an Application Failure. The Application Failure includes a message as well as a details array with a list of details pertaining to the failure. Since we want our custom error data to be serialized and transmitted over the network, we must convert set our custom data in the `details` field. 
4. Go to line 74, where we will throw an `ApplicationFailure` in the `validateAddress` Activity. We want to throw an error if the postal code is not valid or if the address has special characters. Replace the logged error on line 78 with your own `ApplicationFailure`, following the pattern you saw on step 3. Feel free to customize your ApplicationFailure with additional parameters you can find here: `https://typescript.temporal.io/api/classes/common.ApplicationFailure`.
5. Go to line 92, where we will throw an `ApplicationFailure` in the `validateCreditCard` Activity. We want to throw an error if the entered credit card number does not have 16 digits. Replace the logged error on line 96 with your own `ApplicationFailure`, following the pattern you saw on step 3.
6. Save your file.

## Part B: Throw the Activity Failures in Your Workflow

In this part of the exercise, you will throw your Activity Failures that will fail your Activity Executions. 

1. Edit the `workflows.ts` file.
2. Add `ApplicationFailure` and `ActivityFailure` in your imports from `@temporalio/workflow` at the top of your file.
3. Look at the example on line 32. If there is an error thrown in your `validateAddress` Activity, then in the `catch` statement, we check if the error is an instance of `ActivityFailure` and if the cause of the error is an instance of the `ApplicationFailure`. If it is, we log the message of the error.
4. Follow the pattern and do the same on line 23, so we can log the error in the `catch` block of the `validateCreditCard` Activity.

## Part C: Fail the Workflow

In this part of the exercise, you will throw your Custom Error that will fail your Workflow Execution. Remember that in Workflows, if you throw an `ApplicationFailure`, the Workflow Execution will fail. 

1. Edit the `workflows.ts` file.
2. In your Workflow, in the part of the logic that determines if the distance is more than 25 kilometers (line 50), throw an `ApplicationFailure`.
3. Save your file.

## Part D: Run the Workflow

In this part of the exercise, you will run your Workflow and see both your Workflow and Activity fail.

In the `client.ts` file, an invalid credit card number has been provided which will throw an error in the `validCreditCard` Activity. An invalid address has also been provided which should fail your Workflow.

To run the Workflow:

1. In one terminal, start the Worker by running `npm run start`.
2. In another terminal, start the Workflow by running `npm run workflow`.
3. You should see in the Web UI an `ActivityTaskFailed` Event for the `validateCreditCard` Activity. You can see in the terminal window that your Worker ran in that the Activity had five more attempts (based off of your custom retry policies) before it failed, and continued with the Workflow.
4. You should see in the Web UI a `WorkflowExecutionFailed` Event with the message: "Customer lives too far away for delivery".

### This is the end of the exercise.
