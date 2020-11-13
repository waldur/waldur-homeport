import { OpenStreetMapProvider as LeafletOpenStreetMapProvider } from 'leaflet-geosearch';

const OpenStreetMapProvider = () => new LeafletOpenStreetMapProvider();
export default OpenStreetMapProvider;
