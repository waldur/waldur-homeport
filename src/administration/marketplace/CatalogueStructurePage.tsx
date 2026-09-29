import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'categories',
    title: translate('Categories'),
    component: lazyComponent(() =>
      import('@/marketplace/category/admin/AdminCategoriesPage').then(
        (module) => ({ default: module.AdminCategoriesPage }),
      ),
    ),
  },
  {
    key: 'category-groups',
    title: translate('Category groups'),
    component: lazyComponent(() =>
      import('@/marketplace/category/admin/CategoryGroupsList').then(
        (module) => ({ default: module.CategoryGroupsList }),
      ),
    ),
  },
  {
    key: 'tags',
    title: translate('Tags'),
    component: lazyComponent(() =>
      import('@/marketplace/tags/admin/TagsList').then((module) => ({
        default: module.TagsList,
      })),
    ),
  },
];

export const CatalogueStructurePage = () => (
  <TableWithTabs
    title={translate('Catalogue structure')}
    subtitle={translate('How the marketplace catalogue is organised.')}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
