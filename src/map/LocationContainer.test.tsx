import { render, within } from '@testing-library/react';
import { GeoSearchControl } from 'leaflet-geosearch';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotifyService } from '@/store/notify';

import { LocationContainer } from './LocationContainer';

const map = vi.hoisted(() => ({
  addControl: vi.fn(),
  removeControl: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  setZoom: vi.fn(),
}));

vi.mock('leaflet-geosearch', () => ({
  GeoSearchControl: vi.fn(() => ({ markers: { remove: vi.fn() } })),
  OpenStreetMapProvider: vi.fn(),
}));

vi.mock('./MapContext', () => ({ useMap: () => map }));

vi.mock('./MapContainer', () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
}));

vi.mock('./OpenStreetMapTileLayer', () => ({
  OpenStreetMapTileLayer: () => null,
}));

vi.mock('./Marker', () => ({ Marker: () => null, Popup: () => null }));

const renderLocation = (onChange = vi.fn(), value = {}) => {
  const view = render(
    <LocationContainer input={{ value, onChange }} label="Here" />,
  );
  return { ...view, onChange };
};

const controlOptions = () => vi.mocked(GeoSearchControl).mock.calls[0][0];

const pickResult = (lat: number, lng: number) => {
  const [, onLayerAdd] = map.on.mock.calls.find(
    ([event]) => event === 'layeradd',
  );
  onLayerAdd({ layer: { _latlng: { lat, lng } } });
};

describe('LocationContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // The public Nominatim server forbids autocomplete: a search may only be
  // sent when the user asks for one.
  it('searches only on Enter, and says so', () => {
    renderLocation();

    expect(controlOptions()).toMatchObject({
      autoComplete: false,
      searchLabel: 'Type an address and press Enter',
    });
    expect(map.addControl).toHaveBeenCalled();
  });

  it('gives the control a result list it can clear on submit', () => {
    renderLocation();

    const control = vi.mocked(GeoSearchControl).mock.results[0].value;
    expect(() => control.resultList.clear()).not.toThrow();
  });

  it('sets the coordinates of the result the user picks', () => {
    const { onChange } = renderLocation();

    pickResult(59.43, 24.75);

    expect(onChange).toHaveBeenCalledWith({
      latitude: 59.43,
      longitude: 24.75,
    });
  });

  it('keeps one control across re-renders, calling the latest onChange', () => {
    const { rerender } = renderLocation();
    const onChange = vi.fn();

    rerender(
      <LocationContainer
        input={{ value: { latitude: 1, longitude: 2 }, onChange }}
        label="Here"
      />,
    );
    pickResult(59.43, 24.75);

    expect(GeoSearchControl).toHaveBeenCalledTimes(1);
    expect(map.removeControl).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({
      latitude: 59.43,
      longitude: 24.75,
    });
  });

  it('removes the control and its markers when it unmounts', () => {
    const { unmount } = renderLocation();
    const control = vi.mocked(GeoSearchControl).mock.results[0].value;

    unmount();

    expect(map.removeControl).toHaveBeenCalledWith(control);
    expect(control.markers.remove).toHaveBeenCalled();
  });

  it('shows a result label in the popup as text, not markup', () => {
    renderLocation();
    const label = '<img src=x onerror=alert(1)>Tartu';

    // Leaflet sets string popup content as innerHTML.
    const popup = document.createElement('div');
    popup.innerHTML = controlOptions().popupFormat({
      query: { query: 'Tartu' },
      result: { label } as any,
    });

    expect(within(popup).queryByRole('img')).toBeNull();
    expect(within(popup).getByText(label)).toBeTruthy();
  });
});

describe('Location search feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The page-wide provider the control searches with.
  const searchWith = async (query: string, answer: () => Promise<unknown>) => {
    renderLocation();
    const provider = controlOptions().provider;
    vi.spyOn(provider as any, 'request').mockImplementationOnce(answer);
    const search = provider.search({ query });
    await vi.runAllTimersAsync();
    return search;
  };

  it('says when a search finds nothing', async () => {
    expect(await searchWith('Atlantis', () => Promise.resolve([]))).toEqual([]);
    expect(NotifyService.info).toHaveBeenCalledWith(
      'No location found for this address.',
    );
    expect(NotifyService.error).not.toHaveBeenCalled();
  });

  it('says when location search fails', async () => {
    expect(
      await searchWith('Lemuria', () => Promise.reject(new Error('offline'))),
    ).toEqual([]);
    expect(NotifyService.error).toHaveBeenCalledWith(
      'Location search is unavailable right now. Try again later.',
    );
    expect(NotifyService.info).not.toHaveBeenCalled();
  });
});
