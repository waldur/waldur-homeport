import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OfferingHeader } from '@waldur/marketplace/offerings/details/OfferingHeader';
import { loadOfferingStart } from '@waldur/marketplace/offerings/store/actions';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { Offering } from '@waldur/marketplace/types';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';

import { CreateScreenshotButton } from './CreateScreenshotButton';
import { OfferingScreenshotsList } from './OfferingScreenshotsList';

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

export const ScreenshotsContainer: FunctionComponent = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const dispatch = useDispatch();

  useEffect(() => {
    if (offering_uuid) {
      dispatch(loadOfferingStart(offering_uuid));
    }
  }, [dispatch, offering_uuid]);

  const offering = useSelector(
    (state: RootState) => getOffering(state).offering,
  );

  useBreadcrumbsFn(() => (offering ? getBreadcrumbs(offering) : []), [
    offering,
  ]);

  useTitle(
    offering
      ? translate('Offering screenshots ({name})', {
          name: offering.name,
        })
      : translate('Offering screenshots'),
  );

  if (!offering) {
    return <LoadingSpinner />;
  } else if (offering.name) {
    return (
      <>
        <Row>
          <Col lg={12}>
            <OfferingHeader offering={offering} hideName={false} />
          </Col>
        </Row>

        <CreateScreenshotButton offering={offering} />

        <OfferingScreenshotsList />
      </>
    );
  }
  return null;
};
