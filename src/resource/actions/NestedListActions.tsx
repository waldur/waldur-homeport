import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import useAsync from 'react-use/lib/useAsync';

import { ngInjector } from '@waldur/core/services';

export const NestedListActions = ({ resource, tab }) => {
  const controller = {
    handleActionException: () => {
      // eslint-disable-next-line no-console
      console.log('handleActionException');
    },
    reInitResource: () => {
      // eslint-disable-next-line no-console
      console.log('reInitResource');
    },
  };

  const { value: actions } = useAsync(
    () =>
      ngInjector
        .get('actionUtilsService')
        .loadNestedActions(controller, resource, tab),
    [],
  );

  if (!actions) {
    return null;
  }

  return (
    <>
      {Object.keys(actions).map(key => (
        <Button
          bsSize="sm"
          disabled={actions[key].disabled}
          title={actions[key].titleAttr}
          key={key}
          onClick={() => actions[key].callback()}
        >
          {actions[key].iconClass ? (
            <>
              <i className={actions[key].iconClass}></i>{' '}
            </>
          ) : null}
          {actions[key].title}
        </Button>
      ))}
    </>
  );
};
