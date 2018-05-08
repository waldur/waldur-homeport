import routes from './routes';
import productGrid from './IndexPage';

export default module => {
  module.component('productGrid', productGrid);
  module.config(routes);
};
