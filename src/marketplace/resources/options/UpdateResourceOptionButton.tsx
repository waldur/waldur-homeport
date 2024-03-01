import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const UpdateResourceOptionDialog = lazyComponent(
  () => import('./UpdateResourceOptionDialog'),
  'UpdateResourceOptionDialog',
);

export const UpdateResourceOptionButton: FunctionComponent<{
  resource;
  option;
  refetch?;
}> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(UpdateResourceOptionDialog, {
        resolve: props,
      }),
    );
  };
  return (
    <Button onClick={callback} size="sm" className="me-3">
      <i className="fa fa-pencil" /> {translate('Edit')}
    </Button>
  );
};
