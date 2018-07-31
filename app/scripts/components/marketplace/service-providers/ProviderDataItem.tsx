import * as React from 'react';
import { ReactNode } from 'react';

import './ProviderDataItem.scss';

interface ProviderDataItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export const ProviderDataItem: React.SFC<ProviderDataItemProps> = (props: ProviderDataItemProps) => (
  <div className={props.className}>
    <h4>{props.label}:</h4>
    {props.value ? <span>{props.value}</span> : <span>&mdash;</span>}
  </div>
);

ProviderDataItem.defaultProps = {
  className: 'provider-data__item m-r-lg m-b-sm',
};
