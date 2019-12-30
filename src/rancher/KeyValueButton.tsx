import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

export const KeyValueButton = props => {
  const dispatch = useDispatch();

  const showDetails = React.useCallback(() => {
    const resolve = {items: props.items};
    dispatch(openModalDialog('rancherKeyValueDialog', {resolve}));
  }, []);

  return (
    <Button onClick={showDetails} bsSize="sm" bsStyle="link">
      {translate('Show details')}
      {' '}
      <i className="fa fa-external-link"/>
    </Button>
  );
};
