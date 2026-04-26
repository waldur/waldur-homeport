import classNames from 'classnames';
import { CSSProperties, FC, PropsWithChildren } from 'react';

import './ExpandableContainer.scss';

interface ExpandableContainerProps {
  asTable?: boolean;
  hasMultiSelect?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const ExpandableContainer: FC<
  PropsWithChildren<ExpandableContainerProps>
> = ({ asTable, hasMultiSelect, children, className, style }) => (
  <div
    className={classNames(
      'expandable-container',
      asTable && 'as-table',
      hasMultiSelect && 'has-multiselect',
      className,
    )}
    style={style}
  >
    {asTable ? <div>{children}</div> : children}
  </div>
);
