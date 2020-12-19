import React, { FunctionComponent } from 'react';

interface RowProps {
  isVisible?: boolean;
  value: React.ReactNode;
  label: React.ReactNode;
}

export const Row: FunctionComponent<RowProps> = (props) =>
  props.isVisible !== false && props.value ? (
    <tr>
      <td>
        <strong>{props.label}</strong>
      </td>
      <td>{props.value}</td>
    </tr>
  ) : null;
