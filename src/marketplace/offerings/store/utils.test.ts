import { describe, expect, it } from 'vitest';

import { formatOption } from './utils';

describe('formatOption', () => {
  it.each(['single_datacenter_k8s_config', 'multi_datacenter_k8s_config'])(
    'drops cleared Kubernetes settings from a %s option',
    (type) => {
      const item = formatOption({
        name: 'cluster',
        label: 'Cluster',
        type: { value: type, label: type },
        default_configs: {
          topology_mode: undefined,
          load_balancer_mode: null,
          available_kubernetes_versions: '1.30.0',
        },
      } as any);

      expect(item.default_configs).toEqual({
        available_kubernetes_versions: '1.30.0',
      });
      expect(JSON.parse(JSON.stringify(item)).default_configs).toEqual({
        available_kubernetes_versions: '1.30.0',
      });
    },
  );

  it('keeps a selected topology mode', () => {
    const item = formatOption({
      name: 'cluster',
      label: 'Cluster',
      type: { value: 'single_datacenter_k8s_config', label: '' },
      default_configs: { topology_mode: 'customer_choice' },
    } as any);

    expect(item.default_configs).toEqual({ topology_mode: 'customer_choice' });
  });
});

describe('formatOption visible_if', () => {
  const base: any = {
    name: 'account',
    label: 'Account',
    type: { value: 'select_string' },
    choices: 'own, new',
  };

  it('keeps a complete rule', () => {
    expect(
      formatOption({
        ...base,
        visible_if: { field: 'backups', values: [true] },
      }).visible_if,
    ).toEqual({ field: 'backups', values: [true] });
  });

  it('drops a removed or unfinished rule', () => {
    expect(formatOption(base)).not.toHaveProperty('visible_if');
    expect(
      formatOption({ ...base, visible_if: { field: 'backups', values: [] } }),
    ).not.toHaveProperty('visible_if');
    expect(
      formatOption({ ...base, visible_if: { values: [true] } }),
    ).not.toHaveProperty('visible_if');
  });
});

describe('formatOption unique', () => {
  const base = {
    name: 'bucket',
    label: 'Bucket',
    type: { value: 'string', label: 'String' },
  } as any;

  it('keeps the flag on a supported type', () => {
    expect(formatOption({ ...base, unique: true }).unique).toBe(true);
  });

  it('leaves out an unticked flag', () => {
    expect(formatOption({ ...base, unique: false })).not.toHaveProperty(
      'unique',
    );
  });

  it('drops a flag left behind by a type change', () => {
    expect(
      formatOption({
        ...base,
        type: { value: 'boolean', label: 'Boolean' },
        unique: true,
      }),
    ).not.toHaveProperty('unique');
  });
});

describe('formatOption pattern', () => {
  const base = {
    name: 'slug',
    label: 'Slug',
    type: { value: 'string', label: 'String' },
  } as any;

  it('keeps the pattern and its message', () => {
    const item = formatOption({
      ...base,
      pattern: '[a-z]+',
      pattern_error: 'Letters only',
    });
    expect(item.pattern).toBe('[a-z]+');
    expect(item.pattern_error).toBe('Letters only');
  });

  it('drops an empty pattern and a message without a pattern', () => {
    const item = formatOption({ ...base, pattern: '', pattern_error: 'x' });
    expect(item).not.toHaveProperty('pattern');
    expect(item).not.toHaveProperty('pattern_error');
  });

  it('drops an empty message', () => {
    const item = formatOption({
      ...base,
      pattern: '[a-z]+',
      pattern_error: '',
    });
    expect(item).not.toHaveProperty('pattern_error');
  });

  it('drops a pattern left behind by a type change', () => {
    const item = formatOption({
      ...base,
      type: { value: 'integer', label: 'Integer' },
      pattern: '[a-z]+',
    });
    expect(item).not.toHaveProperty('pattern');
  });
});

describe('formatOption display_limit_config', () => {
  const base = {
    name: 'inode_quota',
    label: 'Inode quota',
    type: { value: 'integer', label: 'Integer' },
  } as any;

  it('keeps the component an integer option is shown as the limit of', () => {
    expect(
      formatOption({
        ...base,
        display_limit_config: { component_type: 'inodes' },
      }).display_limit_config,
    ).toEqual({ component_type: 'inodes' });
  });

  it.each([undefined, {}, { component_type: null }, { component_type: '' }])(
    'leaves out a cleared component (%j)',
    (display_limit_config) => {
      expect(
        formatOption({ ...base, display_limit_config }),
      ).not.toHaveProperty('display_limit_config');
    },
  );

  it('drops a component left behind by a type change', () => {
    expect(
      formatOption({
        ...base,
        type: { value: 'string', label: 'String' },
        display_limit_config: { component_type: 'inodes' },
      }),
    ).not.toHaveProperty('display_limit_config');
  });
});
