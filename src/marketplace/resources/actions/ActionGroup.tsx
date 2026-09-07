import { useContext } from 'react';

import { ActionsDropdownItemText } from '@/table/ActionsDropdown';

import { ResourceActionMenuContext } from './ResourceActionMenuContext';

export const ActionGroup = ({ title, children }) => {
  const queryContext = useContext(ResourceActionMenuContext);
  return (
    <div className="action-group">
      {queryContext?.hideGroupName ? null : (
        <ActionsDropdownItemText className="text-muted fw-bolder fs-7">
          {title}
        </ActionsDropdownItemText>
      )}
      <div className="action-list" data-testid="action-list">
        {children}
      </div>
    </div>
  );
};
