import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { customerCreateDialog } from '@waldur/customer/create/actions';
import { canCreateOrganization } from '@waldur/customer/create/selectors';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import './EmptyOrganizationsPlaceholder.scss';

const InitialCreateOrganizationButton = () => {
  const dispatch = useDispatch();
  const enabled = useSelector(canCreateOrganization);
  if (!enabled) {
    return null;
  }
  return (
    <Button
      variant="primary"
      onClick={() => {
        dispatch(closeModalDialog());
        dispatch(customerCreateDialog());
      }}
    >
      {translate('Create organization')}
    </Button>
  );
};

export const EmptyOrganizationsPlaceholder: FunctionComponent = () => (
  <div className="middle-box text-center no-organization-modal">
    <div className="inner-container">
      <div className="circle rounded-circle border-dark">icon</div>
      <h3 className="mb-3">{translate('No organization')}.</h3>
      <p className="description mb-7">
        {translate(
          'You are not part of an organisation. Create an organization or request access from your organization administrator.',
        )}
      </p>
      <InitialCreateOrganizationButton />
    </div>
  </div>
);
