import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { TableBody } from './TableBody';

export const ROW_UUID = 1;

export const COLUMNS = [
  {
    title: 'Resource type',
    render: ({ row }) => row.type,
  },
  {
    title: 'Resource name',
    render: ({ row }) => row.name,
  },
];

const ROWS = [
  {
    type: 'OpenStack Instance',
    name: 'Web server',
    uuid: ROW_UUID,
  },
];

export const renderWrapper = (props?) =>
  render(
    <table>
      <TableBody columns={COLUMNS} rows={ROWS} {...props} />
    </table>,
  );

const expandableRow = () => <h3>Detailed info</h3>;

describe('TableBody', () => {
  it('should render a cell for each column', () => {
    renderWrapper();
    expect(screen.getAllByRole('cell')).toHaveLength(COLUMNS.length);
  });

  it('should not render expandable indicator if expandable component is not provided', () => {
    renderWrapper();
    expect(screen.queryByTestId('row-expander')).not.toBeInTheDocument();
  });

  it('should render untoggled expandable indicator if expandable component is provided', () => {
    renderWrapper({ expandableRow, toggled: {} });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(COLUMNS.length + 1);
  });

  it('should render toggled expandable indicator according to props', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
  });

  it('should render extra row if it is expanded', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(screen.getByText('Detailed info')).toBeInTheDocument();
  });
});
