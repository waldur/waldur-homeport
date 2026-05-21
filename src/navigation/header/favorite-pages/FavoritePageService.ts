import {
  RawParams,
  StateDeclaration,
  useCurrentStateAndParams,
  useRouter,
} from '@uirouter/react';
import { isMatch, pickBy, uniqueId } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceCategoriesRetrieve,
  marketplaceProviderOfferingsRetrieve,
  marketplacePublicOfferingsRetrieve,
  Offering,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { getTitle } from '@/navigation/title';
import { isDescendantOf } from '@/navigation/useTabs';
import store from '@/store/store';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';
import { getResource } from '@/workspace/selectors';
import { Customer, Project, User } from '@/workspace/types';

const FAVORITE_PAGES_KEY = 'waldur/favorite/pages';

interface FavoritePage {
  id: string;
  title: string;
  subtitle: string;
  state: string;
  params?: { [key: string]: string };
  image?: string;
}

interface FavoritePageContext {
  customer?: Customer;
  user?: User;
  project?: Project;
  resource?: Resource;
}

class FavoritePageServiceClass {
  add = (page: Omit<FavoritePage, 'id'>) => {
    const prevList = this.list();
    let id = uniqueId();
    while (prevList.some((p) => p.id === id)) {
      id = uniqueId();
    }
    const newPage = { ...page, id };
    localStorage.setItem(
      FAVORITE_PAGES_KEY,
      JSON.stringify(prevList.concat(newPage)),
    );
  };

  list = (): FavoritePage[] => {
    const prevList = localStorage.getItem(FAVORITE_PAGES_KEY);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch {
        localStorage.removeItem(FAVORITE_PAGES_KEY);
      }
    }
    return [];
  };

  remove = (page: FavoritePage) => {
    const prevList = this.list();
    const newList = prevList.filter((p) => p.id !== page.id);
    localStorage.setItem(FAVORITE_PAGES_KEY, JSON.stringify(newList));
  };
}

const FavoritePageService = new FavoritePageServiceClass();

const getDataForFavoritePage = async (
  state: StateDeclaration,
  params: RawParams,
  context: FavoritePageContext,
) => {
  let title = store.getState().title?.title;
  let subtitle = store.getState().title?.subtitle;
  let image;
  const newParams = params ? { ...params } : {};
  if (state.name.startsWith('marketplace-offering') && params.offering_uuid) {
    const offering = (await marketplaceProviderOfferingsRetrieve({
      path: { uuid: params.offering_uuid },
      query: { field: ['name', 'customer_name', 'thumbnail'] },
    }).then((response) => response.data)) as Offering;
    title = offering.customer_name;
    subtitle = offering.name;
    image = offering.thumbnail;
  } else if (
    state.name === 'public-offering.marketplace-public-offering' &&
    params.uuid
  ) {
    const offering = await marketplacePublicOfferingsRetrieve({
      path: { uuid: params.offering_uuid },
      query: {
        field: ['name', 'customer_name', 'thumbnail'],
      },
    }).then((response) => response.data);

    title = offering.customer_name;
    subtitle = offering.name;
    image = offering.thumbnail;
  } else if (
    (state.name.startsWith('marketplace-category') ||
      ['public.marketplace-category', 'category-resources'].includes(
        state.name,
      )) &&
    params.category_uuid
  ) {
    const category = await marketplaceCategoriesRetrieve({
      path: { uuid: params.category_uuid },
      query: { field: ['title', 'icon'] },
    }).then((response) => response.data);
    subtitle = category.title;
    image = category.icon;
    if (state.name === 'category-resources') {
      title = translate('List of resources');
    }
  } else if (isDescendantOf('profile', state)) {
    image = context.user?.image;
  } else if (isDescendantOf('admin', state)) {
    image = 'admin';
  } else if (isDescendantOf('reporting', state)) {
    image = 'reporting';
  } else if (isDescendantOf('support', state)) {
    image = 'support';
  } else if (isDescendantOf('organization', state)) {
    title = context.customer?.name || context.customer?.display_name;
    image = context.customer?.image;
  } else if (isDescendantOf('marketplace-provider', state)) {
    title = context.customer?.name || context.customer?.display_name;
    image = context.customer?.image;
  } else if (isDescendantOf('project', state)) {
    const titleFromState = store
      .getState()
      .title.title.replace('resources', '')
      .trim();
    title = context.project?.name;
    image = context.project?.image;
    subtitle = titleFromState;
    // Add organization info, to set the resources filter on click
    Object.assign(newParams, {
      customer_uuid: context.resource?.customer_uuid,
      customer_name: context.resource?.customer_name,
    });
  } else if (state.name === 'all-resources') {
    title = translate('List of all resources');
  } else if (state.name === 'marketplace-resource-details') {
    title = context.resource?.name;
    image = context.resource?.offering_thumbnail;
    subtitle = `${context.resource?.customer_name} / ${context.resource?.project_name}`;
    // Add project and organization info, to set the resources filter on click
    Object.assign(newParams, {
      project_uuid: context.resource?.project_uuid,
      project_name: context.resource?.project_name,
      customer_uuid: context.resource?.customer_uuid,
      customer_name: context.resource?.customer_name,
    });
  } else {
    image = '';
  }
  return { title, subtitle, image, params: newParams };
};

