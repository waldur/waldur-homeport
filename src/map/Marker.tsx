import * as L from 'leaflet';
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { MarkerContext, useMap, useMarker } from './MapContext';

interface MarkerProps {
  position: L.LatLngTuple;
  icon?: L.Icon;
}

export const Marker: FunctionComponent<PropsWithChildren<MarkerProps>> = ({
  position,
  icon,
  children,
}) => {
  const map = useMap();
  const [marker, setMarker] = useState<L.Marker>(null);
  const [latitude, longitude] = position;

  // Both are only read when the marker is created: the position is kept in sync
  // by the effect below, and the icon factory hands out a fresh instance on
  // every render, which would otherwise recreate the marker each time.
  const initialRef = useRef({ position, icon });

  useEffect(() => {
    const { position: initialPosition, icon: initialIcon } = initialRef.current;
    const instance = L.marker(
      initialPosition,
      initialIcon ? { icon: initialIcon } : {},
    );
    instance.addTo(map);
    setMarker(instance);
    return () => {
      instance.remove();
      setMarker(null);
    };
  }, [map]);

  useEffect(() => {
    marker?.setLatLng([latitude, longitude]);
  }, [marker, latitude, longitude]);

  return marker ? (
    <MarkerContext.Provider value={marker}>{children}</MarkerContext.Provider>
  ) : null;
};

export const Popup: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const marker = useMarker();
  const [content, setContent] = useState<HTMLElement>(null);

  useEffect(() => {
    // Leaflet accepts a detached element as popup content, which lets React
    // keep ownership of everything inside it.
    const element = document.createElement('div');
    marker.bindPopup(element);
    setContent(element);
    return () => {
      marker.unbindPopup();
      setContent(null);
    };
  }, [marker]);

  return content ? createPortal(children, content) : null;
};
