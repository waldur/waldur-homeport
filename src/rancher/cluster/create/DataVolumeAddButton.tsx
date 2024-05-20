import { PlusCircle } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface DataVolumeAddButtonProps {
  onClick(): void;
}

export const DataVolumeAddButton = (props: DataVolumeAddButtonProps) => (
  <Button onClick={props.onClick}>
    <span className="svg-icon svg-icon-2">
      <PlusCircle />
    </span>{' '}
    {translate('Add data volume')}
  </Button>
);
