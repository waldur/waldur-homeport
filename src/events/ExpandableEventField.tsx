import React, { FunctionComponent } from 'react';

import { PropertyItem } from 'waldur-ui';

import { Link } from '@/core/Link';

interface ExpandableEventFieldProps {
  label: string;
  value: React.ReactNode;
  state?: string;
  params?: {};
}

export const ExpandableEventField: FunctionComponent<
  ExpandableEventFieldProps
> = (props) => {
  let value = props.value;
  if (!value) {
    return null;
  }
  if (props.state) {
    value = <Link state={props.state} params={props.params} label={value} />;
  }
  return <PropertyItem label={props.label}>{value}</PropertyItem>;
};
