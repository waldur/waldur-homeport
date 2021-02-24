import { FunctionComponent } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { useBoolean } from 'react-use';

import { translate } from '@waldur/i18n';
import { CancelAction } from '@waldur/marketplace/resources/CancelAction';
import { Resource } from '@waldur/marketplace/resources/types';

interface ResourceActionsProps {
  resource: Resource;
}

export const ResourceActions: FunctionComponent<ResourceActionsProps> = ({
  resource,
}) => {
  const [open, onToggle] = useBoolean(false);
  return (
    <DropdownButton
      title={translate('Actions')}
      id="resource-actions-dropdown-btn"
      className="dropdown-btn"
      onToggle={onToggle}
      open={open}
    >
      <CancelAction resource={resource} />
    </DropdownButton>
  );
};
