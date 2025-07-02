import { QuestionIcon, WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Table } from 'react-bootstrap';

import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { wrapTooltip } from '@waldur/table/ActionButton';

import './FormTable.scss';

export interface FormTableItemProps {
  label?: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  group?: boolean;
  tooltip?: ReactNode;
  warnTooltip?: string;
  actions?: ReactNode;
  disabled?: boolean;
  className?: string;
  descriptionClassName?: string;
  required?: boolean;
}

const FormTableItem: FC<FormTableItemProps> = ({ actions, ...props }) => {
  const groupValues = props.group && Array.isArray(props.value);
  const titleRowSpan = groupValues ? (props.value as any[]).length : 1;
  return (groupValues ? (props.value as any[]) : [props.value]).map(
    (row, i) => (
      <tr
        key={i}
        className={classNames(props.disabled && 'opacity-50', props.className)}
      >
        {i === 0 && props.description ? (
          <th
            className={row ? 'col-md-4' : 'col-md-auto'}
            rowSpan={titleRowSpan}
          >
            <div className="title fw-bolder">
              {props.label}
              {props.required && <span className="text-danger ms-1">*</span>}
              {Boolean(props.tooltip) &&
                wrapTooltip(
                  props.tooltip,
                  <QuestionIcon
                    size={20}
                    weight="bold"
                    className="ms-2 text-muted mb-1"
                    data-testid="tooltip"
                  />,
                )}
              {Boolean(props.warnTooltip) &&
                wrapTooltip(
                  props.warnTooltip,
                  <WarningCircleIcon
                    size={20}
                    weight="bold"
                    className="ms-2 text-warning mb-1"
                    data-testid="warning"
                  />,
                )}
            </div>
            <div
              className={classNames(
                'description fw-normal',
                props.descriptionClassName,
              )}
            >
              {props.description}
            </div>
          </th>
        ) : i === 0 && props.label ? (
          <th className="title col-md-3" rowSpan={titleRowSpan}>
            {props.label}
            {props.required && <span className="text-danger ms-1">*</span>}{' '}
            {Boolean(props.tooltip) &&
              wrapTooltip(
                props.tooltip,
                <QuestionIcon
                  size={20}
                  weight="bold"
                  className="ms-2 text-muted mb-1"
                  data-testid="tooltip"
                />,
              )}
            {Boolean(props.warnTooltip) &&
              wrapTooltip(
                props.warnTooltip,
                <WarningCircleIcon
                  size={20}
                  weight="bold"
                  className="ms-2 text-warning mb-1"
                />,
              )}
          </th>
        ) : null}
        {row ? (
          <td className="value col-md" colSpan={props.label ? undefined : 2}>
            {row}
          </td>
        ) : (
          <td className="value col-md" />
        )}
        <td className="col-md-auto col-actions text-end">{actions}</td>
      </tr>
    ),
  );
};

type FormTableCardProps = FC<
  PropsWithChildren<{
    title?: ReactNode;
    className?: string;
    refetch?(): void;
    loading?: boolean;
    actions?: ReactNode;
  }>
>;

const FormTableCard: FormTableCardProps = (props) => {
  return (
    <Card className={classNames('form-table-card', props.className)}>
      {props.title && (
        <Card.Header>
          <Card.Title>
            <h3>{props.title}</h3>
            {props.refetch && (
              <RefreshButton refetch={props.refetch} loading={props.loading} />
            )}
          </Card.Title>
          {props.actions && (
            <div className="card-toolbar gap-3">{props.actions}</div>
          )}
        </Card.Header>
      )}
      <Card.Body>{props.children}</Card.Body>
    </Card>
  );
};

interface FormTableProps {
  hideActions?: boolean;
  /** Bold titles and muted values */
  detailsMode?: boolean;
  alignTop?: boolean;
  className?: string;
}

const TABLE_GY_SPACE_REGEX = /(?<=\s|^)(g[y]?-([1-9]\d*))( ?)(?=\s|$)/;
const TABLE_GX_SPACE_REGEX = /(?<=\s|^)(g[x]?-([1-9]\d*))( ?)(?=\s|$)/;

const FormTable: FC<PropsWithChildren<FormTableProps>> & {
  Item: FC<FormTableItemProps>;
  Card: FormTableCardProps;
} = (props) => {
  return (
    <Table
      bordered={true}
      responsive={true}
      className={classNames(
        'form-table',
        props.hideActions && 'hide-actions',
        props.detailsMode && 'details-mode',
        props.alignTop && 'align-top',
        !TABLE_GY_SPACE_REGEX.test(props.className) && 'gy-base',
        !TABLE_GX_SPACE_REGEX.test(props.className) && 'gx-5',
        props.className,
      )}
    >
      <tbody>{props.children}</tbody>
    </Table>
  );
};

FormTable.Card = FormTableCard;
FormTable.Item = FormTableItem;

export default FormTable;
