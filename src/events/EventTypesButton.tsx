import { Question } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { showEventTypes } from '@waldur/events/actions';
import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';
import { TableDropdownItem } from '@waldur/table/types';

export const EventTypesButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Event types')}
      action={() => dispatch(showEventTypes())}
      iconNode={<Question weight="bold" />}
      visibility={{ minWidth: GRID_BREAKPOINTS.sm }}
    />
  );
};

export const EventTypesDropdownItem = (): TableDropdownItem => {
  const dispatch = useDispatch();
  return {
    label: translate('Event types'),
    action: () => dispatch(showEventTypes()),
    iconNode: <Question />,
    isMobileAction: true,
  };
};
