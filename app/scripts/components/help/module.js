import helpRoutes from './routes';
import helpList from './help-list';
import helpDetails from './help-details';
import imageBox from './image-box';

export default module => {
  module.config(helpRoutes);
  module.component('helpList', helpList);
  module.component('helpDetails', helpDetails);
  module.component('imageBox', imageBox);
};
