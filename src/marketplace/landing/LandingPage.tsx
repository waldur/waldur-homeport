import { FC, Suspense, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';
import { NestedTag } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { syncFiltersToURL } from '@waldur/core/filters';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';
import {
  useExtraToolbar,
  useFullPage,
  useToolbarActions,
} from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { CardStyleType } from '../common/cards/index';
import { MARKETPLACE_LANDING_FILTER_FORM } from '../constants';

import { CardStyleProvider } from './CardStyleContext';
import { PageBarFilters } from './filter/PageBarFilters';
import { setMarketplaceFilter } from './filter/store/actions';
import { getMarketplaceFilters } from './filter/store/selectors';
import { LAYOUTS, MarketplaceLayoutType } from './layouts';
import { MarketplaceLandingFilter } from './MarketplaceLandingFilter';

export const LandingPage: FC<{}> = () => {
  useTitle(
    ENV.plugins.WALDUR_CORE.MARKETPLACE_LANDING_PAGE ||
      translate('Marketplace'),
  );
  useFullPage();

  useMarketplacePublicTabs();

  const layout: MarketplaceLayoutType =
    (ENV.plugins.WALDUR_CORE
      .MARKETPLACE_LAYOUT_MODE as MarketplaceLayoutType) || 'classic';
  const cardStyle: CardStyleType =
    (ENV.plugins.WALDUR_CORE.MARKETPLACE_CARD_STYLE as CardStyleType) ||
    'detailed';

  const dispatch = useDispatch();
  const formValues = useSelector(
    getFormValues(MARKETPLACE_LANDING_FILTER_FORM),
  ) as Record<string, any>;

  const handleTagClick = useCallback(
    (tag: NestedTag) => {
      dispatch(
        setMarketplaceFilter({
          label: translate('Tag'),
          name: 'tag',
          value: tag,
          getValueLabel: (v) => v?.name,
        }),
      );
      dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, 'tag', tag));
      syncFiltersToURL({ ...formValues, tag });
    },
    [dispatch, formValues],
  );

  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />, []);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);

  const LayoutComponent = LAYOUTS[layout];

  return (
    <CardStyleProvider cardStyle={cardStyle}>
      <Suspense fallback={<LoadingSpinner />}>
        <LayoutComponent onTagClick={handleTagClick} />
      </Suspense>
    </CardStyleProvider>
  );
};
