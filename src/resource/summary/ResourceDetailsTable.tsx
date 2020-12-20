import { FC } from 'react';
import './ResourceDetailsTable.scss';

export const ResourceDetailsTable: FC = (props) => (
  <dl className="dl-horizontal resource-details-table">{props.children}</dl>
);
