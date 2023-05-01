export function isPromiseLike(maybePromise: any): maybePromise is PromiseLike<any> {
  return maybePromise && typeof maybePromise.then === 'function';
}

