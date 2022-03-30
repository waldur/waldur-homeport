import { Button } from 'react-bootstrap';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface DataVolumeAddButtonProps extends TranslateProps {
  onClick(): void;
}

export const DataVolumeAddButton = withTranslation(
  (props: DataVolumeAddButtonProps) => (
    <Button onClick={props.onClick}>
      <i className="fa fa-plus" /> {props.translate('Add data volume')}
    </Button>
  ),
);
