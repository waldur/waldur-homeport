import * as React from 'react';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import { SearchControl } from '@waldur/core/react-leaflet-geosearch/GeoSearchControl';
import OpenStreetMapProvider from '@waldur/core/react-leaflet-geosearch/openStreetMapProvider.js';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import './SetLocationDialog.scss';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Data extends Coordinates {
  uuid: string;
  name: string;
}

interface SetLocationDialogProps {
  resolve: { data: Data; setLocationFn: (data) => void };
}

export const SetLocationDialog = (props: SetLocationDialogProps) => {
  const [coordinates, setCoordinates] = useState<Coordinates>({
    latitude: props.resolve.data.latitude,
    longitude: props.resolve.data.longitude,
  });
  const prov = OpenStreetMapProvider();
  const GeoSearchControlElement = SearchControl;

  return (
    <ModalDialog
      title={
        props.resolve.data.latitude && props.resolve.data.latitude
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
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        <GeoSearchControlElement
          provider={prov}
          showMarker={true}
          showPopup={false}
          popupFormat={({ result }) => result.label}
          maxMarkers={1}
          retainZoomLevel={true}
          animateZoom={true}
          autoClose={false}
          searchLabel={translate('Enter address...')}
          keepResult={false}
          onLocationFound={(loc) => {
            setCoordinates({ latitude: loc.lat, longitude: loc.lng });
          }}
        />
      </MapContainer>
    </ModalDialog>
  );
};
