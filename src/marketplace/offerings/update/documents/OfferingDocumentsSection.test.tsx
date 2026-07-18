import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { OfferingDocumentsSection } from './OfferingDocumentsSection';

// Capture the useTable config and stub the heavy Table so we can exercise the
// section's column renderers and table actions in isolation.
const useTableSpy = vi.fn();
vi.mock('@/table/useTable', () => ({
  useTable: (config: any) => {
    useTableSpy(config);
    return { fetch: vi.fn(), rows: [], filter: config.filter };
  },
}));

const fakeRow = {
  uuid: 'file-1',
  name: 'User Guide',
  file: 'https://example.com/media/offering_files/guide.pdf',
  created: '2026-01-02T10:00:00Z',
};

vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div>
      <h3>{props.title}</h3>
      <div data-testid="table-actions">{props.tableActions}</div>
      <div data-testid="table-row">
        {props.columns.map((column: any, index: number) => (
          <div key={index}>{column.render({ row: fakeRow })}</div>
        ))}
      </div>
    </div>
  ),
}));

const offering = {
  uuid: 'offering-uuid',
  url: 'offering-url',
  name: 'Test offering',
} as any;

const renderSection = () =>
  renderWithProviders(
    <OfferingDocumentsSection
      offering={offering}
      refetch={vi.fn()}
      loading={false}
    />,
  );

describe('OfferingDocumentsSection', () => {
  it('renders the Documents table with an add action', () => {
    renderSection();
    expect(
      screen.getByRole('heading', { name: 'Documents' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Add document')).toBeInTheDocument();
  });

  it('renders each file as a download link labelled by its name', () => {
    renderSection();
    const link = screen.getByRole('link', { name: 'User Guide' });
    expect(link).toHaveAttribute(
      'href',
      'https://example.com/media/offering_files/guide.pdf',
    );
  });

  it('filters the file list by the offering uuid', () => {
    renderSection();
    expect(useTableSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'OfferingDocuments',
        filter: { offering_uuid: 'offering-uuid' },
      }),
    );
  });
});
