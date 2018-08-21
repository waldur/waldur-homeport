import { registerFormComponent } from '@waldur/marketplace/common/registry';
import { OpenStackPackageForm } from '@waldur/openstack/OpenStackPackageForm';

registerFormComponent('Packages.Template', OpenStackPackageForm);
