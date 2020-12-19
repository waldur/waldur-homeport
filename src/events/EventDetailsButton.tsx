import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

import { showEventDetails } from './actions';

export const EventDetailsButton: FunctionComponent<{ row }> = ({ row }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Details')}
      action={() => dispatch(showEventDetails(row))}
      icon="fa fa-eye"
    />
  );
};
