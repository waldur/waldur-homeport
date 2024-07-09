import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const ViewYAMLDialog = lazyComponent(
  () => import('./ViewYAMLDialog'),
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
    <RowActionButton
      title={translate('View YAML')}
      action={() =>
        dispatch(
          openModalDialog(ViewYAMLDialog, {
            resolve: { resource },
            size: 'lg',
          }),
        )
      }
      iconNode={<PencilSimple />}
      disabled={disabled}
      size="sm"
    />
  );
};
