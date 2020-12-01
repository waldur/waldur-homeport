import geojson from 'geojson';
import { LatLngTuple, Layer } from 'leaflet';
import React from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { OpenStreeMapTileLayer } from '@waldur/map/OpenStreeMapTileLayer';

import { countryInfo } from './countryInfo';
import './HeatMap.scss';
import { getStyle, getChartData } from './HeatMapCalculator';
import { UsageData } from './types';

/*Source: https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json */

const loadCountries = () =>
  import(/* webpackChunkName: "countries" */ './countries.geo.json');

interface HeatMapProps {
  center?: LatLngTuple;
  zoom?: number;
  serviceUsage: UsageData;
  countriesToRender: string[];
}

const onEachFeature = (feature: geojson.Feature, layer: Layer) => {
  layer.bindPopup(countryInfo({ data: feature.properties.data }));
};

export const HeatMap: React.FC<HeatMapProps> = (props) => {
  const { loading, value } = useAsync(async () => {
    const module = await loadCountries();
    return getChartData(
      props.serviceUsage,
      props.countriesToRender,
      module.default.features as geojson.Feature[],
    );
  }, [props.serviceUsage, props.countriesToRender]);

  if (loading) {
    return <LoadingSpinner />;
  } else if (value) {
    return (
      <MapContainer id="heat-map" center={props.center} zoom={props.zoom}>
        <OpenStreeMapTileLayer />
        {value.map((data, index) => (
          <GeoJSON
            key={index}
            data={data}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        ))}
      </MapContainer>
    );
  } else {
    return null;
  }
};
