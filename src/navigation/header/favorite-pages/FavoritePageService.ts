import {
  RawParams,
  StateDeclaration,
  useCurrentStateAndParams,
  useRouter,
} from '@uirouter/react';
import { identity, isMatch, pickBy, uniqueId } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';
import {
  getCategory,
  getProviderOffering,
  getPublicOffering,
} from '@waldur/marketplace/common/api';
import { getTitle } from '@waldur/navigation/title';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import store from '@waldur/store/store';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';
import { Customer, Project, UserDetails } from '@waldur/workspace/types';

const FAVORITE_PAGES_KEY = 'waldur/favorite/pages';
const STORAGE_FOR_FAVORITE_PAGES = 'localStorage';

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
  user?: UserDetails;
  project?: Project;
}

class FavoritePageServiceClass {
  add = (page: Omit<FavoritePage, 'id'>) => {
    const prevList = this.list();
    let id = uniqueId();
    while (prevList.some((p) => p.id === id)) {
      id = uniqueId();
    }
    const newPage = { ...page, id };
    setItem(
      FAVORITE_PAGES_KEY,
      JSON.stringify(prevList.concat(newPage)),
      STORAGE_FOR_FAVORITE_PAGES,
    );
  };

  list = (): FavoritePage[] => {
    const prevList = getItem(FAVORITE_PAGES_KEY, STORAGE_FOR_FAVORITE_PAGES);
    if (prevList) {
      try {
        const jsonList = JSON.parse(prevList);
        if (Array.isArray(jsonList)) {
          return jsonList;
        }
      } catch (error) {
        removeItem(FAVORITE_PAGES_KEY, STORAGE_FOR_FAVORITE_PAGES);
      }
    }
    return [];
  };

  remove = (page: FavoritePage) => {
    const prevList = this.list();
    const newList = prevList.filter((p) => p.id !== page.id);
    setItem(
      FAVORITE_PAGES_KEY,
      JSON.stringify(newList),
      STORAGE_FOR_FAVORITE_PAGES,
    );
  };
}

export const FavoritePageService = new FavoritePageServiceClass();

const getDataForFavoritePage = async (
  state: StateDeclaration,
  params: RawParams,
  context: FavoritePageContext,
) => {
  let title, subtitle, image;
  if (state.name.startsWith('marketplace-offering') && params.offering_uuid) {
    const offering = await getProviderOffering(params.offering_uuid, {
      params: { field: ['name', 'customer_name', 'thumbnail'] },
    });
    title = offering.customer_name;
    subtitle = offering.name;
    image = offering.thumbnail;
  } else if (
    state.name === 'public-offering.marketplace-public-offering' &&
    params.uuid
  ) {
    const offering = await getPublicOffering(params.offering_uuid, {
      params: { field: ['name', 'customer_name', 'thumbnail'] },
    });
    title = offering.customer_name;
    subtitle = offering.name;
    image = offering.thumbnail;
  } else if (
    (state.name.startsWith('marketplace-category') ||
      state.name === 'public.marketplace-category') &&
    params.category_uuid
  ) {
    const category = await getCategory(params.category_uuid, {
      params: { field: ['title', 'icon'] },
    });
    subtitle = category.title;
    image = category.icon;
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
  } else {
    image = '';
  }
  return { title, subtitle, image };
};

export const useFavoritePages = () => {
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const pageTitle = useSelector(getTitle);

  const user = useSelector(getUser) as UserDetails;
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

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
      event && event.preventDefault();
      page.params = pickBy(page.params, identity); // remove null and undefined properties
      if (findFavoritePage(page.state, page.params)) return;
      FavoritePageService.add(page);
      setFavPages(getPagesList());
      event && event.stopPropagation();
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
    }).then((data) => {
      const newPage = {
        title: data.title || altTitle,
        subtitle: data.subtitle || altSubtitle,
        state: state.name,
        params,
        image: data.image,
      };
      addFavoritePage(newPage);
    });
  }, [router, state, params, pageTitle, currentPageSavedId, addFavoritePage]);

  const removeFavorite = useCallback(
    (state, params, event = null) => {
      event && event.preventDefault();
      const page = findFavoritePage(state, params);
      FavoritePageService.remove(page);
      setFavPages(getPagesList());
      event && event.stopPropagation();
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
