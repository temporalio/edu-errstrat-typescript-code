import { log, ActivityFailure } from '@temporalio/workflow';
// Part D: Import the `Compensation` interface from `shared.ts`

export function errorMessage(message: string, err?: any): string {
  let errMessage = err && err.message ? err.message : '';
  if (err && err instanceof ActivityFailure) {
    errMessage = `${err.cause?.message}`;
  }
  return `${message}: ${errMessage}`;
}

export async function compensate(compensations: Compensation[] = []): Promise<void> {
  if (compensations.length > 0) {
    log.info('failures encountered during pizza workflow - compensating');
    // TODO Part D: Surround the `try/catch` block
    // with a `foreach` statement that iterates over
    // the `compensations` array, using `comp` as the
    // name for each element
    // (thereby matching the name of the object
    // referenced in the `await` statement).
    try {
      log.error(comp.message);
      await comp.fn();
    } catch (err) {
      log.error(`failed to compensate: ${errorMessage('', err)}`, { err });
      // swallow errors
    }
  }
}
