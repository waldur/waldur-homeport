import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, FormSpy } from 'react-final-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackVolumeTypesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { FormAbstractVolumeFields } from './FormAbstractVolumeFields';

const VOLUME_TYPE = {
  url: 'https://example.com/api/openstack-volume-types/ssd/',
  uuid: 'ssd',
  name: 'ssd',
};

// Tenant quotas are what the public offering exposes: a fixed-storage offering
// tracks the single 'storage' component, a dynamic one a gigabytes_<type> per
// volume type. Sizes of the former are in MB, of the latter in GB.
const STORAGE_QUOTA = { name: 'storage', limit: 102400, usage: 51200 };
const VOLUME_TYPE_QUOTA = { name: 'gigabytes_ssd', limit: 100, usage: 50 };

const renderFields = (quotas: any[]) => {
  return renderWithProviders(
    <Form
      onSubmit={vi.fn()}
      subscription={{ values: true }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FormAbstractVolumeFields
            id="step-volume"
            offering={
              {
                uuid: 'offering-1',
                scope_uuid: 'tenant-1',
                quotas,
              } as any
            }
            typeField="system_volume_type"
            sizeField="system_volume_size"
            typeTitle="System volume type"
            sizeTitle="System volume size"
          />
        </form>
      )}
    />,
  );
};

// The quota only switches once a type is in the form, and the single choice is
// applied on its own after the types have loaded.
const selectedVolumeType = () =>
  waitFor(() => expect(screen.getByText(VOLUME_TYPE.name)).toBeTruthy());

describe('FormAbstractVolumeFields', () => {
  beforeEach(() => {
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE]),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('keeps the common storage quota on screen once a volume type is picked', async () => {
    renderFields([STORAGE_QUOTA]);

    // The only volume type is selected automatically; with a single storage
    // component there is no gigabytes_ssd quota to switch to, and the common
    // one applies to every type.
    await selectedVolumeType();
    expect(screen.getByText('Storage')).toBeTruthy();
    expect(screen.getByText('50 GB of 100 GB used')).toBeTruthy();
  });

  it('keeps the common storage quota when the volume type quota is unlimited', async () => {
    // Cinder leaves a per-type quota at -1 unless it is set, and the backend
    // passes that through; the aggregate limit is the one being enforced.
    renderFields([STORAGE_QUOTA, { ...VOLUME_TYPE_QUOTA, limit: -1 }]);

    await selectedVolumeType();
    expect(screen.getByText('Storage')).toBeTruthy();
    expect(screen.getByText('50 GB of 100 GB used')).toBeTruthy();
  });

  it('shows no quota when neither the volume type nor the offering has a limit', async () => {
    // getQuotas always synthesizes a 'storage' entry, with an undefined limit
    // when the offering has no such quota -- falling back to it would draw a
    // bar with nothing to measure against.
    renderFields([{ name: 'gigabytes_hdd', limit: 100, usage: 50 }]);

    await selectedVolumeType();
    expect(screen.queryByText('Storage')).toBeNull();
    expect(screen.queryByText('Gigabytes hdd')).toBeNull();
    expect(screen.queryByText(/of \? used/)).toBeNull();
  });

  it('shows the quota of the selected volume type when the offering has one', async () => {
    renderFields([STORAGE_QUOTA, VOLUME_TYPE_QUOTA]);

    await selectedVolumeType();
    expect(screen.getByText('Gigabytes ssd')).toBeTruthy();
    expect(screen.getByText('50 of 100 used')).toBeTruthy();
    expect(screen.queryByText('Storage')).toBeNull();
  });
});

const SYSTEM_VOLUME = {
  typeField: 'system_volume_type',
  sizeField: 'system_volume_size',
};

const DATA_VOLUME = {
  typeField: 'data_volume_type',
  sizeField: 'data_volume_size',
};

const QUOTA_ERROR = 'Quota usage exceeds available limit.';

const HDD_VOLUME_TYPE = {
  url: 'https://example.com/api/openstack-volume-types/hdd/',
  uuid: 'hdd',
  name: 'hdd',
};

// The form keeps the formatted choice of a volume type, not the type itself.
const SSD = { label: 'ssd', value: VOLUME_TYPE.url, name: 'ssd' };
const HDD = { label: 'hdd', value: HDD_VOLUME_TYPE.url, name: 'hdd' };

// Renders the system and data volume of one instance order, the latter
// optional as in the order form, and exposes the form's values and validation
// errors -- the errors are only shown once a field is touched.
const renderInstanceVolumes = (
  quotas: any[],
  initialValues: Record<string, any>,
) => {
  const offering = {
    uuid: 'offering-1',
    scope_uuid: 'tenant-1',
    quotas,
  } as any;
  const errors: { current: Record<string, string> } = { current: {} };
  const values: { current: Record<string, any> } = { current: {} };
  renderWithProviders(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      subscription={{ values: true }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FormAbstractVolumeFields
            id="step-volume"
            offering={offering}
            {...SYSTEM_VOLUME}
            siblingVolumes={[DATA_VOLUME]}
            typeTitle="System volume type"
            sizeTitle="System volume size"
          />
          <FormAbstractVolumeFields
            id="step-volume"
            offering={offering}
            {...DATA_VOLUME}
            siblingVolumes={[SYSTEM_VOLUME]}
            optional
            typeTitle="Data volume type"
            sizeTitle="Data volume size"
          />
          <FormSpy
            subscription={{ errors: true, values: true }}
            onChange={(state) => {
              errors.current = state.errors;
              values.current = state.values;
            }}
          />
        </form>
      )}
    />,
  );
  return { errors, values };
};

