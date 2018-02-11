import * as React from 'react';

export const Row = ({ label, value, visibleIf= '' }) => value ? (
  <tr visible-if={`"${visibleIf}"`}>
    <td><strong>{label}</strong></td>
    <td>{value}</td>
  </tr>
) : null;
