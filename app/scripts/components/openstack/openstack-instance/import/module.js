import registerImportEndpoint from './register-import-endpoint';

export default module => {
  module.run(registerImportEndpoint);
};
