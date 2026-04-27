import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();
  return (
    <ActionButton
      variant="tertiary"
      className={className}
      disabled={!offering}
      disabledReason={translate('Offering information is not available')}
      action={() =>
        dispatch(
          openModalDialog(DetailsOverviewDialog, {
            offering,
            customer,
            project,
            size: 'lg',
          }),
        )
      }
      iconNode={<EyeIcon weight="bold" />}
      title={translate('More details')}
    />
  );
};
