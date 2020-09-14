import { connectAngularComponent } from '@waldur/store/connect';

import actionDialog from './action-dialog';
import actionFieldBoolean from './action-field-boolean';
import actionFieldChoice from './action-field-choice';
import actionFieldDecimal from './action-field-decimal';
import actionFieldInteger from './action-field-integer';
import actionFieldMultiselect from './action-field-multiselect';
import actionFieldSelect from './action-field-select';
import actionFieldString from './action-field-string';
import actionFieldText from './action-field-text';
import actionField from './ActionField';
import { FieldLabel } from './FieldLabel';
import { HelpIcon } from './HelpIcon';
import multiplyBy from './multiply-by';

export default (module) => {
  module.directive('actionDialog', actionDialog);
  module.component('actionField', actionField);
  module.component('actionFieldBoolean', actionFieldBoolean);
  module.component('actionFieldInteger', actionFieldInteger);
  module.component('actionFieldDecimal', actionFieldDecimal);
  module.component('actionFieldMultiselect', actionFieldMultiselect);
  module.component('actionFieldSelect', actionFieldSelect);
  module.component('actionFieldString', actionFieldString);
  module.component('actionFieldText', actionFieldText);
  module.component('actionFieldChoice', actionFieldChoice);
  module.component('helpicon', connectAngularComponent(HelpIcon, ['helpText']));
  module.directive('multiplyBy', multiplyBy);
  module.component(
    'fieldLabel',
    connectAngularComponent(FieldLabel, ['field']),
  );
};
