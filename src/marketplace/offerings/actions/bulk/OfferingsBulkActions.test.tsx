import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderOfferingsActivate,
  marketplaceProviderOfferingsArchive,
  marketplaceProviderOfferingsExportOffering,
  marketplaceProviderOfferingsRetrieve,
  User,
} from 'waldur-js-client';

import { show } from 'waldur-notifications';

import { ENV } from '@/core/config';
import { saveFile } from '@/core/saveFile';
import { useModal } from '@/modal/actions';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { resetSelection, selectRow } from '@/table/actions';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { OfferingsBulkActions } from './OfferingsBulkActions';

const dispatch = vi.fn();

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal()),
  useDispatch: () => dispatch,
}));

vi.mock('waldur-notifications', async (importOriginal) => ({
  ...(await importOriginal()),
  show: vi.fn(),
}));

vi.mock('@/core/saveFile', () => ({ saveFile: vi.fn() }));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT = true;

const TABLE = 'test-offerings';

const offering = (
  uuid: string,
  state: string,
  extra: Record<string, unknown> = {},
) => ({
  uuid,
  name: `Offering ${uuid}`,
  state,
  customer_uuid: 'customer-1',
  plans: [{ uuid: 'plan' }],
  type: 'Marketplace.Basic',
  ...extra,
});

const renderActions = (rows, refetch = vi.fn()) => {
  renderWithProviders(
    <OfferingsBulkActions rows={rows as any} refetch={refetch} table={TABLE} />,
  );
  return refetch;
};

const openMenu = async () => {
  await userEvent.click(screen.getByRole('button', { name: /actions/i }));
};

const menuItem = (name: string) =>
  screen.getByRole('menuitem', { name: new RegExp(`^${name}`) });

