import { formatFlavor } from './utils';

describe('formatFlavor', () => {
  it('renders flavor vCPU, memory and storage', () => {
    const flavor = {
      cores: 1,
      ram: 2 * 1024,
    };
    expect(formatFlavor(flavor)).toBe('1 vCPU, 2 GB RAM');
  });

  it('skips any flavor parameter if it is not specified or zero', () => {
    const flavor = {
      cores: 0,
    };
    expect(formatFlavor(flavor)).toBe('');
  });

  it('accepts storage as disk but does not render it twice', () => {
    const flavor = {
      cores: 1,
      ram: 2 * 1024,
      storage: 1.29 * 1024 * 1024,
    };
    expect(formatFlavor(flavor)).toBe('1 vCPU, 2 GB RAM');
  });

  it('renders volume type quotas if they are defined', () => {
    const flavor = {
      cores: 1,
      ram: 2 * 1024,
      gigabytes_ssd: 100,
      gigabytes_gpfs: 300,
    };
    expect(formatFlavor(flavor)).toBe('1 vCPU, 2 GB RAM');
  });

  it('skips zero volume type quotas', () => {
    const flavor = {
      cores: 1,
      ram: 2 * 1024,
      gigabytes_ssd: 0,
      gigabytes_gpfs: 300,
    };
    expect(formatFlavor(flavor)).toBe('1 vCPU, 2 GB RAM');
  });
});
