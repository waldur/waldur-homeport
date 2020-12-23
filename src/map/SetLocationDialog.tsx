import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { FunctionComponent, useState } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { GeoSearchControlElement } from './GeoSearchControlElement';
import { OpenStreeMapTileLayer } from './OpenStreeMapTileLayer';
import './SetLocationDialog.scss';
import { GeolocationPoint } from './types';

interface Data extends GeolocationPoint {
  uuid: string;
  name: string;
}

interface SetLocationDialogProps {
  resolve: { data: Data; setLocationFn: (data: Data) => void };
}

const provider = new OpenStreetMapProvider();

export const SetLocationDialog: FunctionComponent<SetLocationDialogProps> = (
  props,
) => {
  const [coordinates, setCoordinates] = useState<GeolocationPoint>({
    latitude: props.resolve.data.latitude,
    longitude: props.resolve.data.longitude,
  });

  return (
    <ModalDialog
      title={
        props.resolve.data.latitude && props.resolve.data.longitude
          ? translate('Update location')
          : translate('Set location')
      }
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={false}
            label={translate('Save')}
            onClick={() => {
              props.resolve.setLocationFn({
                uuid: props.resolve.data.uuid,
                name: props.resolve.data.name,
                ...coordinates,
              });
            }}
          />
        </>
      }
    >
      <MapContainer
        center={[
          props.resolve.data.latitude || 0,
          props.resolve.data.longitude || 0,
        ]}
        zoom={
          props.resolve.data.latitude && props.resolve.data.longitude ? 10 : 2
        }
        zoomControl={true}
        worldCopyJump={true}
      >
        {coordinates.latitude && coordinates.longitude ? (
          <Marker position={[coordinates.latitude, coordinates.longitude]}>
            <Popup>
              {translate('Location of {offeringName} offering', {
                offeringName: props.resolve.data.name,
              })}
            </Popup>
          </Marker>
        ) : null}
        <OpenStreeMapTileLayer />
        <GeoSearchControlElement
          provider={provider}
          showMarker={true}
          showPopup={true}
          popupFormat={({ result }) => result.label}
          maxMarkers={1}
          retainZoomLevel={true}
          animateZoom={true}
          autoClose={false}
          searchLabel={translate('Enter address...')}
          keepResult={false}
          updateMap={true}
          onLocationFound={(loc) => {
            setCoordinates({ latitude: loc.lat, longitude: loc.lng });
          }}
        />
      </MapContainer>
    </ModalDialog>
  );
};
