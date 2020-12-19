import React, { FunctionComponent } from 'react';

interface ChartHeaderProps {
  value: React.ReactNode;
  label: React.ReactNode;
}

export const ChartHeader: FunctionComponent<ChartHeaderProps> = (props) =>
  props.value ? (
    <>
      <h2 className="m-b-xs ellipsis">{props.value}</h2>
      <p className="text-uppercase">{props.label}</p>
    </>
  ) : null;
