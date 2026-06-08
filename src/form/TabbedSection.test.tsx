import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TabbedSection } from './TabbedSection';

vi.mock('lodash-es', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    debounce: (fn) => {
      const mocked = (...args) => {
        setTimeout(() => fn(...args), 0);
      };
      mocked.cancel = vi.fn();
      return mocked;
    },
  };
});

const DummyField = ({
  label,
  description,
}: {
  label?: string;
  description?: string;
}) => (
  <div data-testid="dummy-field">
    <span>{label}</span>
    <span>{description}</span>
  </div>
);

describe('TabbedSection', () => {
  const mockRouter = {
    stateService: {
      go: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'test-state' } as any,
      params: {},
    });
  });

  it('renders tabs correctly', () => {
    render(
      <TabbedSection title="Section Title">
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Field 1" />
        </TabbedSection.Tab>
        <TabbedSection.Tab id="tab2" title="Tab 2">
          <DummyField label="Field 2" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Field 1')).toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();
    render(
      <TabbedSection>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Field 1" />
        </TabbedSection.Tab>
        <TabbedSection.Tab id="tab2" title="Tab 2">
          <DummyField label="Field 2" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    const tab2Link = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2Link);

    expect(mockRouter.stateService.go).toHaveBeenCalledWith(
      'test-state',
      { section: 'tab2' },
      { location: 'replace' },
    );
  });

  it('filters fields by search query', async () => {
    const user = userEvent.setup();
    render(
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Apple" description="fruit" />
          <DummyField label="Banana" description="fruit" />
          <DummyField label="Carrot" description="vegetable" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'apple');

    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'fruit');
    await waitFor(() => expect(screen.getByText('Banana')).toBeInTheDocument());
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
  });

  it('shows result count badges when searching', async () => {
    const user = userEvent.setup();
    render(
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Apple" />
        </TabbedSection.Tab>
        <TabbedSection.Tab id="tab2" title="Tab 2">
          <DummyField label="Banana" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'apple');

    // Tab 1 should have badge "1", Tab 2 should have badge "0"
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('automatically jumps to the first tab with results if current tab is empty', async () => {
    const user = userEvent.setup();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'test-state' } as any,
      params: { section: 'tab1' },
    });

    render(
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Apple" />
        </TabbedSection.Tab>
        <TabbedSection.Tab id="tab2" title="Tab 2">
          <DummyField label="Banana" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'banana');

    // Should jump to tab2
    await waitFor(() =>
      expect(mockRouter.stateService.go).toHaveBeenCalledWith(
        'test-state',
        { section: 'tab2' },
        { location: 'replace' },
      ),
    );
  });

  it('renders "No results found" when no fields match', async () => {
    const user = userEvent.setup();
    render(
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Apple" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'Zebra');

    await waitFor(() =>
      expect(screen.getByText('No results found')).toBeInTheDocument(),
    );

    const clearButton = screen.getByText('Clear search');
    await user.click(clearButton);

    await waitFor(() => expect(searchInput).toHaveValue(''));
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('renders actions in the header', () => {
    render(
      <TabbedSection
        title="Title"
        actions={<button type="button">My Action</button>}
      >
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Field 1" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    expect(screen.getByText('My Action')).toBeInTheDocument();
  });

  it('disables tabs with zero results during search', async () => {
    const user = userEvent.setup();
    render(
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Apple" />
        </TabbedSection.Tab>
        <TabbedSection.Tab id="tab2" title="Tab 2">
          <DummyField label="Banana" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'apple');

    await waitFor(() => {
      const tab2Link = screen.getByRole('tab', { name: /Tab 2/ });
      expect(tab2Link).toHaveClass('text-muted');
      expect(tab2Link).toHaveClass('disabled');
      expect(tab2Link).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('passes hideActions to FormTable', () => {
    render(
      <TabbedSection hideActions>
        <TabbedSection.Tab id="tab1" title="Tab 1">
          <DummyField label="Field 1" />
        </TabbedSection.Tab>
      </TabbedSection>,
    );
    expect(screen.getByText('Field 1')).toBeInTheDocument();
  });
});
