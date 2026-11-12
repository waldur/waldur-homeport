import classNames from 'classnames';
import { CSSProperties, FC, PropsWithChildren } from 'react';
import { PropertyList } from 'waldur-ui';

interface ExpandableContainerProps {
  /** Children are summary rows: render them in one `PropertyList`, with
   * their labels lined up in one column. */
  asTable?: boolean;
  /**
   * Omit empty rows in the table list. Defaults to true when asTable is true,
   * preserving base behavior where empty fields are omitted.
   */
  hideIfEmpty?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The content of an expanded table row. The row's own slot (`TableBody`,
 * `data-slot="expanded-row-content"`) indents it past the expander and
 * checkbox columns and keeps it as wide as the visible table, so this only
 * lays out what goes inside.
 */
export const ExpandableContainer: FC<
  PropsWithChildren<ExpandableContainerProps>
> = ({ asTable, hideIfEmpty = true, children, className, style }) => (
  <div
    data-slot="expandable-container"
    className={classNames('expandable-container w-full', className)}
    style={style}
  >
    {asTable ? (
      <PropertyList
        variant="summary"
        termWidth="175px"
        hideIfEmpty={hideIfEmpty}
      >
        {children}
      </PropertyList>
    ) : (
      children
    )}
  </div>
);
