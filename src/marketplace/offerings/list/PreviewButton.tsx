import { Eye } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

export const PreviewButton = ({ offering }) => {
  const dispatch = useDispatch();
  return (
    <Button
      variant="secondary"
      onClick={() =>
        dispatch(
          openModalDialog(PreviewOfferingDialog, {
            resolve: { offering },
            size: 'lg',
          }),
        )
      }
      size="sm"
    >
      <span className="svg-icon svg-icon-4">
        <Eye />
      </span>{' '}
      {translate('Preview order form')}
    </Button>
  );
};
