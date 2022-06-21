import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface DataVolumeAddButtonProps {
  onClick(): void;
}

export const DataVolumeAddButton = (props: DataVolumeAddButtonProps) => (
  <Button onClick={props.onClick}>
    <i className="fa fa-plus" /> {translate('Add data volume')}
  </Button>
);
