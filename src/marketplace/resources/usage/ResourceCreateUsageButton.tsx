import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

import { UsageReportContext } from './types';

const ResourceCreateUsageDialog = lazyComponent(
  () => import('./ResourceCreateUsageDialog'),
  'ResourceCreateUsageDialog',
);

export const ResourceCreateUsageButton: FunctionComponent<
  UsageReportContext & { disabled: boolean }
> = (props) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(ResourceCreateUsageDialog, {
        resolve: props,
      }),
    );
  return (
    <RowActionButton
      title={translate('Report usage')}
      iconNode={<PlusCircle />}
      action={openDialog}
      disabled={props.disabled}
      size="sm"
    />
  );
};
