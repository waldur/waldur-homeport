import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const DeployPageActions = () => {
  return (
    <Dropdown id="deploy-actions" align="end">
      <Dropdown.Toggle variant="light" bsPrefix="btn-icon bg-body">
        <DotsThreeVerticalIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <ActionItem action={() => null} title={translate('Import config')} />
        <ActionItem action={() => null} title={translate('Edit as YAML')} />
        <ActionItem
          action={() => null}
          title={translate('Order with script over API')}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};
