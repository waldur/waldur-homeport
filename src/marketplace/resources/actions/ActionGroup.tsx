import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';

import { Menu } from 'waldur-ui';

import { useActionListFilter } from './ActionList';

interface ActionGroupTabsContextValue {
  /** The group the "Show all" dialog is narrowed to; none means every group. */
  activeGroup?: string;
  /** Called by a group that has at least one action, to get a tab. */
  registerGroup(title: string): void;
}

/**
 * Provided by the "Show all" dialog (ActionDialogBody.tsx), which draws a tab
 * per group. The groups are not known up front: each action list is its own
 * component tree, some of it lazy-loaded, so the groups announce themselves.
 */
export const ActionGroupTabsContext =
  createContext<ActionGroupTabsContextValue>(null);

/**
 * A captioned group of actions: role="group", named by its caption, so a
 * screen reader announces which group an action belongs to. The caption is
 * left out where the list hides group names (the quick actions), and where
 * the dialog is narrowed to this group, since the selected tab already
 * names it.
 *
 * The `action-group` / `action-list` classes are hooks for the rule that
 * hides a group whose actions all filtered out (custom/action-group.scss).
 */
export const ActionGroup = ({ title, children }) => {
  const { hideGroupName } = useActionListFilter();
  const tabs = useContext(ActionGroupTabsContext);
  const labelId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  // Only a group with an action in it gets a tab: every action may have
  // rendered nothing for this user or resource, and a tab onto an empty
  // group is a dead end. Many actions render only once their own query has
  // loaded (the offering, a permission), which re-renders them but not this
  // group, so watch the list rather than check it once.
  const registerGroup = tabs?.registerGroup;
  const isNarrowedAway = Boolean(
    tabs?.activeGroup && tabs.activeGroup !== title,
  );
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!registerGroup || !list) return;
    const check = () => {
      if (list.childElementCount) {
        registerGroup(title);
      }
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(list, { childList: true });
    return () => observer.disconnect();
  }, [registerGroup, title, isNarrowedAway]);

  if (isNarrowedAway) {
    return null;
  }

  const showLabel = !hideGroupName && !tabs?.activeGroup;

  return (
    <Menu.Group
      className="action-group"
      aria-labelledby={showLabel ? labelId : undefined}
    >
      {showLabel ? (
        <Menu.Label
          id={labelId}
          className="action-group-label py-[10px] text-quaternary font-semibold text-xs"
        >
          {title}
        </Menu.Label>
      ) : null}
      <div className="action-list" data-testid="action-list" ref={listRef}>
        {children}
      </div>
    </Menu.Group>
  );
};
