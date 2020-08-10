import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ViewYAMLDialog } from './ViewYAMLDialog';

export const ViewYAMLButton = ({
  resource,
  disabled,
}: {
  resource: any;
  disabled?: boolean;
}) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('View YAML')}
      action={() =>
        dispatch(
          openModalDialog(ViewYAMLDialog, {
            resolve: { resource },
            size: 'lg',
          }),
        )
      }
      icon="fa fa-edit"
      disabled={disabled}
    />
  );
};
