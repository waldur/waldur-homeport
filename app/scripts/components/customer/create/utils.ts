import { SubmissionError } from 'redux-form';

import { translate } from '@waldur/i18n';

import * as constants from './constants';

export const validate = data => {
  if (!data[constants.FIELD_NAMES.role]) {
    throw new SubmissionError({
      _error: translate('Сhoose the role please'),
    });
  }
  return data;
};
