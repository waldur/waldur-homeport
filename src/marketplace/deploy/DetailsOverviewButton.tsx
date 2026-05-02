import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const DetailsOverviewDialog = lazyComponent(() =>
  import('./DetailsOverviewDialog').then((module) => ({
    default: module.DetailsOverviewDialog,
  })),
);

interface OwnProps {
  offering;
  customer?;
  project?;
  className?;
}

export const DetailsOverviewButton = ({
  offering,
  customer,
  project,
  className = undefined,
}: OwnProps) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      variant="tertiary"
      className={className}
      disabled={!offering}
      disabledReason={translate('Offering information is not available')}
      action={() =>
        openDialog(DetailsOverviewDialog, {
          offering,
          customer,
          project,
          size: 'lg',
        })
      }
      iconNode={<EyeIcon weight="bold" />}
      title={translate('More details')}
    />
  );
};
