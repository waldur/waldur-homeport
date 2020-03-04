import { IAugmentedJQuery, IComponentOptions } from 'angular';
import { fromPairs } from 'lodash';
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import NgComponent from './ngcomponent';

/**
 * Wraps a React component in Angular. Returns a new Angular component.
 *
 * Usage:
 *
 *   ```ts
 *   type Props = { foo: number }
 *   class ReactComponent extends React.Component<Props, S> {}
 *   const AngularComponent = react2angular(ReactComponent, ['foo'])
 *   ```
 */
export function react2angular<Props>(
  Class: React.ComponentClass<Props> | React.FC<Props>,
  bindingNames: Array<keyof Props> | null = null,
  injectNames: string[] = [],
): IComponentOptions {
  const names =
    bindingNames ||
    (Class.propTypes && (Object.keys(Class.propTypes) as Array<keyof Props>)) ||
    [];

  return {
    bindings: fromPairs(names.map(_ => [_, '<'])),
    controller: [
      '$element',
      ...injectNames,
      class extends NgComponent<Props> {
        static get $$ngIsClass() {
          return true;
        }
        isDestroyed = false;
        injectedProps: { [name: string]: any };
        constructor(
          private $element: IAugmentedJQuery,
          ...injectedProps: any[]
        ) {
          super();
          this.injectedProps = {};
          injectNames.forEach((name, i) => {
            this.injectedProps[name] = injectedProps[i];
          });
        }
        render() {
          if (
            names.length > 0 &&
            names.every(k => this.props[k] === undefined)
          ) {
            return null;
          }
          if (!this.isDestroyed) {
            render(
              <Class {...this.props} {...(this.injectedProps as any)} />,
              this.$element[0],
            );
          }
        }
        componentWillUnmount() {
          this.isDestroyed = true;
          unmountComponentAtNode(this.$element[0]);
        }
      },
    ],
  };
}
