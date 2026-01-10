import { FunctionComponent } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

interface OwnProps {
  resource: string;
}

const PlanDetailsDialog = lazyComponent(() =>
  import('@waldur/marketplace/details/plan/PlanDetailsDialog').then(
    (module) => ({
      default: module.PlanDetailsDialog,
    }),
  ),
);

export const PlanDetailsLink: FunctionComponent<OwnProps> = ({ resource }) => {
  const { openDialog } = useModal();

  return (
    <ActionButton
      variant="link"
      className="btn-flush"
      action={() =>
        openDialog(PlanDetailsDialog, {
          resolve: { resourceId: resource },
          size: 'lg',
        })
      }
      title={translate('Show')}
    />
  );
};
