import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import { useEffect } from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { OfferingAddScreenshotButton } from '@waldur/marketplace/offerings/actions/OfferingAddScreenshotButton';
import { OfferingHeader } from '@waldur/marketplace/offerings/details/OfferingHeader';
import { OfferingScreenshotsList } from '@waldur/marketplace/offerings/OfferingScreenshotsList';
import { loadOfferingStart } from '@waldur/marketplace/offerings/store/actions';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';

const setHeaderAndBreadcrumbsTitle = (name: string) => {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.activeItem = name;

  ngInjector.get('titleService').setTitle(name);
};

let OfferingScreenshotsContainer = props => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  useEffect(() => {
    if (offering_uuid) {
      props.loadOffering(offering_uuid);
    }
  }, [offering_uuid]);

  useEffect(() => {
    if (props.offering.name) {
      setHeaderAndBreadcrumbsTitle(
        translate(`Offering screenshots ({name})`, {
          name: props.offering.name,
        }),
      );
    }
  }, [props.offering]);

  if (!(props.offering.name && offering_uuid)) {
    return <LoadingSpinner />;
  } else if (props.offering.name) {
    const offering = props.offering;
    return (
      <React.Fragment>
        <Row>
          <Col lg={12}>
            <OfferingHeader offering={offering} hideName={false} />
          </Col>
        </Row>

        <OfferingAddScreenshotButton offering={offering} />

        <OfferingScreenshotsList />
      </React.Fragment>
    );
  }
  return null;
};

const mapStateToProps = state => ({
  offering: getOffering(state).offering,
});

const mapDispatchToProps = dispatch => ({
  loadOffering: offeringUuid => dispatch(loadOfferingStart(offeringUuid)),
});

OfferingScreenshotsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(OfferingScreenshotsContainer);

export { OfferingScreenshotsContainer };
