import * as React from 'react';

interface ChartHeaderProps {
  value: React.ReactNode;
  label: React.ReactNode;
}

export const ChartHeader = (props: ChartHeaderProps) =>
  props.value ? (
    <>
      <h2 className="m-b-xs ellipsis">{props.value}</h2>
      <p className="text-uppercase">{props.label}</p>
    </>
  ) : null;
