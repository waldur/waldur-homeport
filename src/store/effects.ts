import customerDetailsSaga from '@waldur/customer/details/store/effects';
import { effects as titleEffects } from '@waldur/navigation/title';
import projectDetailsSaga from '@waldur/project/details/store/effects';

export default [customerDetailsSaga, projectDetailsSaga, titleEffects];
