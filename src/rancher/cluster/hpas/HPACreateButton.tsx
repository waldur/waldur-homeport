import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const HPACreateDialog = lazyComponent(
  () => import(/* webpackChunkName: "HPACreateDialog" */ './HPACreateDialog'),
  'HPACreateDialog',
);

const createHPADialog = (cluster) =>
  openModalDialog(HPACreateDialog, { resolve: { cluster } });

export const HPACreateButton: FunctionComponent<{ cluster }> = ({
  cluster,
}) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(createHPADialog(cluster));
  return (
    <ActionButton
      title={translate('Create')}
      action={callback}
      icon="fa fa-plus"
    />
  );
};
