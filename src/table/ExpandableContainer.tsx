import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import './ExpandableContainer.scss';

interface ExpandableContainerProps {
  asTable?: boolean;
  hasMultiSelect?: boolean;
}

export const ExpandableContainer: FC<
  PropsWithChildren<ExpandableContainerProps>
> = ({ asTable, hasMultiSelect, children }) => (
  <div
    className={classNames(
      'expandable-container',
      asTable && 'as-table',
      hasMultiSelect && 'has-multiselect',
    )}
  >
    {children}
  </div>
);
