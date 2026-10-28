import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';

import {
  FieldScope,
  HelpIcon,
  Tooltip,
  useFieldLabelFor,
  WarningTip,
} from 'waldur-ui';

import { RefreshButton } from '@/marketplace/offerings/update/components/RefreshButton';

import './FormTable.scss';

export interface FormTableItemProps {
  label?: ReactNode;
  colon?: boolean;
  description?: ReactNode;
  value?: ReactNode;
  group?: boolean;
  tooltip?: ReactNode;
  warnTooltip?: string;
  actions?: ReactNode;
  disabled?: boolean;
  className?: string;
  descriptionClassName?: string;
  valueClass?: string;
  actionsClass?: string;
  required?: boolean;
  'data-testid'?: string;
}

/** The row's label: points at the first control in the row's value cell. */
const ItemLabel: FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <label htmlFor={useFieldLabelFor()} className={className}>
    {children}
  </label>
);

const FormTableItem: FC<PropsWithChildren<FormTableItemProps>> = ({
  actions,
  ...props
}) => {
  const value = props.children || props.value;
  const groupValues = props.group && Array.isArray(value);
  const titleRowSpan = groupValues ? (value as any[]).length : 1;
  const rows = (groupValues ? (value as any[]) : [value]).map((row, i) => (
    <tr key={i} className={props.className} data-testid={props['data-testid']}>
      {i === 0 && props.description ? (
        <th className={row ? 'md:w-4/12' : 'md:w-auto'} rowSpan={titleRowSpan}>
          <div className="flex items-center">
            <ItemLabel className="title mb-0">
              {props.label}
              {props.required && <span className="text-danger ms-1">*</span>}
              {props.colon && ':'}
            </ItemLabel>
            {props.tooltip && (
              <HelpIcon label={props.tooltip} size={20} className="ms-1.5" />
            )}
            {props.warnTooltip && (
              <WarningTip
                label={props.warnTooltip}
                size={20}
                className="ms-1.5"
              />
            )}
          </div>
          {props.description ? (
            <Tooltip label={props.description}>
              <div
                className={classNames(
                  'description font-normal',
                  props.descriptionClassName,
                )}
              >
                {props.description}
              </div>
            </Tooltip>
          ) : (
            <div
              className={classNames(
                'description font-normal',
                props.descriptionClassName,
              )}
            >
              {props.description}
            </div>
          )}
        </th>
      ) : i === 0 && props.label ? (
        <th className="title md:w-3/12" rowSpan={titleRowSpan}>
          <div className="flex items-center">
            <ItemLabel className="mb-0">
              {props.label}
              {props.required && <span className="text-danger ms-1">*</span>}
              {props.colon && ':'}
            </ItemLabel>
            {props.tooltip && (
              <HelpIcon label={props.tooltip} size={20} className="ms-1.5" />
            )}
            {props.warnTooltip && (
              <WarningTip
                label={props.warnTooltip}
                size={20}
                className="ms-1.5"
              />
            )}
          </div>
        </th>
      ) : null}
      {row || [false, 0].includes(row) ? (
        <td
          className={classNames('value', props.valueClass)}
          colSpan={props.label ? undefined : 2}
        >
          {row}
        </td>
      ) : (
        <td className="value" />
      )}
      <td
        className={classNames(
          'md:w-auto col-actions text-end',
          props.actionsClass,
        )}
      >
        {actions}
      </td>
    </tr>
  ));
  // One scope for every row of a grouped item, so its label (in the first
  // row) names the first control wherever it is.
  return <FieldScope>{rows}</FieldScope>;
};

type FormTableCardProps = FC<
  PropsWithChildren<{
    title?: ReactNode;
    className?: string;
    headerClassName?: string;
    refetch?(): void;
    loading?: boolean;
    actions?: ReactNode;
  }>
>;

const FormTableCard: FormTableCardProps = (props) => {
  return (
    <div className={classNames('card form-table-card', props.className)}>
      {props.title && (
        <div className={classNames('card-header', props.headerClassName)}>
          <div className="card-title">
            <h3>{props.title}</h3>
            {props.refetch && (
              <RefreshButton refetch={props.refetch} loading={props.loading} />
            )}
          </div>
          {props.actions && (
            <div className="card-toolbar grow justify-end gap-2.5">
              {props.actions}
            </div>
          )}
        </div>
      )}
      <div className="card-body">{props.children}</div>
    </div>
  );
};

interface FormTableProps {
  hideActions?: boolean;
  /** Bold titles and muted values */
  detailsMode?: boolean;
  alignTop?: boolean;
  className?: string;
}

const FormTable: FC<PropsWithChildren<FormTableProps>> & {
  Item: FC<PropsWithChildren<FormTableItemProps>>;
  Card: FormTableCardProps;
} = (props) => {
  return (
    <div className="table-responsive">
      <table
        className={classNames(
          'table form-table',
          props.hideActions && 'hide-actions',
          props.detailsMode && 'details-mode',
          props.alignTop && 'align-top',
          props.className,
        )}
      >
        <tbody>{props.children}</tbody>
      </table>
    </div>
  );
};

FormTable.Card = FormTableCard;
FormTable.Item = FormTableItem;

export default FormTable;
