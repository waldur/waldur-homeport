import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PropertyList } from 'waldur-ui';

import {
  getAttributeLabel,
  OrderAttributeProperty,
} from './PendingOrderDetailsDialog';

const valueOf = (label: string) =>
  screen.getByRole('definition', { name: new RegExp(label) });

describe('getAttributeLabel', () => {
  it('returns human-readable labels for known order attribute keys', () => {
    expect(getAttributeLabel('new_end_date')).toBe('New end date');
    expect(getAttributeLabel('renewal_cost')).toBe('Renewal cost');
    expect(getAttributeLabel('accepting_terms_of_service')).toBe(
      'Terms of service accepted',
    );
  });

  it('formats unknown snake_case keys as capitalized title', () => {
    expect(getAttributeLabel('custom_attribute_key')).toBe(
      'Custom Attribute Key',
    );
  });
});

describe('OrderAttributeProperty', () => {
  it('renders boolean attributes using propVal.boolean', () => {
    render(
      <PropertyList detailsMode>
        <OrderAttributeProperty
          name="accepting_terms_of_service"
          value={true}
        />
        <OrderAttributeProperty name="is_active" value={false} />
      </PropertyList>,
    );

    expect(valueOf('Terms of service accepted')).toHaveTextContent('Yes');
    expect(valueOf('Is Active')).toHaveTextContent('No');
  });

  it('renders price and cost attributes using propVal.currency', () => {
    render(
      <PropertyList detailsMode>
        <OrderAttributeProperty name="renewal_cost" value={150} />
      </PropertyList>,
    );

    expect(valueOf('Renewal cost')).toHaveTextContent('€150.00');
  });

  it('renders date attributes using propVal.date with datetime precision', () => {
    render(
      <PropertyList detailsMode>
        <OrderAttributeProperty
          name="new_end_date"
          value="2026-06-15T12:00:00Z"
        />
      </PropertyList>,
    );

    expect(valueOf('New end date')).toHaveTextContent(/2026/);
  });

  it('renders object attributes using propVal.json', () => {
    render(
      <PropertyList detailsMode>
        <OrderAttributeProperty name="limits" value={{ cpu: 4, ram: 8192 }} />
      </PropertyList>,
    );

    expect(valueOf('Limits')).toHaveTextContent('"cpu": 4');
  });

  it('renders plain text attributes', () => {
    render(
      <PropertyList detailsMode>
        <OrderAttributeProperty name="name" value="Custom VM name" />
      </PropertyList>,
    );

    expect(valueOf('Name')).toHaveTextContent('Custom VM name');
  });

  it('renders a dash for null or undefined values', () => {
    render(
      <PropertyList detailsMode>
        <OrderAttributeProperty name="description" value={null} />
      </PropertyList>,
    );

    expect(valueOf('Description')).toHaveTextContent('—');
  });
});
