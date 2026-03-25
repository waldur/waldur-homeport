import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
