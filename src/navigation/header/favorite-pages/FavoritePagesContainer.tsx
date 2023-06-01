import {
  RawParams,
  StateDeclaration,
  useCurrentStateAndParams,
  useRouter,
} from '@uirouter/react';
import classNames from 'classnames';
import { chunk } from 'lodash';
import { FC, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getProviderOffering,
  getPublicOffering,
  getResource,
} from '@waldur/marketplace/common/api';
import { getTitle } from '@waldur/navigation/title';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import store from '@waldur/store/store';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { FavoritePageItem } from './FavoritePageItem';
import {
  FavoritePage,
  FavoritePageContext,
  FavoritePageService,
} from './FavoritePageService';
import './FavoritePagesContainer.scss';

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
    state.name === 'public.marketplace-public-offering' &&
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
  } else if (state.name.endsWith('resource-details') && params.resource_uuid) {
    const resource = await getResource(params.resource_uuid, {
      params: {
        field: ['name', 'project_name', 'category_icon', 'offering_thumbnail'],
      },
    });
    title = resource.project_name;
    subtitle = resource.name;
    image = resource.offering_thumbnail || resource.category_icon;
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

export const FavoritePagesContainer: FC<{ close }> = ({ close }) => {
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const pageTitle = useSelector(getTitle);

  const user = useSelector(getUser) as UserDetails;
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const [loading, setloading] = useState(false);
  const [redirecting, setRedirecting] = useState('');
  const getPagesList = () => FavoritePageService.list().reverse();
  const [pages, setPages] = useState(() => getPagesList());

  const currentPageSavedId =
    pages.find((page) => page.url === router.urlService.url())?.id || null;

  const addFavorite = useCallback(() => {
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
    setloading(true);
    getDataForFavoritePage(state, params, {
      user,
      customer,
      project,
    })
      .then((data) => {
        const newPage = {
          title: data.title || altTitle,
          subtitle: data.subtitle || altSubtitle,
          state: state.name,
          params,
          url: router.urlService.url(),
          image: data.image,
        };
        FavoritePageService.add(newPage);
        setPages(getPagesList());
      })
      .finally(() => {
        setloading(false);
      });
  }, [router, state, params, pageTitle, currentPageSavedId]);

  const clickOnFavorite = useCallback(
    (page: FavoritePage) => {
      setRedirecting(page.id);
      router.stateService.go(page.state, page.params).finally(() => {
        setRedirecting('');
        close();
      });
    },
    [router, setRedirecting],
  );

  const removeFavorite = useCallback(
    (event: MouseEvent, page: FavoritePage) => {
      event.preventDefault();
      FavoritePageService.remove(page);
      setPages(getPagesList());
      event.stopPropagation();
    },
    [],
  );

  return (
    <>
      <div className="favorite-pages-header d-flex flex-column bgi-no-repeat rounded-top">
        <h3 className="text-white fw-bolder px-9 mt-10 mb-3 text-center">
          {translate('Favorite pages')}
        </h3>

        <div className="text-center mb-6">
          {currentPageSavedId ? (
            <Button variant="success">
              <i className="fa fa-check fs-6" />
              {translate('Saved')}
            </Button>
          ) : loading ? (
            <Button variant="light-success">
              <LoadingSpinnerIcon className="p-0 me-2" />
              {translate('Saving')}
            </Button>
          ) : (
            <Button
              variant="white"
              className="btn-active-light-primary"
              onClick={addFavorite}
            >
              <i className="fa fa-plus fs-6" />
              {translate('Add current page')}
            </Button>
          )}
        </div>
      </div>

      <div className={classNames('favorite-pages', !pages.length && 'empty')}>
        {pages.length > 0 ? (
          <table className="w-100">
            <tbody>
              {chunk(pages, 2).map((group, i) => (
                <tr key={i}>
                  {group.map((page) => (
                    <td key={page.id}>
                      <FavoritePageItem
                        item={page}
                        active={currentPageSavedId === page.id}
                        loading={redirecting === page.id}
                        click={clickOnFavorite}
                        remove={removeFavorite}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center">
            <div className="pt-10 pb-5">
              <i className="fa fa-star display-5" />
            </div>
            <div className="pb-15 fw-bold">
              <h3 className="text-gray-600 fs-5 mb-2">
                {translate('No page added yet')}
              </h3>
              <div className="text-muted fs-7">
                {translate('Add your favorite pages here')}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
