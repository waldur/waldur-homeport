import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import {
  hasSlurmPlacement,
  SlurmPlacementFields,
} from './SlurmPlacementFields';

describe('SlurmPlacementFields', () => {
  it('shows the requested QoS and partition', () => {
    renderWithProviders(
      <SlurmPlacementFields attributes={{ qos: 'long', partition: 'gh200' }} />,
    );

    expect(screen.getByText('QoS:')).toBeInTheDocument();
    expect(screen.getByText('long')).toBeInTheDocument();
    expect(screen.getByText('Partition:')).toBeInTheDocument();
    expect(screen.getByText('gh200')).toBeInTheDocument();
  });

  it('shows only the attributes that are set', () => {
    renderWithProviders(
      <SlurmPlacementFields attributes={{ partition: 'gpu' }} />,
    );

    expect(screen.getByText('gpu')).toBeInTheDocument();
    expect(screen.queryByText('QoS:')).not.toBeInTheDocument();
  });

  it('renders nothing for offerings without SLURM attributes', () => {
    const { container } = renderWithProviders(
      <SlurmPlacementFields attributes={{ backup: 'daily' }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('reports whether either attribute is set', () => {
    expect(hasSlurmPlacement({ qos: 'long' })).toBe(true);
    expect(hasSlurmPlacement({ partition: 'gpu' })).toBe(true);
    expect(hasSlurmPlacement({ backup: 'daily' })).toBe(false);
    expect(hasSlurmPlacement(undefined)).toBe(false);
  });
});
