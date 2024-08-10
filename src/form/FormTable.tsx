import { WarningCircle } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Table } from 'react-bootstrap';

import { wrapTooltip } from '@waldur/table/ActionButton';
import './FormTable.scss';

interface FormTableItemProps {
  label?: ReactNode;
  description?: ReactNode;
  value: ReactNode;
  warnTooltip?: string;
  actions?: ReactNode;
}

const FormTableItem: FC<FormTableItemProps> = (props) => {
  return (
    <tr>
      {props.description ? (
        <th className="col-md-4">
          <div className="fw-bolder">
            {props.label}
            {Boolean(props.warnTooltip) &&
              wrapTooltip(
                props.warnTooltip,
                <WarningCircle size={20} className="ms-2 text-warning mb-1" />,
              )}
          </div>
          <div className="fw-normal">{props.description}</div>
        </th>
      ) : props.label ? (
        <th className="col-md-3">
          {props.label}:{' '}
          {Boolean(props.warnTooltip) &&
            wrapTooltip(
              props.warnTooltip,
              <WarningCircle size={20} className="ms-2 text-warning mb-1" />,
            )}
        </th>
      ) : null}
      <td className="col-md" colSpan={props.label ? undefined : 2}>
        {props.value}
      </td>
      <td className="col-md-auto col-actions">{props.actions}</td>
    </tr>
  );
};

type FormTableCardProps = FC<
  PropsWithChildren<{
    title?: ReactNode;
    className?: string;
  }>
>;

const FormTableCard: FormTableCardProps = (props) => {
  return (
    <Card className={classNames('form-table-card', props.className)}>
      {props.title && (
        <Card.Header>
          <Card.Title>
            <h3>{props.title}</h3>
          </Card.Title>
        </Card.Header>
      )}
      <Card.Body>{props.children}</Card.Body>
    </Card>
  );
};

const FormTable: FC<PropsWithChildren> & {
  Item: FC<FormTableItemProps>;
  Card: FormTableCardProps;
} = (props) => {
  return (
    <Table bordered={true} responsive={true} className="form-table">
      <tbody>{props.children}</tbody>
    </Table>
  );
};

FormTable.Card = FormTableCard;
FormTable.Item = FormTableItem;

export default FormTable;
