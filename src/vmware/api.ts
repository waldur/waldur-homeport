import { getAll } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';

export const loadFormOptions = async (props: {
  settings_uuid: string;
  customer_uuid: string;
}) => {
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;

  const options = {
    params: {
      settings_uuid: props.settings_uuid,
      customer_uuid: props.customer_uuid,
    },
  };

  if (advancedMode) {
    const [
      templates,
      clusters,
      datastores,
      networks,
      folders,
    ] = await Promise.all([
      getAll('/vmware-templates/', options),
      getAll('/vmware-clusters/', options),
      getAll('/vmware-datastores/', options),
      getAll('/vmware-networks/', options),
      getAll('/vmware-folders/', options),
    ]);

    return {
      templates,
      clusters,
      datastores,
      networks,
      folders,
    };
  } else {
    const templates = await getAll('/vmware-templates/', options);
    return {templates};
  }
};
