import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ApplicationDetailsDialog } from './ApplicationDetailsDialog';

const applicationDetailsDialog = (application) =>
  openModalDialog(ApplicationDetailsDialog, {
    resolve: { application },
  });

export const ApplicationDetailsButton = (props) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(applicationDetailsDialog(props.application));
  return (
    <ActionButton
      title={translate('Details')}
      action={callback}
      icon="fa fa-eye"
    />
  );
};
