import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import {
  getOffering,
  getCategory,
  getCategories,
} from '@waldur/marketplace/common/api';
import { PublicOfferingDetails } from '@waldur/marketplace/offerings/details/PublicOfferingDetails';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { AnonymousHeader } from '@waldur/navigation/AnonymousHeader';
import { useTitle } from '@waldur/navigation/title';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

const fetchData = async (offeringUuid: string) => {
  const offering = await getOffering(offeringUuid, ANONYMOUS_CONFIG);
  const category = await getCategory(offering.category_uuid, ANONYMOUS_CONFIG);
  const categories = await getCategories();
  return { offering, category, categories };
};

export const PublicOfferingDetailsContainer: FunctionComponent = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, refreshOffering] = useAsyncFn(
    () => fetchData(uuid),
    [uuid],
  );

  useEffectOnce(() => {
    refreshOffering();
  });

  useTitle(
    value?.offering ? value.offering.name : translate('Offering details'),
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!value) return;

    if (!value.offering || !value.categories) return;

    dispatch(
      actions.loadDataSuccess({
        offering: value.offering,
        categories: value.categories,
      }),
    );
  }, [value]);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load offering details.')}</h3>
  ) : value?.offering ? (
    <>
      <AnonymousHeader />
      <PublicOfferingDetails
        offering={value.offering}
        refreshOffering={refreshOffering}
        category={value.category}
      />
    </>
  ) : (
    <InvalidRoutePage />
  );
};
