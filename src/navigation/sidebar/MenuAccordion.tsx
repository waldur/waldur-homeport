import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { Tip } from '@/core/Tooltip';

interface MenuAccordionProps {
  title: ReactNode;
  itemId?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  child?: ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}

export const MenuAccordion: FC<PropsWithChildren<MenuAccordionProps>> = (
  props,
) => {
  const { disabled = false, disabledTooltip } = props;

  const accordion = (
    <div
      className={classNames('menu-item menu-accordion', {
        'menu-item-disabled': disabled,
      })}
      data-kt-menu-trigger={disabled ? undefined : 'click'}
      data-kt-menu-permanent={disabled ? undefined : 'true'}
      id={props.itemId}
    >
      <span className="menu-link">
        {props.icon && (
          <span className="menu-icon">
            <span className="svg-icon svg-icon-2">{props.icon}</span>
          </span>
        )}
        {props.child && (
          <span className="menu-bullet">
            <span className="bullet bullet-dot" />
          </span>
        )}
        <span className="menu-title">{props.title}</span>
        {Boolean(props.badge) && (
          <span className="menu-badge">{props.badge}</span>
        )}
        {!disabled && <span className="menu-arrow" />}
      </span>
      {!disabled && (
        <div className="menu-sub menu-sub-accordion menu-rounded-0">
          {props.children}
        </div>
      )}
    </div>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tip label={disabledTooltip} id={`menu-accordion-${props.itemId}`}>
        {accordion}
      </Tip>
    );
  }

  return accordion;
};
