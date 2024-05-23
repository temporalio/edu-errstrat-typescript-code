## Exercise #2: Handling Non-Retryable Errors

During this exercise, you will:

- Configure non-retryable errors for Activities
- Implement customized retry policies for Activities
- Develop Workflow logic for fallback strategies in the case of Activity failure
- Add Heartbeats and Heartbeat timeouts to help users monitor the health of Activities 

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/non-retryable-errors/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Add Non-Retryable Errors

In this part of the exercise, we will take the Application Failures we defined in the first exercise (Defining a Custom Error) and configure them so that they do not retry upon failure.

1. Edit `activities.ts`.
2. In the `ApplicationFailure` that you create in the `sendBill`, `validateAddress` and `validateCreditCard` Activities, add a `nonRetryable` key and set it to `true` in the list of parameters that you add into the object. Now, when these errors are thrown from an Activity, the Activity will not be retried.
3. We also want to configure the `pollExternalDeliveryDriver` Activity. This Activity polls an external service. If that service returns a status code of 500s or 403, we don't want to retry polling this service. Within this Activity, within the `if` statement that checks the status code, throw a new `Application Failure` with a message that lets the user know that there is an invalid server error. Set this Application Failure's `nonRetryable` key to true.
4. Save your file.

## Part B: Configure Retry Policies of an Error

In this part of the exercise, we will configure the retry policies of an error.

- Initial Interval: Amount of time that must elapse before the first retry occurs
- Backoff Coefficient: How much the retry interval increases (default is 2.0)
- Maximum Interval: The maximum interval between retries
- Maximum Attempts: The maximum number of execution attempts that can be made in the presence of failures

1. In `activities.ts`, notice that we added a new Activity for you called `notifyInternalDeliveryDriver`. This Activitiy simulates that an internal driver is not available and forces a hard coded error. We will now configure this error.
2. Edit `workflows.ts`.
3. We want to set the retry policy to retry once per second for five seconds for simplicity's sake. In the `retry` object of your `proxyActivities`, add in the values for `initialInterval`, `backoffCoefficient`, `maximumInterval`, `maximumAttempts` that would allow for this.
4. Now notice line 81. In this `try/catch` block, you can see that we call `notifyInternalDeliveryDriver`. If after we retried this Activity once per second for five seconds and we still do not successfully execute this Activity, we will invoke `pollExternalDeliveryDriver`. This Activity will poll a microservice looking for external drivers (e.g., UberEats, Grubhub, DoorDash).

## Part C: Add Heartbeats

In this part of the exercise, we will add heartbeating to our `pollExternalDeliveryDriver` Activity.

1. Edit `activities.ts`.
2. Import `heartbeat` and `activityInfo` from `@temporalio/activity`.
3. In the `pollExternalDeliveryDriver` Activity, notice that we have a `startingPoint` variable. This variable is set to the resuming point that the heartbeat last left off of, or 1, if the heartbeating has not began.
4. Add your entire `try/catch` block into a `for loop`. When initiating the loop, it should initiate at `let progress = startingPoint`, this way, the progress will increment each iteration of the loop. The loop should iterate up to ten times, one by one. This loop will simulate multiple attempts to poll an external service (e.g., DoorDash, UberEats) to find an available delivery driver.
5. Call `heartbeat()` within the `for loop` so it invokes in each iteration of the loop. The `heartbeat` function should take in `progress`.
6. Add a break statement after 'log.info(`External delivery driver assigned from: ${content.service}`)', so that we don't keep polling if the response is successful.
7. Save your file.

## Part D: Add a Heartbeat Timeout

In this part of the exercise, we will add a Heartbeat Timeout to your Activities.

1. Edit `workflows.ts`.
2. Below the `startToCloseTimeout`, add a `heartbeatTimeout` and set it to ten seconds. This sets the maximum time between Activity Heartbeats. If an Activity times out (e.g., due to a missed Heartbeat), the next attempt can use this payload to continue from where it left off.
3. Save your file.

## Part E: Run the Workflow

Next, let's run the Workflow.

1. In one terminal, start the service that will poll for external delivery drivers by running `npm run service`.
2. In another terminal, run the Worker by running `npm run start`.
3. In another terminal, start the Workflow by running `npm run workflow`.

In your Web UI, you will see that there is an `ActivityTaskFailed` Event for `notifyInternalDeliveryDriver`. In the terminal where your Worker is running, you can see that there were five attempts to run this Activity before moving onto the `pollExternalDeliveryDriver` Activity.

### This is the end of the exercise.
