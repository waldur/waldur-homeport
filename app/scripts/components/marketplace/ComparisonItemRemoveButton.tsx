import * as React from 'react';

interface ComparisonItemRemoveButtonProps {
  onClick(): void;
}

export const ComparisonItemRemoveButton = (props: ComparisonItemRemoveButtonProps) => (
  <a className="text-muted comparison-item-close"
    title="Remove from comparison"
    onClick={props.onClick}>
    <i className="fa fa-close"/>
  </a>
);
