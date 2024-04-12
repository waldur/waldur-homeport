import { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';

import { ResourceActionMenuContext } from './ResourceActionMenuContext';

export const ActionGroup = ({ title, children }) => {
  const queryContext = useContext(ResourceActionMenuContext);
  return (
    <div className="action-group">
      {queryContext?.hideGroupName ? null : (
        <>
          <Dropdown.ItemText className="text-gray-600 fw-bolder fs-8 text-uppercase mt-3">
            {title}
          </Dropdown.ItemText>
          <Dropdown.Divider />
        </>
      )}
      <div className="action-list">{children}</div>
    </div>
  );
};
