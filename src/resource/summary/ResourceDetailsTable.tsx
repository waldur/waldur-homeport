import { FC } from 'react';
import { Container } from 'react-bootstrap';

export const ResourceDetailsTable: FC = (props) => (
  <Container>{props.children}</Container>
);
