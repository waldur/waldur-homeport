// Based on https://github.com/coatue-oss/angular2react
import { IScope } from 'angular';
import kebabCase from 'lodash.kebabcase';
import * as React from 'react';

import { $rootScope, $compile } from '@waldur/core/services';

interface Scope<Props> extends IScope {
  props: Props;
}

interface State<Props> {
  didInitialCompile: boolean;
  scope?: Scope<Props>;
}

/**
 * Wraps an Angular component in React. Returns a new React component.
 *
 * Usage:
 *
 *   ```ts
 *   const Bar = { bindings: {...}, template: '...', ... }
 *
 *   angular
 *     .module('foo', [])
 *     .component('bar', Bar)
 *
 *   type Props = {
 *     onChange(value: number): void
 *   }
 *
 *   const Bar = angular2react<Props>('bar', Bar, $compile)
 *
 *   <Bar onChange={...} />
 *   ```
 */
export function angular2react<Props extends object>(
  componentName: string,
  componentBindings?: string[],
): React.ComponentClass<Props> {
  return class extends React.Component<Props, State<Props>> {
    state: State<Props> = {
      didInitialCompile: false,
    };

    static displayName = componentName;

    UNSAFE_componentWillMount() {
      this.setState({
        scope: Object.assign($rootScope.$new(true), {
          props: this.props,
        }),
      });
    }

    componentWillUnmount() {
      if (!this.state.scope) {
        return;
      }
      this.state.scope.$destroy();
    }

    shouldComponentUpdate(): boolean {
      return false;
    }

    // called only once to set up DOM, after componentWillMount
    render() {
      const bindings: { [key: string]: string } = {};
      if (componentBindings) {
        for (const binding of componentBindings) {
          bindings[kebabCase(binding)] = `props.${binding}`;
        }
      }
      return React.createElement(kebabCase(componentName), {
        ...bindings,
        ref: this.compile.bind(this),
      });
    }

    // makes angular aware of changed props
    // if we're not inside a digest cycle, kicks off a digest cycle before setting.
    UNSAFE_componentWillReceiveProps(props: Props) {
      if (!this.state.scope) {
        return;
      }
      this.setState({ scope: { ...this.state.scope, props } });
      this.digest();
    }

    private compile(element: HTMLElement) {
      if (this.state.didInitialCompile || !this.state.scope) {
        return;
      }

      $compile(element)(this.state.scope);
      this.digest();
      this.setState({ didInitialCompile: true });
    }

    private digest() {
      if (!this.state.scope) {
        return;
      }
      try {
        this.state.scope.$digest();
      } catch (e) {}
    }
  };
}
