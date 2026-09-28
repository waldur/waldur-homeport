import { EyeIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      variant="tertiary"
      className={className}
      disabled={!offering}
      disabledReason={translate('Offering information is not available')}
      onClick={() =>
        openDialog(DetailsOverviewDialog, {
          offering,
          customer,
          project,
          size: 'lg',
        })
      }
      iconNode={<EyeIcon weight="bold" />}
      label={translate('More details')}
      size="lg"
    />
  );
};
