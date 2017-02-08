import actionDialog from './action-dialog';
import actionField from './action-field';
import actionFieldBoolean from './action-field-boolean';
import actionFieldDatetime from './action-field-datetime';
import actionFieldInteger from './action-field-integer';
import actionFieldMultiselect from './action-field-multiselect';
import actionFieldSelect from './action-field-select';
import actionFieldString from './action-field-string';
import actionFieldText from './action-field-text';
import actionFieldChoice from './action-field-choice';

export default module => {
  module.directive('actionDialog', actionDialog);
  module.directive('actionField', actionField);
  module.component('actionFieldBoolean', actionFieldBoolean);
  module.component('actionFieldDatetime', actionFieldDatetime);
  module.component('actionFieldInteger', actionFieldInteger);
  module.component('actionFieldMultiselect', actionFieldMultiselect);
  module.component('actionFieldSelect', actionFieldSelect);
  module.component('actionFieldString', actionFieldString);
  module.component('actionFieldText', actionFieldText);
  module.component('actionFieldChoice', actionFieldChoice);
};
