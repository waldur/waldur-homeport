import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getFormComponent } from '@waldur/marketplace/common/registry';
import { openModalDialog } from '@waldur/modal/actions';

import { Offering } from '../types';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

interface PreviewOfferingButtonProps {
  offering: Offering;
}

export const PreviewOfferingButton = (props: PreviewOfferingButtonProps) => {
  const dispatch = useDispatch();
  const FormComponent = getFormComponent(props.offering.type);
  if (!FormComponent) {
    return null;
  }
  const callback = () =>
    dispatch(
      openModalDialog(PreviewOfferingDialog, {
        resolve: props,
        size: 'lg',
      }),
    );
  return (
    <Button className="ms-2" size="sm" variant="light" onClick={callback}>
      <i className="fa fa-eye" /> {translate('Preview')}
    </Button>
  );
};
