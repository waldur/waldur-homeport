import geojson from 'geojson';
import { Layer } from 'leaflet';

import { CanvasFlowmapLayer } from './CanvasFlowmapLayer';
import { UsageData } from './types';

const composeFeatureCollection = (
  data: UsageData,
): geojson.FeatureCollection => ({
  type: 'FeatureCollection',
  features: data.usage.reduce((features, entry) => {
    const provider_uuid = entry.provider_to_consumer.provider_uuid;
    const consumer_uuid = entry.provider_to_consumer.consumer_uuid;
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          data.organizations[provider_uuid].longitude,
          data.organizations[provider_uuid].latitude,
        ],
      },
      properties: {
        ...entry.provider_to_consumer,
        provider_longitude: data.organizations[provider_uuid].longitude,
        provider_latitude: data.organizations[provider_uuid].latitude,
        consumer_longitude: data.organizations[consumer_uuid].longitude,
        consumer_latitude: data.organizations[consumer_uuid].latitude,
        consumer_name: data.organizations[consumer_uuid].name,
      },
    });
    return features;
  }, []),
});

export const getFlowmapLayer = (data: UsageData): Layer =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  new CanvasFlowmapLayer(composeFeatureCollection(data), {
    originAndDestinationFieldIds: {
      originUniqueIdField: 'provider_uuid',
      originGeometry: {
        x: 'provider_longitude',
        y: 'provider_latitude',
      },
      destinationUniqueIdField: 'consumer_uuid',
      destinationGeometry: {
        x: 'consumer_longitude',
        y: 'consumer_latitude',
      },
    },
    pathDisplayMode: 'all',
    animationStarted: true,
    animationEasingFamily: 'Cubic',
    animationEasingType: 'In',
    animationDuration: 2000,
  });
