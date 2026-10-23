import { getTitle } from '@/navigation/title';
import { router } from '@/router';
import { configureTableHost } from '@/table/host';

// The page's last breadcrumb, else its title.
const getDefaultTitle = () => {
  const pageTitle = getTitle();
  const breadcrumbs = router.globals.$current.path
    .filter((part) => part.data?.breadcrumb)
    .map((part) => part.data.breadcrumb())
    .flat();

  let breadcrumbTitle = breadcrumbs.pop();
  if (!breadcrumbTitle) {
    breadcrumbTitle = router.globals.$current.parent?.data?.breadcrumb?.();
  }

  return breadcrumbTitle || pageTitle;
};

/** Tables read their default title and filter URL params through UI-Router,
 * so a filter change is a router URL change (sidebar highlighting follows). */
export const configureHomeportTableHost = () =>
  configureTableHost({
    getDefaultTitle,
    readQuery: () => router.urlService.search(),
    writeQuery: (query) =>
      router.urlService.url(
        router.urlService.path() + (query ? '?' + query : ''),
      ),
  });
