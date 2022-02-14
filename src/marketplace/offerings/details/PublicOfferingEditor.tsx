import { useState } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { FormLayoutContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { supportOfferingActionVisible } from '@waldur/marketplace/offerings/actions/utils';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import {
  getUser,
  isOwner as isOwnerSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { PageAccounting } from './PageAccounting';
import { PageConfirmationMessage } from './PageConfirmationMessage';
import { PageDescription } from './PageDescription';
import { PageHeroImage } from './PageHeroImage';
import { PageImages } from './PageImages';
import { PageLocation } from './PageLocation';
import { PageManagement } from './PageManagement';
import { PageOverview } from './PageOverview';
import { PagePolicies } from './PagePolicies';
import { SidebarNav, SidebarRow } from './SidebarNav';

require('./PublicOfferingEditor.css');

export const PublicOfferingEditor = ({ resolve }) => {
  const [page, setPage] = useState('nav');

  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);

  const Editor =
    page == 'nav' ? (
      <>
        <ModalHeader>
          <ModalTitle>{translate('Edit offering details')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <SidebarNav>
            <SidebarRow
              iconClass="fa fa-edit"
              title={translate('Overview')}
              description={translate(
                'Customize name, description and terms of service',
              )}
              onClick={() => setPage('overview')}
            />
            <SidebarRow
              iconClass="fa fa-bookmark"
              title={translate('Description')}
              description={translate(
                'Customize offering category and attributes',
              )}
              onClick={() => setPage('description')}
            />
            <SidebarRow
              iconClass="fa fa-wrench"
              title={translate('Management')}
              description={translate('Customize service settings')}
              onClick={() => setPage('management')}
            />
            <SidebarRow
              iconClass="fa fa-file-text-o"
              title={translate('Accounting')}
              description={translate('Customize plans and plan components')}
              onClick={() => setPage('accounting')}
            />
            <SidebarRow
              iconClass="fa fa-image"
              title={translate('Hero image')}
              description={translate('Set hero image')}
              onClick={() => setPage('hero_image')}
            />
            <SidebarRow
              iconClass="fa fa-location-arrow"
              title={translate('Location')}
              description={translate('Set location')}
              onClick={() => setPage('location')}
            />
            <SidebarRow
              iconClass="fa fa-ban"
              title={translate('Access policies')}
              description={translate('Set access policy')}
              onClick={() => setPage('policies')}
            />
            <SidebarRow
              iconClass="fa fa-upload"
              title={translate('Images')}
              description={translate('Upload images')}
              onClick={() => setPage('images')}
            />
            {supportOfferingActionVisible(
              resolve.offering,
              user,
              isOwner,
              isServiceManager,
            ) && (
              <SidebarRow
                iconClass="fa fa-commenting"
                title={translate('Confirmation message')}
                description={translate('Edit confirmation message')}
                onClick={() => setPage('confirmation-message')}
              />
            )}
          </SidebarNav>
        </ModalBody>
        <ModalFooter>
          <CloseDialogButton />
        </ModalFooter>
      </>
    ) : page == 'overview' ? (
      <PageOverview
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page === 'description' ? (
      <PageDescription
        offering={resolve.offering}
        category={resolve.category}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page == 'management' ? (
      <PageManagement
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page == 'hero_image' ? (
      <PageHeroImage
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page == 'accounting' ? (
      <PageAccounting
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page == 'location' ? (
      <PageLocation
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page == 'policies' ? (
      <PagePolicies
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : page == 'images' ? (
      <PageImages offering={resolve.offering} onReturn={() => setPage('nav')} />
    ) : page == 'confirmation-message' ? (
      <PageConfirmationMessage
        offering={resolve.offering}
        refreshOffering={resolve.refreshOffering}
        onReturn={() => setPage('nav')}
      />
    ) : null;

  if (!Editor) return null;

  return (
    <FormLayoutContext.Provider value={{ layout: 'vertical' }}>
      {Editor}
    </FormLayoutContext.Provider>
  );
};
