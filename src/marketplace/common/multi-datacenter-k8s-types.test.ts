import { describe, expect, it } from 'vitest';

import {
  createDefaultClusterConfig,
  validateMultiDatacenterConfiguration,
} from './multi-datacenter-k8s-types';

describe('createDefaultClusterConfig', () => {
  it('preselects the first version the offering advertises', () => {
    const config = createDefaultClusterConfig('1-datacenter', {
      available_kubernetes_versions: '1.30.0, 1.31.0',
    });

    expect(config.kubernetes_version).toBe('1.30.0');
  });

  it('leaves the version unset when the offering advertises none', () => {
    // A hardcoded fallback would leave the select showing its placeholder (the
    // value is not among its options) while the form silently holds a version
    // the offering does not support.
    const config = createDefaultClusterConfig('1-datacenter');

    expect(config.kubernetes_version).toBe('');
    expect(validateMultiDatacenterConfiguration(config)).toContain(
      'Kubernetes version must be selected',
    );
  });

  it('creates one datacenter per topology slot', () => {
    expect(createDefaultClusterConfig('1-datacenter').datacenters).toHaveLength(
      1,
    );
    expect(createDefaultClusterConfig('3-datacenter').datacenters).toHaveLength(
      3,
    );
  });
});
