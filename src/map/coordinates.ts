/**
 * Formatting of stored geographic coordinates for read-only display.
 *
 * Both `latitude` and `longitude` are `double precision` on the backend and the
 * geocoder hands back seven decimal places, which is more precision than anyone
 * reads. Six decimals is about 0.1 m — enough to identify a building.
 */
import { GeolocationPoint } from './types';

const COORDINATE_PRECISION = 6;

const formatCoordinate = (value: number): string =>
  value.toFixed(COORDINATE_PRECISION);

const hasCoordinates = (point: Partial<GeolocationPoint>): boolean =>
  typeof point?.latitude === 'number' && typeof point?.longitude === 'number';

export const formatCoordinates = (
  point: Partial<GeolocationPoint>,
): string | null =>
  hasCoordinates(point)
    ? `${formatCoordinate(point.latitude)}, ${formatCoordinate(point.longitude)}`
    : null;
