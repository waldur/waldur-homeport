import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { InvalidRoutePage } from '@waldur/error/InvalidRoutePage';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getPlugins,
  getCategories,
  getProviderOffering,
} from '@waldur/marketplace/common/api';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { filterPluginsData } from '@waldur/marketplace/offerings/store/utils';
import { useTitle } from '@waldur/navigation/title';

import { ProviderOfferingDetails } from './ProviderOfferingDetails';

export const ProviderOfferingDetailsContainer: FunctionComponent = () => {
  const dispatch = useDispatch();

  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, refreshOffering] = useAsyncFn(async () => {
    const offering = await getProviderOffering(offering_uuid);
    const category = await getCategory(offering.category_uuid);
    const categories = await getCategories();
    const pluginsData = await getPlugins();
    const plugins = filterPluginsData(pluginsData);
    dispatch(
      actions.loadDataSuccess({
        offering,
        categories,
        plugins,
      }),
    );
    return { offering, category };
  }, [offering_uuid]);

  useEffectOnce(() => {
    refreshOffering();
  });

  useTitle(
    value?.offering ? value.offering.name : translate('Offering details'),
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h3>{translate('Unable to load offering details.')}</h3>
  ) : value ? (
    <ProviderOfferingDetails
      offering={value.offering}
      refreshOffering={refreshOffering}
      category={value.category}
    />
  ) : (
    <InvalidRoutePage />
  );
};
