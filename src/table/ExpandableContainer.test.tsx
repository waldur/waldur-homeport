import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { ExpandableContainer } from './ExpandableContainer';

// The panel and its lists have no role to query by; the classes and
// elements are what the .as-table styles key on.
const panel = (container: HTMLElement) =>
  // eslint-disable-next-line testing-library/no-node-access
  container.querySelector('.expandable-container');
const lists = (container: HTMLElement) =>
  // eslint-disable-next-line testing-library/no-node-access
  container.querySelectorAll('dl');

describe('ExpandableContainer', () => {
  it('renders asTable rows in one list, lined up as a table', () => {
    const { container } = render(
      <ExpandableContainer asTable>
        <PropertyItem label="Region" value="eu-north-1" />
        <PropertyItem label="Plan" value="Basic" />
      </ExpandableContainer>,
    );

    expect(panel(container)).toHaveClass('as-table');
    expect(lists(container)).toHaveLength(1);
    expect(screen.getAllByRole('term')).toHaveLength(2);
  });

  it('lines up rows held in their own lists without adding one', () => {
    const { container } = render(
      <ExpandableContainer alignRows>
        <div>
          <PropertyList variant="summary">
            <PropertyItem label="Region" value="eu-north-1" />
          </PropertyList>
        </div>
      </ExpandableContainer>,
    );

    expect(panel(container)).toHaveClass('as-table');
    // Only the column's own list: no second <dl> around the column.
    expect(lists(container)).toHaveLength(1);
  });

  it('hides empty rows by default when asTable is true', () => {
    render(
      <ExpandableContainer asTable>
        <PropertyItem label="Region" value={null} />
        <PropertyItem label="Plan" value="Basic" />
      </ExpandableContainer>,
    );

    expect(screen.queryByText(/Region/)).not.toBeInTheDocument();
    expect(screen.getByText('Plan:')).toBeInTheDocument();
  });

  it('keeps empty rows visible with a dash when hideIfEmpty is explicitly false', () => {
    render(
      <ExpandableContainer asTable hideIfEmpty={false}>
        <PropertyItem label="Region" value={null} />
        <PropertyItem label="Plan" value="Basic" />
      </ExpandableContainer>,
    );

    expect(screen.getByText('Region:')).toBeInTheDocument();
    expect(
      screen.getByRole('definition', { name: 'Region:' }),
    ).toHaveTextContent('—');
    expect(screen.getByText('Plan:')).toBeInTheDocument();
  });
});
