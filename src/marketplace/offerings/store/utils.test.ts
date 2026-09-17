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
