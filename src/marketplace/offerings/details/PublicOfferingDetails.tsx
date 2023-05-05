import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { PublicOfferingAccounting } from './PublicOfferingAccounting';
import { PublicOfferingComponents } from './PublicOfferingComponents';
import { PublicOfferingDetailsHero } from './PublicOfferingDetailsHero';
import { PublicOfferingDocumentation } from './PublicOfferingDocumentation';
import { PublicOfferingFacility } from './PublicOfferingFacility';
import { PublicOfferingFAQ } from './PublicOfferingFAQ';
import { PublicOfferingGetHelp } from './PublicOfferingGetHelp';
import { PublicOfferingGettingStarted } from './PublicOfferingGettingStarted';
import { PublicOfferingImageGallery } from './PublicOfferingImageGallery';
import { PublicOfferingImages } from './PublicOfferingImages';
import { PublicOfferingInfo } from './PublicOfferingInfo';
import { PublicOfferingIntegration } from './PublicOfferingIntegration';
import { PublicOfferingMetadata } from './PublicOfferingMetadata';
import { PublicOfferingPricing } from './PublicOfferingPricing';
import { PublicOfferingReviews } from './PublicOfferingReviews';
import { PublicOfferingSupport } from './PublicOfferingSupport';
import { PublicOfferingWelcome } from './PublicOfferingWelcome';

interface PublicOfferingDetailsProps {
  offering: Offering;
  category: Category;
  refreshOffering;
}

export const PublicOfferingDetails: FunctionComponent<PublicOfferingDetailsProps> =
  ({ offering, category }) => {
    const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
    const canDeploy = useMemo(() => offering.state === 'Active', [offering]);

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
      <div className="publicOfferingDetails m-b" id="general">
        <PublicOfferingWelcome offering={offering} />
        <PublicOfferingDetailsHero offering={offering} category={category} />
        <Row>
          <Col sm={12} md={6} className="mb-6">
            <PublicOfferingAccounting offering={offering} />
          </Col>
          <Col sm={12} md={6} className="mb-6">
            <PublicOfferingIntegration offering={offering} />
          </Col>
          <Col sm={12} md={6} className="mb-6">
            <PublicOfferingSupport offering={offering} />
          </Col>
          <Col sm={12} md={6} className="mb-6">
            <PublicOfferingMetadata offering={offering} />
          </Col>
          <Col sm={12} md={6} className="mb-6">
            <PublicOfferingDocumentation offering={offering} />
          </Col>
          <Col sm={12} md={6} className="mb-6">
            {showExperimentalUiComponents && <PublicOfferingFAQ />}
          </Col>
          <Col sm={12} md={6} className="mb-6">
            {showExperimentalUiComponents && (
              <PublicOfferingImageGallery offering={offering} />
            )}
          </Col>
          <Col sm={12} md={6} className="mb-6">
            {showExperimentalUiComponents && <PublicOfferingReviews />}
          </Col>
        </Row>
        {/* TODO: remove this later */}
        {false && (
          <div>
            <PublicOfferingInfo offering={offering} category={category} />
            <PublicOfferingComponents offering={offering} />
            {showExperimentalUiComponents && (
              <PublicOfferingImages offering={offering} />
            )}
            {showExperimentalUiComponents && (
              <PublicOfferingGettingStarted offering={offering} />
            )}
            {showExperimentalUiComponents && <PublicOfferingFAQ />}
            {showExperimentalUiComponents && <PublicOfferingReviews />}
            <PublicOfferingPricing offering={offering} canDeploy={canDeploy} />
            {showExperimentalUiComponents && (
              <PublicOfferingFacility offering={offering} />
            )}
            {showExperimentalUiComponents && <PublicOfferingGetHelp />}
          </div>
        )}
      </div>
    );
  };
