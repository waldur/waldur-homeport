import Axios from 'axios';

export const fetchResource = url => Axios.get(url);
