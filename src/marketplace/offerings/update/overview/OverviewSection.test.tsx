import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateOverview } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { OverviewSection } from './OverviewSection';

describe('OverviewSection', () => {
  const mockRefetch = vi.fn();

  const mockOffering = {
    uuid: 'offering-uuid',
    name: 'Test Offering',
    description: 'Test description',
    full_description: 'Test full description',
    privacy_policy_link: 'https://privacy.com',
    access_url: 'https://access.com',
    documentation_url: 'https://docs.com',
    helpdesk_url: 'https://helpdesk.com',
    backend_id: 'backend-123',
    slug: 'test-offering',
    getting_started: false,
    thumbnail: null,
    image: null,
    latitude: 10,
    longitude: 20,
    tags: [{ name: 'tag1' }, { name: 'tag2' }],
    profile_name: 'Test Profile',
    organization_groups: [{ name: 'Group A' }],
    has_compliance_requirements: false,
    compliance_checklist: null,
  } as any;

  const renderComponent = (offeringData = mockOffering) => {
    return renderWithProviders(
      <OverviewSection
        loading={false}
        offering={offeringData}
        refetch={mockRefetch}
      />,
    );
  };

  const testEditField = async (
    user: any,
    fieldName: string,
    newValue: string,
  ) => {
    const { openDialog } = useModal();
    vi.mocked(openDialog).mockClear();

    const editButton = screen.getByTestId(`edit-${fieldName}`);
    await user.click(editButton);

    const resolveProps = vi.mocked(openDialog).mock.calls[0][1].resolve;
    const { unmount } = renderWithProviders(
      <EditFieldDialog resolve={resolveProps} />,
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, newValue);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateOverview).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            [fieldName]: newValue,
          }),
        }),
      );
    });
    unmount();
  };

  it('renders all tabs', () => {
    renderComponent();
    expect(
      screen.getByRole('tab', { name: /Basic info/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Links/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Media/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Access & Discovery/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Compliance/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Identifiers/i }),
    ).toBeInTheDocument();
  });

  it('renders basic info fields using EditFields', () => {
    renderComponent();
    expect(screen.getByText('Test Offering')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Test full description')).toBeInTheDocument();
  });

  it('renders links fields correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Switch to Links tab
    const linksTab = screen.getByRole('tab', { name: /Links/i });
    await user.click(linksTab);

    expect(screen.getByText('https://privacy.com')).toBeInTheDocument();
    expect(screen.getByText('https://access.com')).toBeInTheDocument();
    expect(screen.getByText('https://docs.com')).toBeInTheDocument();
    expect(screen.getByText('https://helpdesk.com')).toBeInTheDocument();
  });

  it('renders identifier fields correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Switch to Identifiers tab
    const identifiersTab = screen.getByRole('tab', { name: /Identifiers/i });
    await user.click(identifiersTab);

    expect(screen.getByText('offering-uuid')).toBeInTheDocument();
    expect(screen.getByText('backend-123')).toBeInTheDocument();
    expect(screen.getByText('test-offering')).toBeInTheDocument();
  });

  it('renders formatted items for non-string fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Access tab
    const accessTab = screen.getByRole('tab', { name: /Access & Discovery/i });
    await user.click(accessTab);

    // Tags mapped
    expect(screen.getByText('tag1, tag2')).toBeInTheDocument();
    // Profile
    expect(screen.getByText('Test Profile')).toBeInTheDocument();

    // Compliance tab
    const complianceTab = screen.getByRole('tab', { name: /Compliance/i });
    await user.click(complianceTab);

    // Access policies mapped
    expect(screen.getByText('Group A')).toBeInTheDocument();
  });

  it('disables editing and adds synchronization tooltips for remote offerings', async () => {
    const user = userEvent.setup();

    const remoteOffering = {
      ...mockOffering,
      type: REMOTE_OFFERING_TYPE,
    };
    renderComponent(remoteOffering);

    // Verify Name edit button is disabled and has correct tooltip aria-label
    const nameEditButton = screen.getByTestId('edit-name');
    expect(nameEditButton).toBeDisabled();
    expect(nameEditButton).toHaveAttribute(
      'aria-label',
      'Field is synchronised from the remote offering',
    );

    // Switch to Links tab and check Privacy policy link edit button
    const linksTab = screen.getByRole('tab', { name: /Links/i });
    await user.click(linksTab);

    // Privacy policy link is the first field in the Links tab
    const linkEditButton = screen.getByTestId('edit-privacy_policy_link');
    expect(linkEditButton).toBeDisabled();
    expect(linkEditButton).toHaveAttribute(
      'aria-label',
      'Field is synchronised from the remote offering',
    );
  });

  it('allows editing basic info fields (name, description, full_description)', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateOverview).mockResolvedValue(
      {} as any,
    );

    renderComponent();

    const basicInfoTab = screen.getByRole('tab', { name: /Basic info/i });
    await user.click(basicInfoTab);

    await testEditField(user, 'name', 'New Offering Name');
    await testEditField(user, 'description', 'New description');
    await testEditField(user, 'full_description', 'New full description');
  });

  it('allows editing link fields (privacy_policy_link, access_url, documentation_url, helpdesk_url)', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateOverview).mockResolvedValue(
      {} as any,
    );

    renderComponent();

    const linksTab = screen.getByRole('tab', { name: /Links/i });

    await user.click(linksTab);
    await testEditField(user, 'privacy_policy_link', 'https://new-privacy.com');

    await user.click(linksTab);
    await testEditField(user, 'access_url', 'https://new-access.com');

    await user.click(linksTab);
    await testEditField(user, 'documentation_url', 'https://new-docs.com');

    await user.click(linksTab);
    await testEditField(user, 'helpdesk_url', 'https://new-helpdesk.com');
  });

  it('allows editing identifier fields (backend_id, slug)', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateOverview).mockResolvedValue(
      {} as any,
    );

    renderComponent();

    const identifiersTab = screen.getByRole('tab', { name: /Identifiers/i });

    await user.click(identifiersTab);
    await testEditField(user, 'backend_id', 'new-backend-456');

    await user.click(identifiersTab);
    await testEditField(user, 'slug', 'new-offering-slug');
  });
});
