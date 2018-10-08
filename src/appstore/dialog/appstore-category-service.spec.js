import ENV from '../../configs/base-config';
import AppstoreCategoriesService from './appstore-category-service.js';

describe('AppstoreCategoriesService', () => {
  let service, $rootScope, $q;
  beforeEach(inject((_$q_, _$rootScope_) => {
    $rootScope = _$rootScope_;
    $q = _$q_;
    service = new AppstoreCategoriesService($q, ENV);
  }));

  it('formats default categories', () => {
    let groups;
    service.getGroups().then(result => groups = result);
    $rootScope.$apply();
    expect(groups).toEqual([{
      label: ENV.defaultGroup,
      items: ENV.defaultCategories,
    }]);
  });

  it('allows to register custom categories via callables which return promise', () => {
    service.registerCategory(() => {
      return $q.when([
        {
          key: 'custom-vpc',
          category: 'Custom requests',
          label: 'Custom Virtual Private Cloud',
        },
        {
          key: 'custom-vm',
          category: 'Custom requests',
          label: 'Custom Virtual Machine',
        }
      ]);
    });

    let groups;
    service.getGroups().then(result => groups = result);
    $rootScope.$apply();
    expect(groups).toEqual([
      {
        label: ENV.defaultGroup,
        items: ENV.defaultCategories,
      },
      {
        label: 'Custom requests',
        items: [
          {
            key: 'custom-vpc',
            category: 'Custom requests',
            label: 'Custom Virtual Private Cloud',
          },
          {
            key: 'custom-vm',
            category: 'Custom requests',
            label: 'Custom Virtual Machine',
          }
        ]
      }
    ]);
  });
});
