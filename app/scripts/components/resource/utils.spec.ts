import { formatFlavor } from './utils';

describe('formatFlavor', () => {
  it('renders flavor vCPU, memory and storage', () => {
    const flavor = {
      cores: 1,
      ram: 2 * 1024,
      disk: 1.29 * 1024 * 1024,
    };
    expect(formatFlavor(flavor)).toBe('1 vCPU, 2 GB RAM, 1.2 TB storage');
  });

  it('skips any flavor parameter if it is not specified or zero', () => {
    const flavor = {
      cores: 0,
      disk: 900 * 1024,
    };
    expect(formatFlavor(flavor)).toBe('900 GB storage');
  });

  it('accepts storage as disk but does not render it twice', () => {
    const flavor = {
      cores: 1,
      ram: 2 * 1024,
      disk: 1.29 * 1024 * 1024,
      storage: 1.29 * 1024 * 1024,
    };
    expect(formatFlavor(flavor)).toBe('1 vCPU, 2 GB RAM, 1.2 TB storage');
  });
});
