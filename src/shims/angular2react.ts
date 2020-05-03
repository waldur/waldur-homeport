import { IScope } from 'angular';
import kebabCase from 'lodash.kebabcase';
import * as React from 'react';

import { $rootScope, $compile } from '@waldur/core/services';

interface Scope<Props> extends IScope {
  props: Props;
}

export function angular2react<Props extends object>(
  componentName: string,
  componentBindings?: string[],
): React.FC<Props> {
  const Wrapper: React.FC<Props> = props => {
    const [didInitialCompile, setDidInitialCompile] = React.useState(false);

    // Initialize AngularJS component scope when ReactJS component is mounted
    const [scope, setScope] = React.useState<Scope<Props>>(() =>
      Object.assign($rootScope.$new(true), { props }),
    );

    const destroyScope = React.useCallback(() => {
      return () => {
        scope.$destroy();
      };
    }, [scope]);

    // Destroy AngularJS component scope when ReactJS component is unmounted
    React.useEffect(destroyScope, []);

    const updateProps = React.useCallback(() => {
      setScope(Object.assign(scope, { props }));
      try {
        scope.$digest();
      } catch (e) {
        // Suppress error
      }
    }, [scope, props]);

    // Update AngularJS component props when ReactJS props are updated
    React.useEffect(updateProps, [props]);

    // Map ReactJS props to AngularJS component props
    const bindings = React.useMemo(() => {
      const result = {};
      if (componentBindings) {
        for (const binding of componentBindings) {
          result[kebabCase(binding)] = `props.${binding}`;
        }
      }
      return result;
    }, []);

    const compile = (element: HTMLElement) => {
      if (didInitialCompile) {
        return;
      }

      $compile(element)(scope);
      try {
        scope.$digest();
      } catch (e) {
        // Suppress error
      }
      setDidInitialCompile(true);
    };

    return React.createElement(kebabCase(componentName), {
      ...bindings,
      ref: compile,
    });
  };
  Wrapper.displayName = componentName;
  return Wrapper;
}
