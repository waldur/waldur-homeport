import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';

import { OpenStackSecurityGroupsLink } from './OpenStackSecurityGroupsLink';

const mockStore = configureStore();
const store = mockStore();

vi.mock('@/modal/actions');

export const renderLink = (props) => {
  return render(
    <Provider store={store}>
      <OpenStackSecurityGroupsLink {...props} />
    </Provider>,
  );
};

describe('OpenStackSecurityGroupsLink', () => {
  const mockOpenDialog = vi.fn();

  beforeEach(() => {
    vi.mocked(useModal).mockReturnValue({
      openDialog: mockOpenDialog,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders placeholder if items list is empty', () => {
    renderLink({ items: [] });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders comma separated list of security group names', () => {
    const items = [{ name: 'ssh' }, { name: 'default' }];
    renderLink({ items });
    expect(screen.getByText('ssh, default')).toBeInTheDocument();
  });

  it('should render security group names when items are provided', () => {
    const items = [{ name: 'security-group-1' }, { name: 'security-group-2' }];

    renderLink({ items });

    expect(
      screen.getByText('security-group-1, security-group-2'),
    ).toBeInTheDocument();
  });

  it('should open modal dialog when clicked', async () => {
    const items = [{ name: 'security-group-1' }];

    renderLink({ items });

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.anything(), // We can't directly compare the lazy-loaded component
      {
        resolve: { securityGroups: items },
        size: 'lg',
      },
    );
  });
});
