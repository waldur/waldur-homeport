import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { UsageReportContext } from './types';

const ResourceCreateUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateUsageDialog" */ './ResourceCreateUsageDialog'
    ),
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
    <ActionButton
      title={translate('Report usage')}
      icon="fa fa-plus"
      action={openDialog}
      disabled={props.disabled}
    />
  );
};
