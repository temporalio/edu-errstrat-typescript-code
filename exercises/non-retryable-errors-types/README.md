## Exercise #2: Modifying Activity Options Using Non-Retryable Error Types

During this exercise, you will:

- Configure non-retryable error types for Activities
- Implement customized retry policies for Activities
- Develop Workflow logic for fallback strategies in the case of Activity failure
- Add Heartbeats and Heartbeat timeouts to help users monitor the health of Activities 

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/non-retryable-error-types/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Convert Non-Retryable Errors to Be Handled By a Retry Policy

In this part of the exercise, we will take the `ApplicationFailure` that you defined in the `validatedCreditCard` method in the first exercise (Handling Errors) to not retry an invalid credit card error. After consideration, you've determined that while you may want to immediately fail your Activity Execution on any failure, others who call your Activity may not.

1. Edit `activities.ts`.
2. In the first exercise, in the `validateCreditCard` Activity, we threw an `ApplicationFailure` if the credit card had an invalid number. We want to make this an error type that we don't retry on. In the object supplied into `ApplicationFailure`, add a `type` key and set it to a string: 'InvalidCreditCardErr'. Remove the `nonRetryable` key.
3. Save your file.
4. We have already supplied an invalid credit card number for you in your `client.ts`. Verify that your error is now being retried by attempting to execute the Workflow Execution.
    1. In one terminal, start the Worker by running `npm run start.watch`.
    2. In another terminal window, start the Workflow Execution by running `npm run workflow`.
    3. Go to the WebUI and view the status of the Workflow. It should be Running. In the terminal window that the Worker is running, you can see that it is currently retrying the exception, verifying that the exception is no longer non-retryable.
    4. Stop this Workflow in the WebUI, as it will never successfully complete with Ctrl-C.

## Part B: Configure Retry Policies to set Non-Retryable Error Types

Now that the error from the `validateCreditCard` Activity is no longer set to non-retryable, others who call your Activity may decide how to handle the failure. However, you have decided that you do not want the Activity to retry upon failure. In this part of the exercise, you will configure a Retry Policy to disallow this using non-retryable error types.

Recall that a Retry Policy has the following attributes:

- Initial Interval: Amount of time that must elapse before the first retry occurs
- Backoff Coefficient: How much the retry interval increases (default is 2.0)
- Maximum Interval: The maximum interval between retries
- Maximum Attempts: The maximum number of execution attempts that can be made in the presence of failures

You can also specify errors types that are not retryable in the Retry Policy. These are known as non-retryable error types.

1. Edit `workflows.ts`.
2. In the object supplied to `proxyActivities`, add a `retry` object with the following key value pairs: 
   - `initialInterval`: '1 second'
   - `backoffCoefficient`: 1.0
   - `maximumInterval`: '1 second'
   - `maximumAttempts`: 5
3. So that we don't retry the `InvalidCreditCardErr` Error type, add a `nonRetryableErrorTypes` key in the `retry` configuration and set it to an array with `InvalidCreditCardErr` in it. Now, if an `InvalidCreditCardErr` is thrown, it will not retry. Save your file.
4. Verify that your Error is once again failing the Workflow.
    i. In one terminal, start the Worker by running `npm run start.watch`.
    ii. In another terminal window, start the Workflow Execution by running `npm run workflow`.
    iii. Go to the WebUI and view the status of the Workflow. You should see an `ActivityTaskFailed` error in with the message invalid credit card number message, and you should see a `WorkflowExecutionFailed` error with the message "Invalid Credit Card Number".
    iv. Stop your Worker using Cmd - C

## Part C: Add Heartbeats

In this part of the exercise, we will add heartbeating to our `pollDeliveryDriver` Activity.

1. Edit `activities.ts`. We have added a `pollDeliveryDriver` Activity. This Activity polls an external service for delivery drivers. If that service returns a status code of 500s or 403, we don't want to retry polling this service. Within this Activity, within the `if` statement that checks the status code, throw a new `Application Failure` with a message that lets the user know that there is an invalid server error. Set this Application Failure's `nonRetryable` key to `true`.
2. Now, let's add heartbeating. Import `heartbeat` from `@temporalio/activity`.
3. In the `pollExternalDeliveryDriver` Activity, notice that we have a `startingPoint` variable. This variable is set to the resuming point that the heartbeat last left off of, or 1, if the heartbeating has not began.
4. Add your entire `try/catch` block into a `for loop`. When initiating the loop, it should initiate at `let progress = startingPoint` and the progress should increment by one after each iteration of the loop. The loop should iterate up to ten times, one by one. This loop will simulate multiple attempts to poll an external service (e.g., DoorDash, UberEats) to find an available delivery driver.
5. Call `heartbeat()` within the `for loop` so it invokes in each iteration of the loop. The `heartbeat` function should take in `progress`.
6. Add a break statement after 'log.info(`External delivery driver assigned from: ${content.service}`)', so that we don't keep polling if the response is successful.
7. Save your file. 

## Part D: Add a Heartbeat Timeout

In the previous part of the exercise, you added a Heartbeat to an Activity. However, you didn't set how long the Heartbeat should be inactive for before it is considered a failed Heartbeat.

1. Edit `workflows.ts`.
2. Below the `startToCloseTimeout`, add a `heartbeatTimeout` and set it to 30 seconds. This sets the maximum time between Activity Heartbeats. If an Activity times out (e.g., due to a missed Heartbeat), the next attempt can use this payload to continue from where it left off.
3. Save your file.

## Part E: Run the Workflow

Next, let's run the Workflow. Let's go back to change your credit card to a valid one.

1. In `client.ts`, change your `creditCardNumber` value on the `customer` object in the `createPizzaOrder` function to `1234567890123456`. Save the file.
2. In one terminal, start the service that will poll for external delivery drivers by running `npm run service`. The window should indicate that the "Server is running on port 9998".
3. In another terminal, run the Worker by running `npm run start.watch`.
4. In another terminal, start the Workflow by running `npm run workflow`.

Before your Workflow is completed, if you click on the Workflow ID in your Web UI, click 'Pending Activities'. In this section you should see Heartbeat Details and JSON representing the payload. The Heartbeat message is not visible in the Web UI for an Activity Execution that has closed.
    i. Remember, the simulation will finish at a random interval. You may need to run this a few times to see the results.

You have now seen how Heartbeats are implemented and appear when an Activity is running.

### This is the end of the exercise.