// Sizes are kept in MB.
const GB = 1024;

// Both selects show their type once the volume types have loaded.
const loadedVolumeTypes = () =>
  waitFor(() => expect(screen.getAllByText(/^(ssd|hdd)$/)).toHaveLength(2));

describe('FormAbstractVolumeFields with sibling volumes', () => {
  beforeEach(() => {
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE]),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('rejects volumes that fit the common storage quota alone but not together', async () => {
    // 50 GB of the 100 GB storage quota are left: 30 GB each fit, 60 GB do not.
    const { errors } = renderInstanceVolumes([STORAGE_QUOTA], {
      system_volume_type: SSD,
      system_volume_size: 30 * GB,
      data_volume_type: SSD,
      data_volume_size: 30 * GB,
    });

    await waitFor(() =>
      expect(errors.current).toEqual({
        system_volume_size: QUOTA_ERROR,
        data_volume_size: QUOTA_ERROR,
      }),
    );
  });

  it('accepts volumes that fit the common storage quota together', async () => {
    const { errors } = renderInstanceVolumes([STORAGE_QUOTA], {
      system_volume_type: SSD,
      system_volume_size: 20 * GB,
      data_volume_type: SSD,
      data_volume_size: 30 * GB,
    });

    await loadedVolumeTypes();
    expect(errors.current).toEqual({});
  });

  it('adds up volumes of the same type against their own quota', async () => {
    const { errors } = renderInstanceVolumes(
      [STORAGE_QUOTA, VOLUME_TYPE_QUOTA],
      {
        system_volume_type: SSD,
        system_volume_size: 30 * GB,
        data_volume_type: SSD,
        data_volume_size: 30 * GB,
      },
    );

    await waitFor(() =>
      expect(errors.current).toEqual({
        system_volume_size: QUOTA_ERROR,
        data_volume_size: QUOTA_ERROR,
      }),
    );
  });

  it('does not count a volume that draws from another quota', async () => {
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE, HDD_VOLUME_TYPE]),
    );
    // Each type has 50 GB left of its own; 30 GB on each is within both, and
    // the common quota has room for the 60 GB together.
    const { errors } = renderInstanceVolumes(
      [
        { ...STORAGE_QUOTA, limit: 1024 * GB },
        VOLUME_TYPE_QUOTA,
        { name: 'gigabytes_hdd', limit: 100, usage: 50 },
      ],
      {
        system_volume_type: SSD,
        system_volume_size: 30 * GB,
        data_volume_type: HDD,
        data_volume_size: 30 * GB,
      },
    );

    await loadedVolumeTypes();
    expect(errors.current).toEqual({});
  });
});

describe('FormAbstractVolumeFields optional volume', () => {
  beforeEach(() => {
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE]),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('starts switched off when it has no size', async () => {
    renderInstanceVolumes([STORAGE_QUOTA], {
      system_volume_type: SSD,
      system_volume_size: 20 * GB,
    });

    await waitFor(() => expect(screen.getAllByText('ssd')).toHaveLength(2));
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(
      false,
    );
  });

  it('comes back switched on when the form already holds its size', async () => {
    // The toggle is local to the step, which mounts afresh whenever the user
    // returns to it, while the size stays in the form and would be ordered.
    renderInstanceVolumes([STORAGE_QUOTA], {
      system_volume_type: SSD,
      system_volume_size: 20 * GB,
      data_volume_type: SSD,
      data_volume_size: 30 * GB,
    });

    await loadedVolumeTypes();
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(
      true,
    );
  });

  it('drops its size from the order when switched off', async () => {
    const { errors, values } = renderInstanceVolumes([STORAGE_QUOTA], {
      system_volume_type: SSD,
      system_volume_size: 30 * GB,
      data_volume_type: SSD,
      data_volume_size: 30 * GB,
    });
    // The toggle moves next to the type once the types have loaded.
    await loadedVolumeTypes();
    expect(errors.current.system_volume_size).toBe(QUOTA_ERROR);

    await userEvent.click(screen.getByRole('checkbox'));

    // With the size gone the system volume fits the quota on its own again.
    await waitFor(() => expect(errors.current).toEqual({}));
    expect(values.current.data_volume_size).toBeUndefined();
    expect(values.current.system_volume_size).toBe(30 * GB);
  });

  it('leaves no error behind when switched off with no size', async () => {
    const { errors } = renderInstanceVolumes([STORAGE_QUOTA], {
      system_volume_type: SSD,
      system_volume_size: 20 * GB,
    });
    await waitFor(() => expect(screen.getAllByText('ssd')).toHaveLength(2));

    await userEvent.click(screen.getByRole('checkbox'));
    await waitFor(() =>
      expect(errors.current.data_volume_size).toBe('This field is required.'),
    );

    await userEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(errors.current).toEqual({}));
  });
});

