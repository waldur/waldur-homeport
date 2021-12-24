import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapContainer, Marker, Popup } from 'react-leaflet';

import { translate } from '@waldur/i18n';
import { CustomMarkerIcon } from '@waldur/map/CustomMarkerIcon';

import { GeoSearchControlElement } from './GeoSearchControlElement';
import { OpenStreetMapTileLayer } from './OpenStreetMapTileLayer';
import './SetLocationDialog.scss';

const provider = new OpenStreetMapProvider();

export const LocationContainer = ({ input: { value, onChange }, ...props }) => {
  return (
    <MapContainer
      center={[value.latitude || 0, value.longitude || 0]}
      zoom={value.latitude && value.longitude ? 10 : 2}
      zoomControl={true}
      worldCopyJump={true}
    >
      <OpenStreetMapTileLayer />
      {value.latitude && value.longitude ? (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={CustomMarkerIcon()}
        >
          <Popup>{props.label}</Popup>
        </Marker>
      ) : null}
      <GeoSearchControlElement
        provider={provider}
        style={'bar'}
        showMarker={true}
        showPopup={true}
        popupFormat={({ result }) => result.label}
        maxMarkers={1}
        retainZoomLevel={true}
        animateZoom={true}
        autoClose={true}
        autoComplete={true}
        searchLabel={translate('Enter address...')}
        keepResult={false}
        updateMap={true}
        onLocationFound={(loc) => {
          onChange({ latitude: loc.lat, longitude: loc.lng });
        }}
      />
    </MapContainer>
  );
};