export const useFavoritePages = () => {
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const pageTitle = useSelector(getTitle);

  const user = useUser();
  const customer = useCustomer();
  const project = useProject();
  const resource = useSelector(getResource);

  const getPagesList = () => FavoritePageService.list().reverse();
  const [favPages, setFavPages] = useState(() => getPagesList());

  const findFavoritePage = useCallback(
    (state, params) =>
      favPages.find(
        (p) =>
          p.state === state &&
          ((!p.params && !params) || isMatch(params, p.params)),
      ),
    [favPages],
  );

  const addFavoritePage = useCallback(
    (page: Omit<FavoritePage, 'id'>, event = null) => {
      if (event) event.preventDefault();
      page.params = pickBy(page.params, (value) => value !== null);
      if (findFavoritePage(page.state, page.params)) return;
      FavoritePageService.add(page);
      setFavPages(getPagesList());
      if (event) event.stopPropagation();
    },
    [favPages, setFavPages, getPagesList, findFavoritePage],
  );

  const currentPageSavedId = useMemo(() => {
    const state = router.globals.$current.name;
    const params = router.globals.params;
    return findFavoritePage(state, params);
  }, [findFavoritePage, router]);

  const addCurrentPageFavorite = useCallback(() => {
    if (currentPageSavedId) return;

    const getBreadcrumbs = router.globals.$current.path
      .filter((part) => part.data?.breadcrumb)
      .map((part) => part.data.breadcrumb())
      .flat();
    const routerTitle = router.globals.$current.path
      .find((part) => part.data?.title)
      ?.data.title();

    const altTitle = pageTitle || routerTitle;
    const altSubtitle = getBreadcrumbs[getBreadcrumbs.length - 1];
    getDataForFavoritePage(state, params, {
      user,
      customer,
      project,
      resource,
    }).then((data) => {
      const newPage = {
        title: data.title || altTitle,
        subtitle: data.subtitle || altSubtitle,
        state: state.name,
        params: data.params,
        image: data.image,
      };
      addFavoritePage(newPage);
    });
  }, [router, state, params, pageTitle, currentPageSavedId, addFavoritePage]);

  const removeFavorite = useCallback(
    (state, params, event = null) => {
      if (event) event.preventDefault();
      const page = findFavoritePage(state, params);
      FavoritePageService.remove(page);
      setFavPages(getPagesList());
      if (event) event.stopPropagation();
    },
    [setFavPages, getPagesList, findFavoritePage],
  );

  return {
    favPages,
    isCurrentPageFavorite: Boolean(currentPageSavedId),
    addCurrentPageFavorite,
    isFavorite: findFavoritePage,
    addFavoritePage,
    removeFavorite,
  };
};
