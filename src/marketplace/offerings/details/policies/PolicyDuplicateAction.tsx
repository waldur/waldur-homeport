import { CopyIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { OfferingPolicyType } from './types';

const PolicyCreateDialog = lazyComponent(() =>
  import('./PolicyCreateDialog').then((module) => ({
    default: module.PolicyCreateDialog,
  })),
);

interface PolicyDuplicateActionProps {
  row;
  type: OfferingPolicyType;
  offering: Offering;
  refetch(): void;
}

export const PolicyDuplicateAction = ({
  row,
  type,
  offering,
  refetch,
}: PolicyDuplicateActionProps) => {
  const { openDialog } = useModal();

  const initialValues = useMemo(
    () =>
      type === 'cost'
        ? {
            scope: row.scope,
            limit_cost: row.limit_cost,
            actions: row.actions,
            period: row.period,
            organization_groups: row.organization_groups,
          }
        : {
            scope: row.scope,
            limits: row.limits,
            actions: row.actions,
            period: row.period,
            organization_groups: row.organization_groups,
          },
    [row, type],
  );

  const openDuplicateDialog = useCallback(() => {
    openDialog(PolicyCreateDialog, {
      size: 'lg',
      type,
      offering,
      refetch,
      initialValues,
    });
  }, [type, offering, refetch, initialValues, openDialog]);

  return (
    <ActionItem
      title={translate('Duplicate')}
      action={openDuplicateDialog}
      iconNode={<CopyIcon weight="bold" />}
    />
  );
};
