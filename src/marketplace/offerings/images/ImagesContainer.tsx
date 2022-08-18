import { useCurrentStateAndParams } from '@uirouter/react';
import { useEffect, FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OfferingHeader } from '@waldur/marketplace/offerings/details/OfferingHeader';
import { loadOfferingStart } from '@waldur/marketplace/offerings/store/actions';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';

import { CreateImageButton } from './CreateImageButton';
import { OfferingImagesList } from './OfferingImagesList';

export const ImagesContainer: FunctionComponent = () => {
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

  useTitle(
    offering
      ? translate('Offering images ({name})', {
          name: offering.name,
        })
      : translate('Offering images'),
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

        <CreateImageButton offering={offering} />

        <OfferingImagesList />
      </>
    );
  }
  return null;
};
