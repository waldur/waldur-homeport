// leaflet does not load images correctly.
// see more details:
// https://github.com/PaulLeCam/react-leaflet/issues/255
// https://github.com/Leaflet/Leaflet/issues/4968
import L from 'leaflet';
// remove to avoid 414 error.
delete L.Icon.Default.prototype._getIconUrl;
// load missing images
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';

// register images
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'static/images/marker-icon-2x.png',
    iconUrl: 'static/images/marker-icon.png',
    shadowUrl: 'static/images/marker-shadow.png',
});
import 'angular-leaflet-directive';
export default 'leaflet-directive';
