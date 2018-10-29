// See also: https://github.com/facebook/react/issues/5465
export function makeCancelable(promise) {
  let active = true;
  return {
    cancel() {
      active = false;
    },
    promise: promise.then(
      // tslint:disable:no-empty
      value => active ? value : new Promise(() => {}),
      reason => active ? reason : new Promise(() => {}),
    ),
  };
}
