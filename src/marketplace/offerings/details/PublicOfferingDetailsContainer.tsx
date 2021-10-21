import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { PublicOfferingDetails } from '@waldur/marketplace/offerings/details/PublicOfferingDetails';
import { AnonymousHeader } from '@waldur/navigation/AnonymousHeader';
import { useTitle } from '@waldur/navigation/title';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

const fetchData = async (offeringUuid: string) => {
  const offering = await getOffering(offeringUuid, ANONYMOUS_CONFIG);
  const category = await getCategory(offering.category_uuid, ANONYMOUS_CONFIG);
  return { offering, category };
};

export const PublicOfferingDetailsContainer: FunctionComponent = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const { loading, error, value } = useAsync(() => fetchData(uuid), [uuid]);

  useTitle(
    value?.offering ? value.offering.name : translate('Offering details'),
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load offering details.')}</h3>
  ) : value?.offering ? (
    <>
      <AnonymousHeader />
      <PublicOfferingDetails
        offering={value.offering}
        category={value.category}
      />
    </>
  ) : (
    <InvalidRoutePage />
  );
};
