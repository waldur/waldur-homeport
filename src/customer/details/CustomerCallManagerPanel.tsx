import { FunctionComponent, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';

export const CustomerCallManagerPanel: FunctionComponent = () => {
  const [enable, setEnable] = useState(false);
  const dispatch = useDispatch();

  const toggleCallManager = async (value: boolean) => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        value
          ? translate('Are you sure you want to enable call manger?')
          : translate('Are you sure you want to disable call manger?'),
      );
    } catch {
      return;
    }
    setEnable(value);
  };

  return (
    <Card className="mt-5">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Call manager')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <AwesomeCheckbox
          label={translate('Enable call manager')}
          value={enable}
          onChange={toggleCallManager}
        />
      </Card.Body>
    </Card>
  );
};
