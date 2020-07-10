import { formatDate } from '@waldur/core/dateUtils';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

function imageFormatter(value) {
  if (value.is_official) {
    return value.name + ' distribution';
  } else {
    return value.name + ' snapshot created at ' + formatDate(value.created_at);
  }
}

function imageValidator(model, choice) {
  if (!model.region) {
    return true;
  }
  const region = model.region.url;
  let found = false;
  const regions = choice.regions || [choice.region];
  for (let j = 0; j < regions.length; j++) {
    const choice_region = regions[j];
    if (choice_region.url === region) {
      found = true;
      break;
    }
  }
  return !found;
}

function imageComparator(a, b) {
  if (a.disabled < b.disabled) return -1;
  if (a.disabled > b.disabled) return 1;

  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;

  return 0;
}

function sizeComparator(a, b) {
  if (a.disabled < b.disabled) return -1;
  if (a.disabled > b.disabled) return 1;

  if (a.cores > b.cores) return 1;
  if (a.cores < b.cores) return -1;

  if (a.ram > b.ram) return 1;
  if (a.ram < b.ram) return -1;

  if (a.disk > b.disk) return 1;
  if (a.disk < b.disk) return -1;

  return 0;
}

const sizeValidator = imageValidator;

function sizeFormatter(value) {
  const ram = formatFilesize(value.ram);
  const storage = formatFilesize(value.disk);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}

function validateAndSort(model, options, validator, comparator, name) {
  const choices = options[name].choices;
  choices.forEach((choice) => {
    choice.disabled = validator(model, choice);
  });
  choices.sort(comparator);
  if (model[name] && model[name].disabled) {
    model[name] = null;
  }
}

function regionWatcher(model, options) {
  validateAndSort(model, options, imageValidator, imageComparator, 'image');
  validateAndSort(model, options, sizeValidator, sizeComparator, 'size');
}

export default {
  order: ['name', 'region', 'image', 'size', 'ssh_public_key', 'user_data'],
  options: {
    name: {
      type: 'string',
      required: true,
      label: translate('VM name'),
      maxlength: 150,
    },
    region: {
      type: 'list',
      required: true,
      label: translate('Region'),
      columns: [
        {
          name: 'name',
          label: translate('Region name'),
        },
      ],
    },
    image: {
      type: 'list',
      required: true,
      label: translate('Image'),
      columns: [
        {
          name: 'name',
          label: translate('Image name'),
        },
        {
          name: 'is_official',
          label: translate('Is official'),
        },
      ],
      formatter: imageFormatter,
    },
    size: {
      type: 'list',
      required: true,
      label: translate('Size'),
      columns: [
        {
          name: 'name',
          label: translate('Size name'),
        },
        {
          name: 'cores',
          label: translate('vCPU'),
        },
        {
          name: 'ram',
          label: translate('RAM'),
          filter: 'filesize',
        },
        {
          name: 'disk',
          label: translate('Storage'),
          filter: 'filesize',
        },
      ],
      formatter: sizeFormatter,
    },
    ssh_public_key: {
      type: 'list',
      label: translate('SSH public key'),
      columns: [
        {
          name: 'name',
          label: translate('Name'),
        },
        {
          name: 'fingerprint',
          label: translate('Fingerprint'),
        },
      ],
      warningMessage:
        'SSH public key is required for accessing a provisioned VM. You can add a key in your <a ui-sref="profile.keys">profile</a>.',
    },
    user_data: {
      type: 'text',
      label: translate('User data'),
      help_text: translate(
        'Additional data that will be added to instance on provisioning.',
      ),
    },
  },
  watchers: {
    region: regionWatcher,
  },
};
