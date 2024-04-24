import { FunctionComponent, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingCard } from '@waldur/marketplace/common/OfferingCard';
import {
  OFFERING_CATEGORY_SECTION_FORM_ID,
  SERVICE_PROVIDER_OFFERING_GRID,
} from '@waldur/marketplace/offerings/service-providers/constants';
import { GRID_PAGE_SIZE_CONFIG } from '@waldur/marketplace/offerings/service-providers/shared/grid/constants';
import Grid from '@waldur/marketplace/offerings/service-providers/shared/grid/Grid';
import { createFetcher } from '@waldur/table';
import { updatePageSize } from '@waldur/table/actions';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { useTable } from '@waldur/table/utils';

interface OwnProps {
  serviceProviderUuid: string;
  query: string;
  categoryUuid: string;
}

export const ServiceProviderOfferingsGrid: FunctionComponent<OwnProps> = (
  ownProps,
) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      updatePageSize(SERVICE_PROVIDER_OFFERING_GRID, GRID_PAGE_SIZE_CONFIG),
    );
  }, [dispatch]);
  const filterValues = useSelector(
    getFormValues(OFFERING_CATEGORY_SECTION_FORM_ID),
  );
  const filter = useMemo(() => {
    const filter: Record<string, boolean | string | string[]> = {
      billable: true,
      shared: true,
      state: 'Active',
      customer_uuid: ownProps.serviceProviderUuid,
      name: ownProps.query,
      category_uuid: ownProps.categoryUuid,
      ...filterValues,
    };
    return filter;
  }, [ownProps, filterValues]);
  const props = useTable({
    table: SERVICE_PROVIDER_OFFERING_GRID,
    fetchData: createFetcher('marketplace-public-offerings', ANONYMOUS_CONFIG),
    filter,
  });
  return (
    <Grid
      {...props}
      verboseName={translate('Service provider offerings')}
      gridItemComponent={({ row }) => (
        <OfferingCard offering={row} className="w-100 mw-300px" />
      )}
      hideGridHeader={true}
    />
  );
};
