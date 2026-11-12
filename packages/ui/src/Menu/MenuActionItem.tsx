import { QuestionIcon } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { forwardRef, ReactNode, useId } from 'react';

import { Tooltip } from '../Tooltip';

import { MenuItem } from './MenuItem';

/** The colours an action's icon can take (default gray). */
export type MenuActionIconColor =
  'gray-400' | 'danger' | 'success' | 'warning' | 'info';

// What legacy svg-icon-<colour> classes drew, in both themes (measured
// in the app): the icon's paths take the element's colour (fill=currentColor).
// The semantic roles switch with the theme; purple is a categorical hue with
// no role, so it keeps its own dark step.
const ICON_COLOR_CLASSNAMES: Record<MenuActionIconColor, string> = {
  'gray-400': 'text-quinary',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

export interface MenuActionItemProps {
  label: string;
  action: () => void;
  iconNode?: ReactNode;
  iconColor?: MenuActionIconColor;
  disabled?: boolean;
  /** Why the action is disabled, or what it does: a question mark beside
   * the row, with this as its tooltip. */
  tooltip?: string;
  /** Shown after the tooltip's icon: a staff-only marker. */
  marker?: ReactNode;
  /** What `marker` says, for a screen reader. */
  markerDescription?: string;
  className?: string;
  /** The row a combobox around the menu has highlighted. */
  highlighted?: boolean;
  /** Put on the row before everything else: a combobox's item props. */
  itemProps?: Record<string, any>;
}

/**
 * An action as a menu row: an icon in its colour, the label, and beside the
 * row the reason it is disabled. Rows of the table's action menus and of a
 * resource's actions are this; the app's `ActionItem` adds its own filtering
 * and staff marker on top.
 */
export const MenuActionItem = forwardRef<HTMLDivElement, MenuActionItemProps>(
  (props, ref) => {
    const descriptionId = useId();

    // The reason an action is disabled and the marker are shown beside the
    // row, as icons with tooltips (a disabled row takes no pointer events, so
    // a tooltip on it would never open). A screen reader gets the same
    // through aria-describedby.
    const description = [props.tooltip, props.markerDescription]
      .filter(Boolean)
      .join('. ');

    const trailing =
      props.tooltip || props.marker ? (
        <span className="inline-flex items-center shrink-0 pointer-events-auto">
          {props.tooltip && (
            <Tooltip label={props.tooltip}>
              <QuestionIcon
                size={20}
                weight="bold"
                aria-hidden="true"
                className={clsx(
                  'ms-1 me-2.5 text-[var(--menu-item-muted-text)]',
                  props.disabled && 'opacity-50',
                )}
              />
            </Tooltip>
          )}
          {props.marker}
        </span>
      ) : undefined;

    return (
      <>
        <MenuItem
          {...props.itemProps}
          ref={ref}
          icon={
            props.iconNode ? (
              <span
                className={clsx(
                  'leading-none [&>svg]:size-[20px]',
                  // Disabled, every icon takes the same gray, a danger one too.
                  ICON_COLOR_CLASSNAMES[
                    props.disabled
                      ? 'gray-400'
                      : (props.iconColor ?? 'gray-400')
                  ],
                  // This span sets its own colour, so the row's disabled
                  // colour never reaches the icon. Fade it like the label.
                  props.disabled && 'opacity-50',
                )}
              >
                {props.iconNode}
              </span>
            ) : undefined
          }
          trailing={trailing}
          className={clsx(
            props.highlighted && 'active',
            props.className,
            // A destructive row keeps its colour on hover too; the row's own
            // hover colour would turn it black.
            props.iconColor === 'danger' &&
              'action-row-active:text-danger menu-row-active:text-danger',
          )}
          data-highlighted={props.highlighted ? '' : undefined}
          aria-describedby={description ? descriptionId : undefined}
          // onSelect, not onClick: it covers keyboard activation (Enter/Space)
          // as well as pointer, and closes the menu afterwards. `disabled`
          // blocks selection.
          onSelect={() => props.action()}
          disabled={props.disabled}
        >
          <span
            className={props.disabled ? 'opacity-50' : undefined}
            data-testid="action-item-content"
          >
            {props.label}
          </span>
        </MenuItem>
        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </>
    );
  },
);
MenuActionItem.displayName = 'MenuActionItem';
