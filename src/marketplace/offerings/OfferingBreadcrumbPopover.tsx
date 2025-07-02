import { translate } from '@waldur/i18n';
import { BreadcrumbDropdown } from '@waldur/navigation/header/breadcrumb/BreadcrumbDropdown';
import { useFavoritePages } from '@waldur/navigation/header/favorite-pages/FavoritePageService';
import { SearchItem } from '@waldur/navigation/header/search/SearchItem';

import { ServiceProvider } from '../types';

import { getStates } from './list/OfferingStateFilter';

const OfferingRow = ({
  row,
  addFavoritePage,
  removeFavorite,
  isFavorite,
  page,
}) => (
  <SearchItem
    to={
      page === 'edit'
        ? 'marketplace-offering-update'
        : 'marketplace-offering-details'
    }
    params={{ offering_uuid: row.uuid }}
    image={row.thumbnail}
    title={row.name}
    subtitle={row.category_title}
    addFavoritePage={addFavoritePage}
    removeFavorite={removeFavorite}
    isFavorite={isFavorite}
  />
);

interface OfferingBreadcrumbPopoverProps {
  provider: ServiceProvider;
  page: 'details' | 'edit';
}

export const OfferingBreadcrumbPopover = ({
  provider,
  page,
}: OfferingBreadcrumbPopoverProps) => {
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();

  return (
    <BreadcrumbDropdown
      api={`/marketplace-service-providers/${provider.uuid}/offerings/`}
      queryField="name"
      params={{
        field: ['name', 'uuid', 'category_title', 'thumbnail'],
      }}
      filters={[
        {
          field: 'state',
          label: translate('Status'),
          options: getStates(),
        },
      ]}
      RowComponent={({ row }) => (
        <OfferingRow
          row={row}
          addFavoritePage={addFavoritePage}
          removeFavorite={removeFavorite}
          isFavorite={isFavorite}
          page={page}
        />
      )}
      emptyMessage={translate('There are no offerings.')}
    />
  );
};
