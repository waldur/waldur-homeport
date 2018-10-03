import baseControllerListClass from './base-list-controller';
import responsiveTable from './responsive-table';
import filterList from './filter-list';
import filterSelector from './filter-selector';
import TableExtensionService from './table-extension-service';

export default module => {
  module.service('baseControllerListClass', baseControllerListClass);
  module.service('TableExtensionService', TableExtensionService);
  module.directive('responsiveTable', responsiveTable);
  module.component('filterList', filterList);
  module.component('filterSelector', filterSelector);
};
