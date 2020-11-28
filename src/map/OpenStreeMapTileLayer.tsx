import React from 'react';
import { TileLayer } from 'react-leaflet';

export const OpenStreeMapTileLayer: React.FC = (props) => (
  <TileLayer
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    {...props}
  />
);
