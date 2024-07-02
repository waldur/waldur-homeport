import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Table } from 'react-bootstrap';

import './FormTable.scss';

interface FormTableItemProps {
  label: ReactNode;
  value: ReactNode;
  actions?: ReactNode;
}

const FormTableItem: FC<FormTableItemProps> = (props) => {
  return (
    <tr>
      <th className="col-md-3">{props.label}:</th>
      <td className="col-md">{props.value}</td>
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
