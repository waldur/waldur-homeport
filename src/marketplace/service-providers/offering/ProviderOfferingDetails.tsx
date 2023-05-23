import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { ProviderOfferingAccounting } from './ProviderOfferingAccounting';
import { ProviderOfferingDetailsHero } from './ProviderOfferingDetailsHero';
import { ProviderOfferingDocumentation } from './ProviderOfferingDocumentation';
import { ProviderOfferingFAQ } from './ProviderOfferingFAQ';
import { ProviderOfferingImageGallery } from './ProviderOfferingImageGallery';
import { ProviderOfferingIntegration } from './ProviderOfferingIntegration';
import { ProviderOfferingMetadata } from './ProviderOfferingMetadata';
import { ProviderOfferingReviews } from './ProviderOfferingReviews';
import { ProviderOfferingSupport } from './ProviderOfferingSupport';
import { ProviderOfferingWelcome } from './ProviderOfferingWelcome';

interface ProviderOfferingDetailsProps {
  offering: Offering;
  category: Category;
  refreshOffering;
}

export const ProviderOfferingDetails: FunctionComponent<ProviderOfferingDetailsProps> =
  ({ offering, category }) => {
    const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

    usePermissionView(() => {
      switch (offering.state) {
        case 'Paused':
          return {
            permission: 'limited',
            banner: {
              title: translate('Paused'),
              message: translate(
                'This offering has been paused and new resources cannot be added at the moment.',
              ),
            },
          };
        case 'Draft':
          return {
            permission: 'limited',
            banner: {
              title: translate('Draft'),
              message: translate(
                'This offering has not been activated by the operator yet.',
              ),
            },
          };
        case 'Archived':
          return {
            permission: 'limited',
            banner: {
              title: translate('Archived'),
              message: translate('This offering has been archived.'),
            },
          };

        default:
          return null;
      }
    }, [offering]);

    return (
      <div className="ProviderOfferingDetails m-b" id="general">
        <ProviderOfferingWelcome offering={offering} />
        <ProviderOfferingDetailsHero offering={offering} category={category} />
        <Row>
          <Col xs={12} className="mb-6">
            <ProviderOfferingAccounting offering={offering} />
          </Col>
          <Col xs={12} className="mb-6">
            <ProviderOfferingIntegration offering={offering} />
          </Col>
          <Col xs={12} className="mb-6">
            {showExperimentalUiComponents && (
              <ProviderOfferingSupport offering={offering} />
            )}
          </Col>
          <Col xs={12} className="mb-6">
            <ProviderOfferingMetadata offering={offering} />
          </Col>
          <Col xs={12} className="mb-6">
            {showExperimentalUiComponents && (
              <ProviderOfferingDocumentation offering={offering} />
            )}
          </Col>
          <Col xs={12} className="mb-6">
            {showExperimentalUiComponents && <ProviderOfferingFAQ />}
          </Col>
          <Col xs={12} className="mb-6">
            {showExperimentalUiComponents && (
              <ProviderOfferingImageGallery offering={offering} />
            )}
          </Col>
          <Col xs={12} className="mb-6">
            {showExperimentalUiComponents && <ProviderOfferingReviews />}
          </Col>
        </Row>
      </div>
    );
  };
