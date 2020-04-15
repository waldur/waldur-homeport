import * as classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';
import useBoolean from 'react-use/lib/useBoolean';

import './CollapsibleItem.scss';

interface CollapsibleItemProps {
  title: ReactNode;
  selected?: boolean;
  counter?: number;
}

export const CollapsibleItem: React.FC<CollapsibleItemProps> = props => {
  const [collapsed, onClick] = useBoolean(false);
  return (
    <div className="collapsible-item">
      <div
        className={classNames('collapsible-item__title', {
          selected: props.selected,
        })}
        onClick={onClick}
      >
        {props.title}{' '}
        {collapsed ? (
          <i className="fa fa-chevron-up" />
        ) : (
          <i className="fa fa-chevron-down" />
        )}{' '}
        {props.counter !== 0 && `(${props.counter})`}
      </div>
      <div className={classNames('collapsible-item__content', { collapsed })}>
        {props.children}
      </div>
    </div>
  );
};
