import customerDetailsSaga from '@waldur/customer/details/store/effects';
import { effects as titleEffects } from '@waldur/navigation/title';
import projectDetailsSaga from '@waldur/project/details/store/effects';
import workspaceSaga from '@waldur/workspace/effects';

export default [
  customerDetailsSaga,
  projectDetailsSaga,
  titleEffects,
  workspaceSaga,
];
