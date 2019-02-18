import helpRoutes from './routes';
import helpList from './help-list';
import helpDetails from './help-details';
import helpLink from './HelpLink';
import helpContentOneColumn from './help-content-one-column';
import helpContentTwoColumn from './help-content-two-column';
import imageBox from './image-box';

export default module => {
  module.config(helpRoutes);
  module.component('helpList', helpList);
  module.component('helpDetails', helpDetails);
  module.component('helpLink', helpLink);
  module.component('helpContentOneColumn', helpContentOneColumn);
  module.component('helpContentTwoColumn', helpContentTwoColumn);
  module.component('imageBox', imageBox);
};
