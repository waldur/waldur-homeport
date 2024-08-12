import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { RowEditButton } from '../RowEditButton';

import { EDIT_COMPONENT_FORM_ID } from './constants';

const EditComponentDialog = lazyComponent(
  () => import('./EditComponentDialog'),
  'EditComponentDialog',
);

export const EditComponentButton: FunctionComponent<{
  offering;
  component;
  refetch;
}> = ({ offering, component, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditComponentDialog, {
        resolve: { offering, component, refetch },
        formId: EDIT_COMPONENT_FORM_ID,
      }),
    );
  };
  return <RowEditButton onClick={callback} className="me-3" size="sm" />;
};
