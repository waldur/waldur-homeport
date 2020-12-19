import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ImportYAMLDialog = lazyComponent(
  () => import(/* webpackChunkName: "ImportYAMLDialog" */ './ImportYAMLDialog'),
  'ImportYAMLDialog',
);

export const ImportYAMLButton: FunctionComponent<{ cluster_id }> = ({
  cluster_id,
}) => {
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
