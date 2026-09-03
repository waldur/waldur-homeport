import { FC, Suspense, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NestedTag } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { syncFiltersToURL } from '@/core/filters';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getMarketplaceTitle } from '@/marketplace/title';
import { useMarketplacePublicTabs } from '@/marketplace/utils';
import {
  useExtraToolbar,
  useFullPage,
  useToolbarActions,
} from '@/navigation/context';
import { useTitle } from '@/navigation/title';

import { CardStyleType } from '../common/cards/index';

import { CardStyleProvider } from './CardStyleContext';
import { PageBarFilters } from './filter/PageBarFilters';
import { setMarketplaceFilter } from './filter/store/actions';
import { getMarketplaceFilters } from './filter/store/selectors';
import { LAYOUTS, MarketplaceLayoutType } from './layouts';
import { MarketplaceLandingFilter } from './MarketplaceLandingFilter';

export const LandingPage: FC<{}> = () => {
  useTitle(getMarketplaceTitle());
  useFullPage();

  useMarketplacePublicTabs();

  const layout: MarketplaceLayoutType =
    (ENV.plugins.WALDUR_CORE
      .MARKETPLACE_LAYOUT_MODE as MarketplaceLayoutType) || 'classic';
  const cardStyle: CardStyleType =
    (ENV.plugins.WALDUR_CORE.MARKETPLACE_CARD_STYLE as CardStyleType) ||
    'detailed';

  const dispatch = useDispatch();
  const filters = useSelector(getMarketplaceFilters);

  const formValues = useMemo(() => {
    const org = filters?.find((f) => f.name === 'organization')?.value;
    const proj = filters?.find((f) => f.name === 'project')?.value;
    const tag = filters?.find((f) => f.name === 'tag')?.value;
    return { organization: org, project: proj, tag };
  }, [filters]);

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
      syncFiltersToURL({ ...formValues, tag });
    },
    [dispatch, formValues],
  );

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
