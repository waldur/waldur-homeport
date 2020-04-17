import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { ngInjector } from '@waldur/core/services';

export const NestedListActions = ({ resource, tab }) => {
  const [actions, setActions] = React.useState({});
  const controller = {
    handleActionException: () => {
      console.log('handleActionException');
    },
    reInitResource: () => {
      console.log('reInitResource');
    },
  };

  const actionUtilsService = ngInjector.get('actionUtilsService');

  useEffectOnce(() => {
    actionUtilsService
      .loadNestedActions(controller, resource, tab)
      .then(setActions);
  });

  return (
    <>
      {Object.keys(actions).map(key => (
        <Button
          bsSize="sm"
          disabled={actions[key].disabled}
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
