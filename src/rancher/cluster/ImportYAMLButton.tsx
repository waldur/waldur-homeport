import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ImportYAMLDialog } from './ImportYAMLDialog';

export const ImportYAMLButton = ({ cluster_id }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Import YAML')}
      action={() =>
        dispatch(
          openModalDialog(ImportYAMLDialog, {
            resolve: { cluster_id },
            size: 'lg',
          }),
        )
      }
      icon="fa fa-plus"
    />
  );
};
