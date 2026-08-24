import { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';

import { ResourceActionMenuContext } from './ResourceActionMenuContext';

export const ActionGroup = ({ title, children }) => {
  const queryContext = useContext(ResourceActionMenuContext);
  return (
    <div className="action-group">
      {queryContext?.hideGroupName ? null : (
        <Dropdown.ItemText className="text-muted fw-bolder fs-7">
          {title}
        </Dropdown.ItemText>
      )}
      <div className="action-list" data-testid="action-list">
        {children}
      </div>
    </div>
  );
};
