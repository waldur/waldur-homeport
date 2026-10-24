import { GeoSearchControl } from 'leaflet-geosearch';

// leaflet-geosearch's SearchControlOptions, which its index does not export.
type ControlOptions = ReturnType<typeof GeoSearchControl>['options'];
export type SearchControlOptions = Partial<ControlOptions> &
  Required<Pick<ControlOptions, 'provider'>>;

export const createSearchControl = (options: SearchControlOptions) => {
  // A factory that returns the control: no `new` needed.
  const searchControl = GeoSearchControl(options);
  if (options.autoComplete === false) {
    // leaflet-geosearch (3.11, and still 4.4) builds its result list only
    // for autocomplete, yet clears it on every submit, so without one each
    // search throws before it reaches the provider.
    searchControl.resultList = {
      clear: () => undefined,
    } as typeof searchControl.resultList;
  }
  return searchControl;
};
