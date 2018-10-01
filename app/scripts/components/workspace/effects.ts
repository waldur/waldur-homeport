import { takeEvery } from 'redux-saga/effects';

import { SET_CURRENT_PROJECT } from '@waldur/workspace/constants';
import { storeProject } from '@waldur/workspace/utils';

export default function*() {
  yield takeEvery(SET_CURRENT_PROJECT, (action: any) => {
    const {project} = action.payload;
    if (project) {
      storeProject(action.payload.project);
    }
  });
}
