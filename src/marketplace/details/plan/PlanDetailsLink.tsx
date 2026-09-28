import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      variant="tertiary"
      onClick={() =>
        openDialog(PlanDetailsDialog, {
          resolve: { resourceId: resource },
          size: 'lg',
        })
      }
      label={translate('Show')}
      size="sm"
    />
  );
};
