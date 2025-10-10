import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

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
    <Button
      variant="link"
      className="btn-flush"
      onClick={() =>
        openDialog(PlanDetailsDialog, {
          resolve: { resourceId: resource },
          size: 'lg',
        })
      }
    >
      {translate('Show')}
    </Button>
  );
};
