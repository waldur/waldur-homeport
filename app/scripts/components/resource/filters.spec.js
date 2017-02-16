import coreFiltersModule from '../core/filters';
import resourceFiltersModule from './filters';

describe('Resource filters', () => {
  coreFiltersModule(angular.module('core.filters', []));
  resourceFiltersModule(angular.module('resource.filters', []));

  beforeEach(angular.mock.module('core.filters'));
  beforeEach(angular.mock.module('resource.filters'));

  describe('formatFlavor', () => {
    let formatFlavorFilter;
    beforeEach(inject(_formatFlavorFilter_ => {
      formatFlavorFilter = _formatFlavorFilter_;
    }));

    it('renders flavor vCPU, memory and storage', () => {
      const flavor = {
        cores: 1,
        ram: 2 * 1024,
        storage: 1.29 * 1024 * 1024,
      };
      expect(formatFlavorFilter(flavor)).toBe('1 vCPU, 2 GB RAM, 1.2 TB storage');
    });

    it('skips any flavor parameter if it is not specified or zero', () => {
      const flavor = {
        cores: 0,
        storage: 900 * 1024,
      };
      expect(formatFlavorFilter(flavor)).toBe('900 GB storage');
    });

  });
});
