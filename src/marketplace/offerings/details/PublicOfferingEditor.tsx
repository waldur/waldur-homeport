import { useState } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { PageDescription } from './PageDescription';
import { PageHeroImage } from './PageHeroImage';
import { PageLocation } from './PageLocation';
import { PageOverview } from './PageOverview';
import { PagePolicies } from './PagePolicies';
import { SidebarNav, SidebarRow } from './SidebarNav';

require('./PublicOfferingEditor.css');

export const PublicOfferingEditor = ({ resolve }) => {
  const [page, setPage] = useState('nav');

  return page == 'nav' ? (
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
            onClick={() => alert('Not yet implemented.')}
          />
          <SidebarRow
            iconClass="fa fa-file-text-o"
            title={translate('Accounting')}
            description={translate('Customize plans and plan components')}
            onClick={() => alert('Not yet implemented.')}
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
  ) : page == 'hero_image' ? (
    <PageHeroImage
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
  ) : null;
};
