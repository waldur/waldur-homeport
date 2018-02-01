import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { withTranslation } from '@waldur/i18n';

import { UserFilterForm } from './UserFilterForm';

const enhance = compose(
  withTranslation,
  reduxForm({form: 'userFilter'}),
);

export const UserFilterContainer = enhance(UserFilterForm);