describe('FormAbstractVolumeFields volume types', () => {
  const EXHAUSTED_SSD_QUOTA = { name: 'gigabytes_ssd', limit: 100, usage: 100 };
  const HDD_QUOTA = { name: 'gigabytes_hdd', limit: 100, usage: 0 };

  beforeEach(() => {
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE, HDD_VOLUME_TYPE]),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // The type select only appears once the types have loaded.
  const openTypeMenu = async () => {
    await userEvent.click(await screen.findByLabelText('System volume type'));
  };

  it('does not pick a type whose own quota is used up', async () => {
    // ssd comes first and would be the default.
    renderFields([EXHAUSTED_SSD_QUOTA, HDD_QUOTA]);

    await waitFor(() => expect(screen.getByText('hdd')).toBeTruthy());
    expect(screen.getByText('Gigabytes hdd')).toBeTruthy();
  });

  it('lists a type whose own quota is used up as unavailable', async () => {
    renderFields([EXHAUSTED_SSD_QUOTA, HDD_QUOTA]);
    await waitFor(() => expect(screen.getByText('hdd')).toBeTruthy());

    await openTypeMenu();

    const exhausted = await screen.findByRole('option', {
      name: 'ssd (quota exhausted)',
    });
    expect(exhausted.getAttribute('aria-disabled')).toBe('true');
    expect(
      screen.getByRole('option', { name: 'hdd' }).getAttribute('aria-disabled'),
    ).toBe('false');
  });

  it('picks no type when every type is used up', async () => {
    const { errors, values } = renderInstanceVolumes(
      [EXHAUSTED_SSD_QUOTA, { ...HDD_QUOTA, usage: 100 }],
      {},
    );

    await openTypeMenu();
    for (const name of ['ssd (quota exhausted)', 'hdd (quota exhausted)']) {
      expect(
        (await screen.findByRole('option', { name })).getAttribute(
          'aria-disabled',
        ),
      ).toBe('true');
    }
    expect(values.current.system_volume_type).toBeUndefined();
    expect(errors.current.system_volume_type).toBe('This field is required.');
  });

  it('rules out a type whose own quota is zero', async () => {
    renderFields([{ ...EXHAUSTED_SSD_QUOTA, limit: 0, usage: 0 }, HDD_QUOTA]);
    await waitFor(() => expect(screen.getByText('hdd')).toBeTruthy());

    await openTypeMenu();

    expect(
      (
        await screen.findByRole('option', { name: 'ssd (quota exhausted)' })
      ).getAttribute('aria-disabled'),
    ).toBe('true');
  });

  it('keeps a type that draws from the common quota available', async () => {
    // No per-type quotas: the full storage quota is the size field's concern.
    renderFields([{ ...STORAGE_QUOTA, usage: STORAGE_QUOTA.limit }]);

    await waitFor(() => expect(screen.getByText('ssd')).toBeTruthy());
    await openTypeMenu();

    expect(
      (await screen.findByRole('option', { name: 'hdd' })).getAttribute(
        'aria-disabled',
      ),
    ).toBe('false');
  });

  it('charges every volume to the common quota, whatever its type', async () => {
    // The ssd volume fits its own quota, the hdd one has none and draws from
    // the common quota -- which the ssd volume uses up as well.
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE, HDD_VOLUME_TYPE]),
    );
    const { errors } = renderInstanceVolumes(
      [
        { ...STORAGE_QUOTA, usage: 0 },
        { name: 'gigabytes_ssd', limit: 80, usage: 0 },
      ],
      {
        system_volume_type: SSD,
        system_volume_size: 80 * GB,
        data_volume_type: HDD,
        data_volume_size: 50 * GB,
      },
    );

    await waitFor(() =>
      expect(errors.current).toEqual({
        system_volume_size: QUOTA_ERROR,
        data_volume_size: QUOTA_ERROR,
      }),
    );
  });

  it('measures against the new type as soon as it is picked', async () => {
    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([VOLUME_TYPE, HDD_VOLUME_TYPE]),
    );
    const { errors } = renderInstanceVolumes(
      [
        { ...STORAGE_QUOTA, limit: 1024 * GB },
        { name: 'gigabytes_ssd', limit: 100, usage: 60 },
        { name: 'gigabytes_hdd', limit: 200, usage: 0 },
      ],
      { system_volume_type: SSD, system_volume_size: 60 * GB },
    );
    await waitFor(() =>
      expect(errors.current.system_volume_size).toBe(QUOTA_ERROR),
    );

    await userEvent.click(await screen.findByLabelText('System volume type'));
    await userEvent.click(await screen.findByRole('option', { name: 'hdd' }));

    await waitFor(() => expect(errors.current).toEqual({}));
  });
});
