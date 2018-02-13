import * as React from 'react';

export const Row = ({ label, value }) => value ? (
  <tr>
    <td><strong>{label}</strong></td>
    <td>{value}</td>
  </tr>
) : null;
