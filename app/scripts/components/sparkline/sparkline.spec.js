import sparklineDirective from './sparkline';

describe('Sparkline directive', function() {

  angular.module('test', []).component('sparkline', sparklineDirective);
  beforeEach(angular.mock.module('test'));

  let $compile, scope, element;
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    scope = _$rootScope_;
  }));

  const directiveUsage = '<sparkline spark-data="items"></sparkline>';
  const render = () => {
    element = $compile(directiveUsage)(scope);
    scope.$digest();
  };
  const getColumns = () => element[0].querySelectorAll('.sparkline-column');
  const getBars = () => element[0].querySelectorAll('.sparkline-bar');

  it('renders empty figure if list is empty', function() {
    scope.items = [];
    render();
    expect(getColumns().length).toBe(0);
  });

  it('renders two columns with proportional height', function() {
    scope.items = [
      {
        value: 1,
        label: 'January'
      },
      {
        value: 2,
        label: 'February'
      }
    ];
    render();
    expect(getColumns().length).toBe(2);
    expect(getBars()[0].getAttribute('style')).toBe('height: 50%;');
    expect(getBars()[1].getAttribute('style')).toBe('height: 100%;');
  });
});