describe('OfferingsBulkActions', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as User);
    vi.mocked(hasPermission).mockImplementation(() => true);
    dispatch.mockClear();
    vi.mocked(show).mockClear();
    vi.mocked(useNotify().showSuccess).mockClear();
    vi.mocked(useModal().confirm).mockClear();
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
  });

  it('disables an action no selected offering can take, and says why', async () => {
    renderActions([offering('a', 'Draft'), offering('b', 'Active')]);
    await openMenu();

    expect(menuItem('Activate')).not.toHaveAttribute('data-disabled');
    expect(menuItem('Pause')).not.toHaveAttribute('data-disabled');
    expect(menuItem('Resume')).toHaveAttribute('data-disabled');
    expect(menuItem('Resume')).toHaveAccessibleDescription(
      'None of the selected offerings is paused.',
    );
  });

  it('hides actions the user holds no permission for', async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: 'provider',
      is_staff: false,
    } as User);
    vi.mocked(hasPermission).mockImplementation(
      (_user, request) => request.permission === 'OFFERING.UPDATE',
    );
    renderActions([offering('a', 'Active')]);
    await openMenu();

    expect(screen.queryByRole('menuitem', { name: /^Archive/ })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /^Delete/ })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /^Move/ })).toBeNull();
    expect(menuItem('Set offering group')).toBeInTheDocument();
    expect(menuItem('Export')).toBeInTheDocument();
  });

  it('needs offerings of one organization to set their group', async () => {
    renderActions([
      offering('a', 'Active'),
      offering('b', 'Active', { customer_uuid: 'customer-2' }),
    ]);
    await openMenu();

    expect(menuItem('Set offering group')).toHaveAttribute('data-disabled');
  });

  it('archives only the offerings that are not archived yet', async () => {
    vi.mocked(marketplaceProviderOfferingsArchive).mockResolvedValue({} as any);
    renderActions([offering('a', 'Active'), offering('b', 'Archived')]);
    await openMenu();
    await userEvent.click(menuItem('Archive'));

    await waitFor(() =>
      expect(marketplaceProviderOfferingsArchive).toHaveBeenCalledTimes(1),
    );
    expect(marketplaceProviderOfferingsArchive).toHaveBeenCalledWith({
      path: { uuid: 'a' },
    });
  });

  it('reports a partial failure and keeps the failed offering selected', async () => {
    vi.mocked(marketplaceProviderOfferingsArchive).mockReset();
    vi.mocked(marketplaceProviderOfferingsArchive).mockImplementation((({
      path,
    }) =>
      path.uuid === 'b'
        ? Promise.reject(new Error('Offering state is invalid.'))
        : Promise.resolve({})) as any);
    const rows = [offering('a', 'Active'), offering('b', 'Paused')];
    const refetch = renderActions(rows);
    await openMenu();
    await userEvent.click(menuItem('Archive'));

    await waitFor(() => expect(show).toHaveBeenCalled());
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      '1 offering(s) have been archived.',
    );
    expect(vi.mocked(show).mock.calls[0][0]).toBe('error');
    expect(vi.mocked(show).mock.calls[0][1]).toBe(
      'Unable to archive 1 offering(s).',
    );
    expect(refetch).toHaveBeenCalled();
    // Exactly the failed offering: the selection is cleared first, then set.
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      resetSelection(TABLE),
      selectRow(TABLE, rows[1]),
    ]);
  });

  it('reports a batch that breaks as a whole, and refetches', async () => {
    vi.mocked(marketplaceProviderOfferingsExportOffering).mockResolvedValue({
      data: { offering_name: 'A', export_data: { offering: { name: 'A' } } },
    } as any);
    vi.mocked(saveFile).mockImplementationOnce(() => {
      throw new Error('Disk is full.');
    });
    vi.mocked(useNotify().showErrorResponse).mockClear();
    const refetch = renderActions([offering('a', 'Active')]);
    await openMenu();
    await userEvent.click(menuItem('Export'));

    const [, props] = vi.mocked(useModal().openDialog).mock.calls.at(-1);
    await (props as any).resolve.onExport({});

    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      new Error('Disk is full.'),
      'Unable to save the export archive.',
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('leaves archived offerings out of a group change', async () => {
    renderActions([offering('a', 'Active'), offering('b', 'Archived')]);
    await openMenu();
    await userEvent.click(menuItem('Set offering group'));

    const [, props] = vi.mocked(useModal().openDialog).mock.calls.at(-1);
    expect((props as any).resolve.offerings.map((row) => row.uuid)).toEqual([
      'a',
    ]);
    expect((props as any).resolve.skippedNote).toBe(
      '1 selected offering(s) are skipped: archived offerings cannot be updated.',
    );
  });

  it('cannot change the group when only archived offerings are selected', async () => {
    renderActions([offering('b', 'Archived')]);
    await openMenu();

    expect(menuItem('Set offering group')).toHaveAttribute('data-disabled');
    expect(menuItem('Set offering group')).toHaveAccessibleDescription(
      'Archived offerings cannot be updated.',
    );
  });

  it('warns before setting offerings as down that their resources are blocked', async () => {
    renderActions([offering('a', 'Active')]);
    await openMenu();
    await userEvent.click(menuItem('Set as down'));

    const [, body] = vi.mocked(useModal().confirm).mock.calls.at(-1);
    expect((body as any).props.warning).toBe(
      'All operations on the resources of these offerings will be blocked until the offerings are restored.',
    );
  });

  it('selects a failed offering again as it is now, not as it was listed', async () => {
    vi.mocked(marketplaceProviderOfferingsArchive).mockReset();
    vi.mocked(marketplaceProviderOfferingsArchive).mockRejectedValue(
      new Error('Offering state is invalid.'),
    );
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValueOnce({
      data: { uuid: 'a', state: 'Paused' },
    } as any);
    const rows = [offering('a', 'Active')];
    renderActions(rows);
    await openMenu();
    await userEvent.click(menuItem('Archive'));

    await waitFor(() => expect(dispatch).toHaveBeenCalled());
    expect(dispatch).toHaveBeenCalledWith(
      selectRow(TABLE, { ...rows[0], state: 'Paused' }),
    );
  });

  it('does not activate a draft without plans, and names it', async () => {
    vi.mocked(marketplaceProviderOfferingsActivate).mockReset();
    vi.mocked(marketplaceProviderOfferingsActivate).mockResolvedValue(
      {} as any,
    );
    const rows = [
      offering('ready', 'Draft'),
      offering('empty', 'Draft', { plans: [] }),
    ];
    renderActions(rows);
    await openMenu();
    await userEvent.click(menuItem('Activate'));

    await waitFor(() => expect(show).toHaveBeenCalled());
    expect(marketplaceProviderOfferingsActivate).toHaveBeenCalledTimes(1);
    expect(marketplaceProviderOfferingsActivate).toHaveBeenCalledWith({
      path: { uuid: 'ready' },
    });
    expect(dispatch).toHaveBeenCalledWith(selectRow(TABLE, rows[1]));
  });

  it('sends nothing when the confirmation is dismissed', async () => {
    vi.mocked(marketplaceProviderOfferingsArchive).mockReset();
    vi.mocked(useModal().confirm).mockRejectedValue(undefined);
    renderActions([offering('a', 'Active')]);
    await openMenu();
    await userEvent.click(menuItem('Archive'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    expect(marketplaceProviderOfferingsArchive).not.toHaveBeenCalled();
  });
});
