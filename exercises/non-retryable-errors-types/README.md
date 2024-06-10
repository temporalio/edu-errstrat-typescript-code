## Exercise #2: Modifying Activity Options Using Non-Retryable Error Types

During this exercise, you will:

- Configure non-retryable errors for Activities
- Implement customized retry policies for Activities
- Develop Workflow logic for fallback strategies in the case of Activity failure
- Add Heartbeats and Heartbeat timeouts to help users monitor the health of Activities 

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/non-retryable-error-types/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Add Non-Retryable Errors

In this part of the exercise, we will take the Application Failures we defined in the first exercise (Handling Errors) and remove the `nonRetryable` flag and add error types into a list of error types we don't want to retry instead.

1. Edit `activities.ts`.
2. In the first exercise, in the `validateCreditCard` Activity, we threw an `ApplicationFailure` if the credit card had an invalid error. We want to make this an error type that we don't retry on instead of just specifying this specific Error as non retriable. In the object supplied into `ApplicationFailure`, add a `type` key and set it to a string: 'InvalidCreditCardErr'. Remove the `nonRetryable` key.
2. In the `sendBill` Activity, we also threw an `ApplicationFailure` if the charge amount is negative. In the object supplied into `ApplicationFailure`, add a `type` key and set it to a string: 'InvalidChargeAmountErr'.

## Part B: Configure Retry Policies of an Error

In this part of the exercise, we will configure the retry policies of an error.

- Initial Interval: Amount of time that must elapse before the first retry occurs
- Backoff Coefficient: How much the retry interval increases (default is 2.0)
- Maximum Interval: The maximum interval between retries
- Maximum Attempts: The maximum number of execution attempts that can be made in the presence of failures

1. Edit `workflows.ts`.
2. We want to set the retry policy to retry once per second for five seconds for simplicity's sake. In the `retry` object of your `proxyActivities`, add in the values for `initialInterval`, `backoffCoefficient`, `maximumInterval`, `maximumAttempts` that would allow for this.
3. So that we don't retry any `InvalidChargeAmountErr` and `InvalidCreditCardErr` Error types, add a `nonRetryableErrorTypes` key in the `retry` configuration and set it to an array with those error types. Now, if those Activities throw these error types, they will not retry.

## Part C: Add Heartbeats

In this part of the exercise, we will add heartbeating to our `pollDeliveryDriver` Activity.

1. Edit `activities.ts`. We have added a `pollDeliveryDriver` Activity. This Activity polls an external service for delivery drivers. If that service returns a status code of 500s or 403, we don't want to retry polling this service. Within this Activity, within the `if` statement that checks the status code, throw a new `Application Failure` with a message that lets the user know that there is an invalid server error. Set this Application Failure's `nonRetryable` key to true.
2. Now, let's add heartbeating. Import `heartbeat` and `activityInfo` from `@temporalio/activity`.
3. In the `pollExternalDeliveryDriver` Activity, notice that we have a `startingPoint` variable. This variable is set to the resuming point that the heartbeat last left off of, or 1, if the heartbeating has not began.
4. Add your entire `try/catch` block into a `for loop`. When initiating the loop, it should initiate at `let progress = startingPoint` and the progress should increment by one after each iteration of the loop. The loop should iterate up to ten times, one by one. This loop will simulate multiple attempts to poll an external service (e.g., DoorDash, UberEats) to find an available delivery driver.
5. Call `heartbeat()` within the `for loop` so it invokes in each iteration of the loop. The `heartbeat` function should take in `progress`.
6. Add a break statement after 'log.info(`External delivery driver assigned from: ${content.service}`)', so that we don't keep polling if the response is successful.
7. Save your file. 

## Part D: Add a Heartbeat Timeout

In this part of the exercise, we will add a Heartbeat Timeout to your Activities. If a heartbeat timeout is not set, Temporal doesn't track the heartbeat signals
sent by the activity. 

1. Edit `workflows.ts`.
2. Below the `startToCloseTimeout`, add a `heartbeatTimeout` and set it to thirty seconds. This sets the maximum time between Activity Heartbeats. If an Activity times out (e.g., due to a missed Heartbeat), the next attempt can use this payload to continue from where it left off.
3. Save your file.

## Part E: Run the Workflow

Next, let's run the Workflow.

1. In one terminal, start the service that will poll for external delivery drivers by running `npm run service`.
2. In another terminal, run the Worker by running `npm run start`.
3. In another terminal, start the Workflow by running `npm run workflow`.

Before your Workflow is completed, if you click on the Workflow ID in your Web UI, you can see the Heartbeat details. Under "Pending Activities", you can see the attempts, state of the Heartbeat etc.

### This is the end of the exercise.
