import { ArrowsLeftRightIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { CustomerCredit } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const TopUpCreditDialog = lazyComponent(() =>
  import('./TopUpCreditDialog').then((module) => ({
    default: module.TopUpCreditDialog,
  })),
);

const ReclassifyCreditDialog = lazyComponent(() =>
  import('./ReclassifyCreditDialog').then((module) => ({
    default: module.ReclassifyCreditDialog,
  })),
);

interface OwnProps {
  row: CustomerCredit;
  refetch;
}

export const TopUpCreditButton = ({ row, refetch }: OwnProps) => {
  const { openDialog } = useModal();
  return (
    <Menu.Item
      icon={<PlusCircleIcon weight="bold" />}
      onSelect={() =>
        openDialog(TopUpCreditDialog, { resolve: { credit: row, refetch } })
      }
    >
      {translate('Top up')}
    </Menu.Item>
  );
};

export const ReclassifyCreditButton = ({ row, refetch }: OwnProps) => {
  const { openDialog } = useModal();
  const hasGranted = Number(row.granted_balance) > 0;
  return (
    <Menu.Item
      icon={<ArrowsLeftRightIcon weight="bold" />}
      disabled={!hasGranted}
      tooltip={
        hasGranted
          ? undefined
          : translate('There is no granted credit to reclassify.')
      }
      onSelect={() =>
        openDialog(ReclassifyCreditDialog, {
          resolve: { credit: row, refetch },
        })
      }
    >
      {translate('Reclassify as paid credit')}
    </Menu.Item>
  );
};
