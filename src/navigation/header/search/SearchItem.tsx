import { StarIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

import { Link } from '@waldur/core/Link';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { ItemIcon } from '@waldur/navigation/workspace/context-selector/ItemIcon';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';

import { getResourceFilterFromSearchItem } from './utils';

import './SearchItem.scss';

export interface SearchItemProps {
  title: string;
  subtitle?: string;
  image?: string;
  to: string;
  params?: { [key: string]: string };
  badge?: ReactNode;
  onClick?(item: SearchItemProps);
  isFavorite?: ReturnType<typeof useFavoritePages>['isFavorite'];
  addFavoritePage?: ReturnType<typeof useFavoritePages>['addFavoritePage'];
  removeFavorite: ReturnType<typeof useFavoritePages>['removeFavorite'];
}

export const SearchItem = (props: SearchItemProps) => {
  const isFav = props.isFavorite
    ? props.isFavorite(props.to, props.params)
    : false;

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();

  return (
    <Link
      state={props.to}
      params={props.params}
      className="search-result-item d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-primary-50"
      onClick={(e) => {
        props.onClick ? props.onClick(props) : e.stopPropagation();
        syncResourceFilters(getResourceFilterFromSearchItem(props));
      }}
      aria-hidden={true}
    >
      <ItemIcon
        item={{ image: props.image, name: props.title }}
        className="me-4"
        circle
      />

      <div className="d-flex flex-column justify-content-start fw-semibold">
        <span className="fs-6 fw-semibold">{props.title}</span>
        {Boolean(props.subtitle) && (
          <span className="fs-7 fw-semibold text-muted">{props.subtitle}</span>
        )}
      </div>
      <div className="ms-auto d-flex">
        {props.badge && <div>{props.badge}</div>}
        <button
          className={'btn-fav' + (isFav ? ' show' : '')}
          onClick={(e) =>
            isFav
              ? props.removeFavorite(props.to, props.params, e)
              : props.addFavoritePage(
                  {
                    state: props.to,
                    params: props.params,
                    title: props.title,
                    subtitle: props.subtitle,
                    image: props.image,
                  },
                  e,
                )
          }
        >
          {isFav ? (
            <StarIcon size={20} weight="fill" className="text-warning" />
          ) : (
            <StarIcon size={20} className="text-dark" />
          )}
        </button>
      </div>
    </Link>
  );
};
