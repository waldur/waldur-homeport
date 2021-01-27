import * as L from 'leaflet';

const iconBlue = require('@waldur/images/marker-icon-blue.png');

export const CustomMarkerIcon = () =>
  L.icon({
    iconUrl: iconBlue,
    iconSize: [50, 50],
    iconAnchor: [22, 53],
    popupAnchor: [3, -50],
  });
