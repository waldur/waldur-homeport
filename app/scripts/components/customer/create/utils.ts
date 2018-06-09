import { SubmissionError } from 'redux-form';

import { translate } from '@waldur/i18n';

import * as constants from './constants';

export const validate = data => {
  return new Promise(resolve => {
    if (!data[constants.FIELD_NAMES.role]) {
      throw new SubmissionError({
        _error: translate('Сhoose the role please'),
      });
    }

    resolve(data);
  });
};
