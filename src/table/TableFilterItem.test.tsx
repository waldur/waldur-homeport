import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TableSidebarFilterValues } from './TableFilterItem';

describe('TableSidebarFilterValues', () => {
  const mockRemove = vi.fn();

  it('should render nothing for empty value', () => {
    const { container } = render(
      <TableSidebarFilterValues
        value=""
        getValueLabel={(v) => v}
        remove={mockRemove}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing for undefined value', () => {
    const { container } = render(
      <TableSidebarFilterValues
        value={undefined}
        getValueLabel={(v) => v}
        remove={mockRemove}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render string value directly', () => {
    render(
      <TableSidebarFilterValues
        value="Test Value"
        getValueLabel={(v) => v}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should extract label from object using getValueLabel', () => {
    const objectValue = { name: 'Proposal Name', uuid: '123-456' };
    render(
      <TableSidebarFilterValues
        value={objectValue}
        getValueLabel={(v) => v?.name}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Proposal Name')).toBeInTheDocument();
    expect(screen.queryByText('123-456')).not.toBeInTheDocument();
  });

  it('should extract full_name from reviewer object', () => {
    const reviewerValue = { full_name: 'John Doe', uuid: '789-abc' };
    render(
      <TableSidebarFilterValues
        value={reviewerValue}
        getValueLabel={(v) => v?.full_name || v?.email || v?.username}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle array of objects', () => {
    const arrayValue = [
      { name: 'Item 1', uuid: 'uuid-1' },
      { name: 'Item 2', uuid: 'uuid-2' },
    ];
    render(
      <TableSidebarFilterValues
        value={arrayValue}
        getValueLabel={(v) => v?.name}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should handle array with label property', () => {
    const arrayValue = [
      { label: 'State 1', value: 'pending' },
      { label: 'State 2', value: 'approved' },
    ];
    render(
      <TableSidebarFilterValues
        value={arrayValue}
        getValueLabel={(v) => v?.label || v}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('State 1')).toBeInTheDocument();
    expect(screen.getByText('State 2')).toBeInTheDocument();
  });

  it('should render slug from round object', () => {
    const roundValue = { slug: 'round-1', name: 'Round One', uuid: 'xyz-123' };
    render(
      <TableSidebarFilterValues
        value={roundValue}
        getValueLabel={(v) => v?.slug || v?.name}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('round-1')).toBeInTheDocument();
  });

  it('should use badgeValue when provided', () => {
    render(
      <TableSidebarFilterValues
        value="any value"
        getValueLabel={(v) => v}
        badgeValue={() => 'Custom Badge'}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Custom Badge')).toBeInTheDocument();
  });
});
