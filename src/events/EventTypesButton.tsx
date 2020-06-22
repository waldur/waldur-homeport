import * as React from 'react';
import { useDispatch } from 'react-redux';

import { showEventTypes } from '@waldur/events/actions';
import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

export const EventTypesButton = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Event types')}
      action={() => dispatch(showEventTypes())}
      icon="fa fa-question-circle"
    />
  );
};
