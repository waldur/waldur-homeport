import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import { useEffect } from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OfferingAddScreenshotButton } from '@waldur/marketplace/offerings/actions/OfferingAddScreenshotButton';
import { OfferingHeader } from '@waldur/marketplace/offerings/details/OfferingHeader';
import { OfferingScreenshotsList } from '@waldur/marketplace/offerings/OfferingScreenshotsList';
import { loadOfferingStart } from '@waldur/marketplace/offerings/store/actions';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { Offering } from '@waldur/marketplace/types';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';

const getBreadcrumbs = (offering: Offering): BreadcrumbItem[] => {
  return [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
    },
    offering.shared
      ? {
          label: translate('Public offerings'),
          state: 'marketplace-vendor-offerings',
        }
      : {
          label: translate('My offerings'),
          state: 'marketplace-my-offerings',
        },
    {
      label: offering.name,
    },
  ];
};

let OfferingScreenshotsContainer = (props) => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  useEffect(() => {
    if (offering_uuid) {
      props.loadOffering(offering_uuid);
    }
  }, [offering_uuid]);

  useBreadcrumbsFn(
    () => (props.offering ? getBreadcrumbs(props.offering) : []),
    [props.offering],
  );

  useTitle(
    props.offering
      ? translate('Offering screenshots ({name})', {
          name: props.offering.name,
        })
      : translate('Offering screenshots'),
  );

  if (!(props.offering.name && offering_uuid)) {
    return <LoadingSpinner />;
  } else if (props.offering.name) {
    const offering = props.offering;
    return (
      <>
        <Row>
          <Col lg={12}>
            <OfferingHeader offering={offering} hideName={false} />
          </Col>
        </Row>

        <OfferingAddScreenshotButton offering={offering} />

        <OfferingScreenshotsList />
      </>
    );
  }
  return null;
};

const mapStateToProps = (state) => ({
  offering: getOffering(state).offering,
});

const mapDispatchToProps = (dispatch) => ({
  loadOffering: (offeringUuid) => dispatch(loadOfferingStart(offeringUuid)),
});

OfferingScreenshotsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OfferingScreenshotsContainer);

export { OfferingScreenshotsContainer };
