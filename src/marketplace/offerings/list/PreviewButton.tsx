import { UISref } from '@uirouter/react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ACTIVE, PAUSED } from '../store/constants';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

export const PreviewButton = ({ offering }) => {
  const dispatch = useDispatch();
  return (
    <DropdownButton
      title={translate('Preview')}
      variant="light"
      size="sm"
      className="d-inline me-2"
    >
      <Dropdown.Item
        onClick={() => {
          dispatch(
            openModalDialog(PreviewOfferingDialog, {
              resolve: { offering },
              size: 'lg',
            }),
          );
        }}
      >
        {translate('Preview order form')}
      </Dropdown.Item>
      {[ACTIVE, PAUSED].includes(offering.state) && (
        <UISref
          to="public.marketplace-public-offering"
          params={{ uuid: offering.uuid }}
        >
          <Dropdown.Item>{translate('Open public page')}</Dropdown.Item>
        </UISref>
      )}
    </DropdownButton>
  );
};
