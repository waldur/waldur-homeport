import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { EDIT_LEXIS_LINK_INTEGRATION_FORM_ID } from './constants';

const EditLexisLinkIntegrationDialog = lazyComponent(
  () => import('./EditLexisLinkIntegrationDialog'),
  'EditLexisLinkIntegrationDialog',
);

export const EditLexisLinkIntegrationButton: FunctionComponent<{
  offering;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditLexisLinkIntegrationDialog, {
        resolve: props,
        size: 'lg',
        formId: EDIT_LEXIS_LINK_INTEGRATION_FORM_ID,
      }),
    );
  };
  return (
    <Button onClick={callback} size="sm" variant="light" className="me-3">
      <i className="fa fa-pencil"></i>{' '}
      {translate('Edit LEXIS link integration options')}
    </Button>
  );
};
