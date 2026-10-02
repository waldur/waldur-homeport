import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { canUpdateResourceOptions } from '@/marketplace/resources/options/permissions';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const MultiEditOptionsDialog = lazyComponent(() =>
  import('./MultiEditOptionsDialog').then((module) => ({
    default: module.MultiEditOptionsDialog,
  })),
);

export const MultiEditOptionsAction = ({
  rows,
  refetch,
  asButton,
}: {
  rows: Resource[];
  refetch;
  asButton?: boolean;
}) => {
  const { openDialog } = useModal();

  const user = useUser();
  const canShow = useMemo(() => {
    // Check if the offering of all resources is the same & check permission
    const offeringUuid = rows[0].offering_uuid;
    return rows.every(
      (resource) =>
        resource.offering_uuid === offeringUuid &&
        canUpdateResourceOptions(user, resource),
    );
  }, [rows, user]);

  const callback = () =>
    openDialog(MultiEditOptionsDialog, {
      resolve: {
        rows,
        refetch,
      },
    });

  return canShow ? (
    asButton ? (
      <BaseButton
        variant="tertiary"
        onClick={callback}
        iconNode={<PencilSimpleIcon weight="bold" />}
        label={translate('Edit all')}
        size="lg"
      />
    ) : (
      <EditAction
        title={translate('Edit resource options')}
        action={callback}
      />
    )
  ) : null;
};
