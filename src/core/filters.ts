// Moved to the table module, which reads and writes the URL through its host
// (see src/core/tableHost.ts for homeport's UI-Router one).
export {
  getInitialValues,
  getQueryParams,
  syncFiltersToURL,
} from '@/table/urlFilters';
