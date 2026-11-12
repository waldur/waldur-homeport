import { CaretDownIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { FC } from 'react';
import { translate } from 'waldur-i18n-runtime';

export interface RowExpander {
  canExpand: boolean;
  isExpanded: boolean;
  /** Toggles the row; the expander button calls it. */
  onToggle: () => void;
  /** Id of the details cell, which the button controls while it is shown. */
  detailsId: string;
}

interface TableHeaderExpanderProps {
  toggledAll: boolean;
  onToggleAll: () => void;
}

export const TableHeaderExpander: FC<TableHeaderExpanderProps> = ({
  toggledAll,
  onToggleAll,
}) => (
  <button
    type="button"
    aria-expanded={toggledAll}
    aria-label={
      toggledAll ? translate('Collapse all rows') : translate('Expand all rows')
    }
    onClick={onToggleAll}
    className="group/expander inline-flex items-center justify-center min-w-[24px] min-h-[24px] -my-0.5 mr-3 ml-0 p-0 border-0 bg-transparent text-inherit cursor-pointer"
  >
    <CaretDownIcon
      size={20}
      weight="bold"
      className="transition-transform duration-300 group-aria-expanded/expander:rotate-180"
    />
  </button>
);

interface TableRowExpanderProps {
  expander: RowExpander;
  toggleTextId?: string;
  labelId?: string;
}

export const TableRowExpander: FC<TableRowExpanderProps> = ({
  expander,
  toggleTextId,
  labelId,
}) => (
  <button
    type="button"
    data-testid="row-expander"
    className="group/expander inline-flex size-[24px] shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-inherit cursor-pointer"
    aria-expanded={expander.isExpanded}
    aria-controls={expander.isExpanded ? expander.detailsId : undefined}
    aria-labelledby={`${toggleTextId} ${labelId}`}
    onClick={expander.onToggle}
  >
    <span id={toggleTextId} className="sr-only">
      {expander.isExpanded ? translate('Collapse') : translate('Expand')}
    </span>
    <CaretDownIcon
      size={20}
      weight="bold"
      className="transition-transform duration-300 group-aria-expanded/expander:rotate-180"
      aria-hidden="true"
    />
  </button>
);

interface TableExpandedRowProps {
  colSpanCount: number;
  detailsId: string;
  expandableRowClassName?: string;
  hasLeadingCheckbox: boolean;
  /** The table's card is full-width: its rows start at the card's edge. */
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const TableExpandedRow: FC<TableExpandedRowProps> = ({
  colSpanCount,
  detailsId,
  expandableRowClassName,
  hasLeadingCheckbox,
  fullWidth,
  children,
}) => (
  <tr className="border-b last:border-b-0 border-solid border-secondary [--table-row-bg:var(--bg-secondary)] bg-[var(--table-row-bg)]">
    <td
      colSpan={colSpanCount}
      id={detailsId}
      className={classNames('p-0 text-quaternary', expandableRowClassName)}
      data-testid="expanded-row-cell"
    >
      <div
        data-slot="expanded-row-content"
        className={classNames(
          'sticky left-0 w-[100cqw] max-w-[100cqw] py-4 pe-[var(--card-padding-x,24px)]',
          hasLeadingCheckbox
            ? fullWidth
              ? 'ps-[60px]'
              : 'ps-[84px]'
            : fullWidth
              ? 'ps-[28px]'
              : 'ps-[52px]',
          // In dark, --bg-tertiary is the --border-secondary step: the rule under
          // a nested table's header row would vanish into it.
          '[--table-head-bg:var(--bg-tertiary)] [--table-head-border:var(--border-divider)] [--table-body-bg:var(--bg-secondary)] [--table-edge-px:var(--card-padding-x)] [--pagination-px:var(--card-padding-x)] [--pagination-pt:6.5px]',
        )}
      >
        {children}
      </div>
    </td>
  </tr>
);
