import './provider';
import sqlModule from './sql/module';
import vmModule from './vm/module';

export default module => {
  sqlModule(module);
  vmModule(module);
};
