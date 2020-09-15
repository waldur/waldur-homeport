import { reducer as notificationsReducer } from 'reapop';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import { reducer as bookings } from '@waldur/booking/store/reducer';
import { reducer as downloadLink } from '@waldur/core/DownloadLink/reducers';
import { reducer as issues } from '@waldur/issues/reducers';
import { reducer as marketplace } from '@waldur/marketplace/store/reducers';
import { reducer as modal } from '@waldur/modal/reducer';
import { reducer as breadcrumbs } from '@waldur/navigation/breadcrumbs/store';
import { reducer as title } from '@waldur/navigation/title';
import { reducer as serviceUsage } from '@waldur/providers/support/reducers';
import { reducer as resource } from '@waldur/resource/reducers';
import { reducer as tables } from '@waldur/table/store';
import { reducer as workspace } from '@waldur/workspace/reducers';

import { reducer as config } from './config';
import { reducer as locale } from './locale';

export default combineReducers({
  form: formReducer,
  notifications: notificationsReducer(),
  config,
  modal,
  tables,
  issues,
  workspace,
  locale,
  downloadLink,
  resource,
  serviceUsage,
  marketplace,
  bookings,
  title,
  breadcrumbs,
});
