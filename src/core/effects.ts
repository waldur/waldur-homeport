import { call, cancel, fork, join, takeEvery } from 'redux-saga/effects';

// taken from https://github.com/redux-saga/redux-saga/pull/1744
export function takeLatestPerKey(
  patternOrChannel,
  worker,
  keySelector,
  ...args
) {
  return fork(function* () {
    const tasks = {};

    yield takeEvery(patternOrChannel, function* (action) {
      const key = yield call(keySelector, action);

      if (tasks[key]) {
        yield cancel(tasks[key]);
      }

      tasks[key] = yield fork(worker, ...args.concat(action));

      yield join(tasks[key]);

      if (tasks[key] && !tasks[key].isRunning()) {
        delete tasks[key];
      }
    });
  });
}
