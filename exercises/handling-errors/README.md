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

Application Failures are used to communicate application-specific failures in Workflows and Activities. In Workflows, if you throw an `ApplicationFailure`, the Workflow Execution will fail. In Activities, you can either throw an `ApplicationFailure` or another Error to fail the Activity Task. 

1. Edit the `activities.ts` file.
2. Import `ApplicationFailure` from `@temporalio/common`.
3. In the `sendBill` Activity, notice how we throw an error if there is a charge that is negative. If the charged amount is a negative amount, we throw an Application Failure. The Application Failure includes a message as well as a details array with a list of details pertaining to the failure. Since we want our custom error data to be serialized and transmitted over the network, we must set our custom data in the `details` field. 
4. Go to the `validateCreditCard` Activity. We want to throw an error if the entered credit card number does not have 16 digits. Replace the logged error with your own `ApplicationFailure`, following the pattern you saw in step 3.

## Part B: Throw the Activity Failures in Your Workflow

In this part of the exercise, you will throw your Activity Failures that will fail your Workflow Executions.

1. Edit the `workflows.ts` file.
2. Add `ApplicationFailure` and `ActivityFailure` in your imports from `@temporalio/workflow` at the top of your file.
3. Look at the call to the `validateCreditCard` Activity. We want to throw an `ApplicationFailure` if there is a problem with the credit card number. Fill in the `message` key that is supplied in the log message. Fill in the `details` array with `creditCardNumber`, which is passed into the `validateCreditCard` Activity.
4. Right now, if we have an Activity that has an invalid credit card number, the Activity will fail, but not the Workflow Execution. However, if we would like the failed Activity to fail the Workflow Execution, we need to make the Activity nonRetryable.
5. In `activities.ts`, add a `nonRetryable` key in the object passed into `ApplicationFailure`. Set this key to `true`. Save your file. Now if this Activity fails, the Workflow Execution will also fail.
6. Save your file.

## Part C: Fail the Workflow

In this part of the exercise, you will throw your error that will fail your Workflow Execution. Remember that in Workflows, if you throw an `ApplicationFailure`, the Workflow Execution will fail. 

1. Edit the `workflows.ts` file.
2. In your Workflow, in the part of the logic that determines if the distance is more than 25 kilometers, throw an `ApplicationFailure`.
3. Save your file.

## Part D: Run the Workflow

In this part of the exercise, you will run your Workflow and see both your Workflow and Activity fail.

In the `client.ts` file, an invalid credit card number has been provided which will throw an error in the `validCreditCard` Activity. An invalid address has also been provided which should fail your Workflow.

To run the Workflow:

1. In one terminal, start the Worker by running `npm run start`.
2. In another terminal, start the Workflow by running `npm run workflow`.
3. You should see in the Web UI an `ActivityTaskFailed` Event for the `validateCreditCard` Activity. You can see in the Event History the details of the failure including its payloads, its attributes etc.
4. You should see in the Web UI a `WorkflowExecutionFailed` Event with the message: "Customer lives too far away for delivery".

### This is the end of the exercise.
