export default function delay(ms, val = true) {
  let timeoutId;
  const promise = new Promise(resolve => {
    timeoutId = setTimeout(() => resolve(val), ms);
  });

  promise.cancel = () => clearTimeout(timeoutId);

  return promise;
}
