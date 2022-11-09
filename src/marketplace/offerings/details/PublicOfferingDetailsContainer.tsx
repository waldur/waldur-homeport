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
  getPublicOffering,
} from '@waldur/marketplace/common/api';
import { PublicOfferingDetails } from '@waldur/marketplace/offerings/details/PublicOfferingDetails';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { filterPluginsData } from '@waldur/marketplace/offerings/store/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

export const PublicOfferingDetailsContainer: FunctionComponent = () => {
  useFullPage();
  const dispatch = useDispatch();

  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const [{ loading, error, value }, refreshOffering] = useAsyncFn(async () => {
    try {
      const user = await getCurrentUser({ __skipLogout__: true });
      dispatch(setCurrentUser(user));
      const offering = await getPublicOffering(uuid);
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
    } catch (e) {
      if (e.response.status == 401) {
        const offering = await getPublicOffering(uuid, ANONYMOUS_CONFIG);
        const category = await getCategory(
          offering.category_uuid,
          ANONYMOUS_CONFIG,
        );
        const categories = await getCategories(ANONYMOUS_CONFIG);
        dispatch(
          actions.loadDataSuccess({
            offering,
            categories,
          }),
        );
        return { offering, category };
      }
    }
  }, [uuid]);

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
    <>
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
