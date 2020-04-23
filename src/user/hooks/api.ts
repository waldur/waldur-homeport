import Axios from 'axios';

export const removeHook = (url: string) => Axios.delete(url);
