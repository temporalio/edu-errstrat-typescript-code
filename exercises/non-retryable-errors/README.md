## Exercise #2: Handling Non-Retryable Errors

During this exercise, you will:

- Configure non-retryable errors for Activities
- Implement customized retry policies for Activities
- Develop Workflow logic for fallback strategies in the case of Activity failure

Make your changes to the code in the `practice` subdirectory (look for `TODO` comments that will guide you to where you should make changes to the code). If you need a hint or want to verify your changes, look at the complete version in the `solution` subdirectory.

## Setup

You'll need two terminal windows for this exercise.

1. In all terminals, change to the `exercises/non-retryable-errors/practice` directory.
2. In one terminal, run `npm install` to install dependencies.

## Part A: Add Non-Retryable Errors

In this part of the exercise, we will take the Custom Errors we defined in the first exercise (Defining a Custom Error) and add them into our list of Non-Retryable Errors.

1. Edit `workflows.ts`.
2. In the `retry` object of your `proxyActivities`, add in a `nonRetryableErrorTypes` key. The value of this key should be an array.
3. Add in the custom errors you don't want to retry which are `CreditCardNumberError`, `InvalidAddressError`, and `InvalidChargeError`. Now, when these errors are thrown from an Activity, the Activity will not be retried.

## Part B: Configure Retry Policies of an Error

In this part of the exercise, we will configure the retry policies of an error.

- Initial Interval: Amount of time that must elapse before the first retry occurs
- Backoff Coefficient: How much the retry interval increases (default is 2.0)
- Maximum Interval: The maximum interval between retries
- Maximum Attempts: The maximum number of execution attempts that can be made in the presence of failures

1. In `activities.ts`, notice that we added a new Activity for you called `notifyInternalDeliveryDriver`. This Activitiy simulates that an internal driver is not available. This Activity has a hard coded error thrown: `FetchingInternalDriverError`. We will now configure this error.
2. Edit `workflows.ts`.
3. We want to set the retry policy to retry once per second for five seconds for simplicity's sake. In the `retry` object of your `proxyActivities`, add in the values for `initialInterval`, `backoffCoefficient`, `maximumInterval`, `maximumAttempts` that would allow for this.
4. Now notice line 92. In this `try/catch` block, you can see that we call `notifyInternalDeliveryDriver`. If after we retried this Activity once per second for five seconds and we still do not successfully execute this Activity, we will invoke `pollExternalDeliveryDriver`. This Activity will poll a microservice looking for external drivers (e.g., UberEats, Grubhub, DoorDash).
5. Save your file.

## Part C: Run the Workflow

Next, let's run the Workflow.

1. In one terminal, start the service that will poll for external delivery drivers by running `npm run service`.
2. In another terminal, run the Worker by running `npm run start`.
3. In another terminal, start the Workflow by running `npm run workflow`.

In your Web UI, you will see that there is an `ActivityTaskFailed` Event for `notifyInternalDeliveryDriver`. In the terminal where your Worker is running, you can see that there were five attempts to run this Activity before moving onto the `pollExternalDeliveryDriver` Activity.

### This is the end of the exercise.
