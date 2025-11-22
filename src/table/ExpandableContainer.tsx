import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import './ExpandableContainer.scss';

interface ExpandableContainerProps {
  asTable?: boolean;
  hasMultiSelect?: boolean;
  className?: string;
}

export const ExpandableContainer: FC<
  PropsWithChildren<ExpandableContainerProps>
> = ({ asTable, hasMultiSelect, children, className }) => (
  <div
    className={classNames(
      'expandable-container',
      asTable && 'as-table',
      hasMultiSelect && 'has-multiselect',
      className,
    )}
  >
    {asTable ? <div>{children}</div> : children}
  </div>
);
