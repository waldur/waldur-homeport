import { Dropdown } from 'react-bootstrap';

import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

import { EditAction } from '../EditAction';
import { RequestLimitsChangeAction } from '../RequestLimitsChangeAction';

const ACTIONS = [EditAction, RequestLimitsChangeAction, UnlinkActionItem];

export const ResourceActions = ({ resource }) => (
  <Dropdown>
    <Dropdown.Toggle
      variant="link"
      bsPrefix="btn-icon btn-bg-light btn-sm btn-active-color-primary"
    >
      <i className="fa fa-ellipsis-h"></i>
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {ACTIONS.map((ActionComponent, index) => (
        <ActionComponent key={index} resource={resource} />
      ))}
    </Dropdown.Menu>
  </Dropdown>
);
