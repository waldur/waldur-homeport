import { fillFeatures } from './features';
import { products as rawProducts } from './products';
export { providers } from './providers';
export { categories } from './categories';
export { sections } from './sections';

export const products = rawProducts.map(fillFeatures);
