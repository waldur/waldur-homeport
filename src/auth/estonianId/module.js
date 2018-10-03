import authEstonianId from './auth-estonian-id';
import estonianIdLogout from './auth-estonian-id-logout';

export default module => {
  module.component('authEstonianId', authEstonianId);
  module.run(estonianIdLogout);
};
