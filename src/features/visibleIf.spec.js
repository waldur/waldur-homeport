import visibleIfDirective from './visibleIf.js';

describe('VisibleIf directive', function() {
  beforeEach(
    angular.mock.module(($provide, $compileProvider) => {
      $provide.provider('features', {
        $get: () => ({
          isVisible: feature => feature !== 'resources',
        }),
      });
      $compileProvider.directive('visibleIf', visibleIfDirective);
    }),
  );

  let $compile, scope, element;
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    scope = _$rootScope_;
  }));

  const render = (
    directiveUsage = '<div><button visible-if="item.feature"></div>',
  ) => {
    element = $compile(directiveUsage)(scope);
    scope.$digest();
  };
  const isVisible = () => element[0].querySelectorAll('button').length > 0;

  it('hides element if feature is hidden', function() {
    scope.item = { feature: 'resources' };
    render();
    expect(isVisible()).toBe(false);
  });

  it('shows element if feature is not hidden', function() {
    scope.item = { feature: 'apps' };
    render();
    expect(isVisible()).toBe(true);
  });

  it('hides element if feature is constant string', function() {
    render('<div><button visible-if="\'resources\'"></div>');
    expect(isVisible()).toBe(false);
  });
});
