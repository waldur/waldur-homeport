import { useId } from 'react';

import { Menu } from 'waldur-ui';

import { useActionListFilter } from './ActionList';

/**
 * A captioned group of actions: role="group", named by its caption, so a
 * screen reader announces which group an action belongs to. The caption is
 * left out where the list hides group names (the quick actions).
 *
 * The `action-group` / `action-list` classes are hooks for the rule that
 * hides a group whose actions all filtered out (custom/action-group.scss).
 */
export const ActionGroup = ({ title, children }) => {
  const { hideGroupName } = useActionListFilter();
  const labelId = useId();
  return (
    <Menu.Group
      className="action-group"
      aria-labelledby={hideGroupName ? undefined : labelId}
    >
      {hideGroupName ? null : (
        <Menu.Label
          id={labelId}
          className="action-group-label py-[10px] text-muted fw-bolder fs-7"
        >
          {title}
        </Menu.Label>
      )}
      <div className="action-list" data-testid="action-list">
        {children}
      </div>
    </Menu.Group>
  );
};
