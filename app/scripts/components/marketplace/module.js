import routes from './routes';
import productGrid from './ProductGrid';

export default module => {
  module.component('productGrid', productGrid);
  module.config(routes);
};
