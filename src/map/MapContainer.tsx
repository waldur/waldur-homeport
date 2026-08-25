import * as L from 'leaflet';
import {
  CSSProperties,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';

import 'leaflet/dist/leaflet.css';

import { MapContext } from './MapContext';

interface MapContainerProps extends L.MapOptions {
  className?: string;
  style?: CSSProperties;
}

/**
 * Mounts a Leaflet map into a plain div and exposes the instance to children
 * through context. Children render nothing themselves; they attach layers and
 * controls to the map they read from that context.
 */
export const MapContainer: FunctionComponent<
  PropsWithChildren<MapContainerProps>
> = ({ children, className, style, ...options }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map>(null);

  // Leaflet reads its options once, when the map is created; later values have
  // no effect. Keeping them in a ref makes that explicit and keeps the map from
  // being torn down whenever the caller passes a fresh options object.
  const optionsRef = useRef(options);

  useEffect(() => {
    const instance = L.map(containerRef.current, optionsRef.current);
    setMap(instance);
    return () => {
      instance.remove();
      setMap(null);
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={style}>
      {map ? (
        <MapContext.Provider value={map}>{children}</MapContext.Provider>
      ) : null}
    </div>
  );
};
