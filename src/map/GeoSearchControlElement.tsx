import { LatLng, LeafletEvent } from 'leaflet';
import { useEffect, FunctionComponent, useRef } from 'react';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';

import { useMap } from './MapContext';
import { createSearchControl, SearchControlOptions } from './searchControl';

type GeoSearchControlElementProps = SearchControlOptions & {
  onLocationFound(location: LatLng): void;
};

/**
 * Adds the search control to the map once. Its options are read when it is
 * created; callbacks are read when they fire, so a re-render with new ones
 * does not tear the control down and lose its marker or a pending search.
 */
export const GeoSearchControlElement: FunctionComponent<
  GeoSearchControlElementProps
> = (props) => {
  const map = useMap();
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const { onLocationFound: _onLocationFound, ...options } = latest.current;
    const searchControl = createSearchControl(options);

    map.addControl(searchControl);

    const onLayerAdd = (e: LeafletEvent) => {
      if (e.layer._latlng) {
        latest.current.onLocationFound(e.layer._latlng);
        map.setZoom(10);
      }
    };
    map.on('layeradd', onLayerAdd);

    return () => {
      map.off('layeradd', onLayerAdd);
      map.removeControl(searchControl);
      // The control removes its search bar but leaves its markers on the map.
      searchControl.markers.remove();
    };
  }, [map]);

  return null;
};
