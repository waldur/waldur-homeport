import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ViewYAMLDialog = lazyComponent(
  () => import(/* webpackChunkName: "ViewYAMLDialog" */ './ViewYAMLDialog'),
  'ViewYAMLDialog',
);

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
