import { Eye } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const TelemetryExampleDialog = lazyComponent(
  () => import('./TelemetryExampleDialog'),
  'TelemetryExampleDialog',
);

export const TelemetryExampleButton = () => {
  const dispatch = useDispatch();
  return (
    <Button
      onClick={() => dispatch(openModalDialog(TelemetryExampleDialog))}
      variant="link"
      className="text-btn btn-xs"
    >
      <span className="svg-icon svg-icon-2">
        <Eye />
      </span>
      {translate('Show example')}
    </Button>
  );
};
