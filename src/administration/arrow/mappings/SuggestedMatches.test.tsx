import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminArrowCustomerMappingsLinkResource } from 'waldur-js-client';

import { SuggestedMatches } from './SuggestedMatches';

vi.mock('waldur-js-client');

vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showErrorResponse: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderComponent = (props) => {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <SuggestedMatches {...props} />
    </QueryClientProvider>,
  );
};

const mockSuggestions = [
  {
    resource_name: 'Resource High',
    resource_uuid: 'uuid-high',
    license_reference: 'REF-HIGH',
    license_name: 'License High',
    confidence: 0.9,
  },
  {
    resource_name: 'Resource Medium',
    resource_uuid: 'uuid-med',
    license_reference: 'REF-MED',
    confidence: 0.6,
  },
  {
    resource_name: 'Resource Low',
    resource_uuid: 'uuid-low',
    license_reference: 'REF-LOW',
    confidence: 0.3,
  },
];

const mappingUuid = 'mapping-123';

describe('SuggestedMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if no suggestions', () => {
    const { container } = renderComponent({ mappingUuid, suggestions: [] });
    expect(container.firstChild).toBeNull();
  });

  it('renders suggestions table', () => {
    renderComponent({ mappingUuid, suggestions: mockSuggestions });

    expect(screen.getByText('Suggested Matches')).toBeInTheDocument();
    expect(screen.getByText('Resource High')).toBeInTheDocument();
    expect(screen.getByText('Resource Medium')).toBeInTheDocument();
    expect(screen.getByText('Resource Low')).toBeInTheDocument();

    // Check confidence badges
    expect(screen.getByText('90%')).toHaveClass('bg-success');
    expect(screen.getByText('60%')).toHaveClass('bg-warning');
    expect(screen.getByText('30%')).toHaveClass('bg-secondary');
  });

  it('calls adminArrowCustomerMappingsLinkResource when Link button is clicked', async () => {
    vi.mocked(adminArrowCustomerMappingsLinkResource).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ mappingUuid, suggestions: mockSuggestions });

    const linkButtons = screen.getAllByText('Link');
    fireEvent.click(linkButtons[0]); // Click first one (High confidence)

    await waitFor(() => {
      expect(adminArrowCustomerMappingsLinkResource).toHaveBeenCalledWith({
        path: { uuid: mappingUuid },
        body: {
          resource_uuid: 'uuid-high',
          license_reference: 'REF-HIGH',
        },
      });
    });
  });
});
