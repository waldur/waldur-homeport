import baseControllerListClass from './base-list-controller';
import responsiveTable from './responsive-table';
import filterList from './filter-list';

export default module => {
  module.service('baseControllerListClass', baseControllerListClass);
  module.directive('responsiveTable', responsiveTable);
  module.directive('filterList', filterList);
};
