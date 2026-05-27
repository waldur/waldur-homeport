import { ArrowsOutCardinalIcon } from '@phosphor-icons/react';
import { Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const MoveOfferingDialog = lazyComponent(() =>
  import('./MoveOfferingDialog').then((module) => ({
    default: module.MoveOfferingDialog,
  })),
);

export const MoveOfferingAction = ({
  row,
  refetch,
}: {
  row: Offering;
  refetch;
}) => {
  const { openDialog } = useModal();

  const callback = () => {
    openDialog(MoveOfferingDialog, {
      resolve: { offering: row, refetch },
    });
  };

  const user = useUser();

  const isUserStaff = user?.is_staff;
  if (!isUserStaff) return null;

  return (
    <ActionItem
      title={translate('Move offering')}
      action={callback}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
      staff
    />
  );
};
