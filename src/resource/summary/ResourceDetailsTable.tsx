import { FC } from 'react';
import { Container } from 'react-bootstrap';
import './ResourceDetailsTable.scss';

export const ResourceDetailsTable: FC = (props) => (
  <Container className="resource-details-table">{props.children}</Container>
);
