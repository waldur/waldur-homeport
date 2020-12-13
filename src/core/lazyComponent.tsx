import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import Loadable, { LoadingComponentProps } from 'react-loadable';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

export type ImportStatement = () => Promise<any>;

const RetryButton = ({ retry }) => (
  <FormControl componentClass="button" onClick={retry}>
    Retry
  </FormControl>
);

const LoadingComponent: FC<LoadingComponentProps> = (props) => {
  if (props.error) {
    // When the loader has errored
    return (
      <div>
        Error! <RetryButton retry={props.retry} />
      </div>
    );
  } else if (props.timedOut) {
    // When the loader has taken longer than the timeout
    return (
      <div>
        Taking a long time... <RetryButton retry={props.retry} />
      </div>
    );
  } else if (props.pastDelay) {
    // When the loader has taken longer than the delay
    return <LoadingSpinner />;
  } else {
    // When the loader has just started
    return null;
  }
};

export function lazyComponent<Props = any>(
  importStatement: ImportStatement,
  componentName = 'default',
) {
  return Loadable<Props, object>({
    loader: importStatement,
    render(loaded, props) {
      const Component = loaded[componentName];
      return <Component {...props} />;
    },
    loading: LoadingComponent,
    delay: 300,
    timeout: 10000,
  });
}
