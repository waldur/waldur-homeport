import { LeafletEvent } from 'leaflet';
import { GeoSearchControl } from 'leaflet-geosearch';
import { useEffect, FunctionComponent } from 'react';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';

import { useMap } from './MapContext';

export const GeoSearchControlElement: FunctionComponent<any> = (props) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const searchControl = new GeoSearchControl(props);

    map.addControl(searchControl);

    const onLayerAdd = (e: LeafletEvent) => {
      if (e.layer._latlng) {
        props.onLocationFound(e.layer._latlng);
        map.setZoom(10);
      }
    };
    map.on('layeradd', onLayerAdd);

    return () => {
      map.off('layeradd', onLayerAdd);
      map.removeControl(searchControl);
    };
  }, [props, map]);

  return null;
};
