import { getAll } from '@waldur/core/api';

export const loadFormOptions = async (props: {
  settings_uuid: string;
  customer_uuid: string;
}) => {
  // tslint:disable: variable-name
  const settings_uuid = props.settings_uuid;
  const customer_uuid = props.customer_uuid;

  const templates = await getAll('/vmware-templates/', {params: {settings_uuid}});
  const clusters = await getAll('/vmware-clusters/', {params: {settings_uuid, customer_uuid}});

  return {templates, clusters};
};
