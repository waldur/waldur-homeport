import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

interface OwnProps {
  resource: string;
}

const PlanDetailsDialog = lazyComponent(() =>
  import('@/marketplace/details/plan/PlanDetailsDialog').then((module) => ({
    default: module.PlanDetailsDialog,
  })),
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
