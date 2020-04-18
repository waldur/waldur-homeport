import baseControllerListClass from './base-list-controller';
import filterList from './filter-list';
import filterSelector from './filter-selector';
import responsiveTable from './responsive-table';

export default module => {
  module.service('baseControllerListClass', baseControllerListClass);
  module.directive('responsiveTable', responsiveTable);
  module.component('filterList', filterList);
  module.component('filterSelector', filterSelector);
};
