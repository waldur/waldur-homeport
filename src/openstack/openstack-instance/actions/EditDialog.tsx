import { FC } from 'react';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { updateInstance } from '@waldur/openstack/api';
import { createDescriptionField } from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

const MAX_LEN = 150;

const DNS_LABEL_REGEX = new RegExp('^([a-zA-Z0-9-]{1,63})$');

const validateInstanceName = (data: string) => {
  if (!data) {
    return;
  }
  // A trailing period is allowed to indicate that a name is fully
  // qualified per RFC 1034 (page 7).
  const trimmed = data.endsWith('.') ? data.slice(0, -1) : data;
  if (trimmed.length > MAX_LEN) {
    return translate("'{trimmed}' exceeds the {maxlen} character FQDN limit", {
      trimmed,
      maxlen: MAX_LEN,
    });
  }

  const labels = trimmed.split('.');
  for (const label in labels) {
    if (!label) {
      return translate('Encountered an empty component');
    }
    if (label.endsWith('-') || label.startsWith('-')) {
      return translate("Name '{label}' must not start or end with a hyphen", {
        label,
      });
    }
    if (!DNS_LABEL_REGEX.test(label)) {
      return translate(
        "Name '{label}' must be 1-63 characters long, each of which can only be alphanumeric or a hyphen",
        { label },
      );
    }
  }
  // RFC 1123 hints that a TLD can't be all numeric. last is a TLD if it's an FQDN.
  if (labels.length > 1 && /^[0-9]+$/.test(labels[-1])) {
    return translate("TLD '{label}' must not be all numeric", {
      label: labels[-1],
    });
  }
};

const createInstanceNameField = () => ({
  name: 'name',
  label: translate('Name'),
  maxlength: 150,
  required: true,
  type: 'string',
  validate: [required, validateInstanceName],
});

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={[createInstanceNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={updateInstance}
      refetch={refetch}
      verboseName={translate('OpenStack instance')}
    />
  );
};
