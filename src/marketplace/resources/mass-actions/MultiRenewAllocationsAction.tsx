import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const RenewAllocationDialog = lazyComponent(() =>
  import('../renew-allocation/RenewAllocationDialog').then((module) => ({
    default: module.RenewAllocationDialog,
  })),
);

export const MultiRenewAllocationsAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch;
}) => {
  const dispatch = useDispatch();

  const validResources = useMemo(
    () => rows.filter((resource) => ['OK'].includes(resource.state)),
    [rows],
  );

  const callback = () =>
    dispatch(
      openModalDialog(RenewAllocationDialog, {
        resolve: {
          resources: validResources,
          refetch,
        },
        size: 'xl',
        fullscreen: 'lg-down',
      }),
    );

  if (!validResources.length) return null;

  return (
    <ActionItem
      title={translate('Renew allocations')}
      action={callback}
      iconNode={<ArrowClockwiseIcon weight="bold" />}
    />
  );
};
