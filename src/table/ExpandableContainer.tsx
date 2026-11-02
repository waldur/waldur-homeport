import classNames from 'classnames';
import { CSSProperties, FC, PropsWithChildren } from 'react';

import { PropertyList } from 'waldur-ui';

import './ExpandableContainer.scss';

interface ExpandableContainerProps {
  /** Children are summary rows: render them in one `PropertyList`, with
   * their labels lined up as a table. */
  asTable?: boolean;
  /** Line up the labels of rows laid out in lists of their own (columns,
   * sections), as `asTable` does, without wrapping the children in a list. */
  alignRows?: boolean;
  hasMultiSelect?: boolean;
  /**
   * Omit empty rows in the table list. Defaults to true when asTable is true,
   * preserving base behavior where empty fields are omitted.
   */
  hideIfEmpty?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const ExpandableContainer: FC<
  PropsWithChildren<ExpandableContainerProps>
> = ({
  asTable,
  alignRows,
  hasMultiSelect,
  hideIfEmpty = true,
  children,
  className,
  style,
}) => (
  <div
    className={classNames(
      'expandable-container',
      (asTable || alignRows) && 'as-table',
      hasMultiSelect && 'has-multiselect',
      className,
    )}
    style={style}
  >
    {asTable ? (
      <PropertyList variant="summary" hideIfEmpty={hideIfEmpty}>
        {children}
      </PropertyList>
    ) : (
      children
    )}
  </div>
);
