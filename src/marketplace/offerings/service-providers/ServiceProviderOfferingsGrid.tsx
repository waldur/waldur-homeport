import { FunctionComponent, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import {
  OFFERING_CATEGORY_SECTION_FORM_ID,
  SERVICE_PROVIDER_OFFERING_GRID,
} from '@waldur/marketplace/offerings/service-providers/constants';
import { GRID_PAGE_SIZE_CONFIG } from '@waldur/marketplace/offerings/service-providers/shared/grid/constants';
import Grid from '@waldur/marketplace/offerings/service-providers/shared/grid/Grid';
import { ServiceProviderOfferingDetailsCard } from '@waldur/marketplace/offerings/service-providers/shared/ServiceProviderOfferingDetailsCard';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher } from '@waldur/table';
import { updatePageSize } from '@waldur/table/actions';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

interface OwnProps {
  serviceProviderUuid: string;
  query: string;
  categoryUuid: string;
}

const GridComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      updatePageSize(SERVICE_PROVIDER_OFFERING_GRID, GRID_PAGE_SIZE_CONFIG),
    );
  }, [dispatch]);
  return (
    <Grid
      {...props}
      verboseName={translate('Service provider offerings')}
      gridItemComponent={ServiceProviderOfferingDetailsCard}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hideGridHeader={true}
    />
  );
};

const mapPropsToFilter = (props: OwnProps) => {
  const filter: Record<string, boolean | string | string[]> = {
    billable: true,
    shared: true,
    state: 'Active',
    customer_uuid: props.serviceProviderUuid,
    name: props.query,
    category_uuid: props.categoryUuid,
  };
  return filter;
};

const GridOptions = {
  table: SERVICE_PROVIDER_OFFERING_GRID,
  fetchData: createFetcher('marketplace-offerings', ANONYMOUS_CONFIG),
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues(OFFERING_CATEGORY_SECTION_FORM_ID)(state),
});

const enhance = compose(
  connect<{}, {}, OwnProps>(mapStateToProps),
  connectTable(GridOptions),
);

export const ServiceProviderOfferingsGrid = enhance(GridComponent);
