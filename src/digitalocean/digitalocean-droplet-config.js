export default {
  order: ['name', 'region', 'image', 'size', 'ssh_public_key', 'user_data'],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('VM name'),
      maxlength: 150,
    },
    region: {
      type: 'list',
      required: true,
      label: gettext('Region'),
      columns: [
        {
          name: 'name',
          label: gettext('Region name'),
        },
      ],
    },
    image: {
      type: 'list',
      required: true,
      label: gettext('Image'),
      columns: [
        {
          name: 'name',
          label: gettext('Image name'),
        },
        {
          name: 'is_official',
          label: gettext('Is official'),
        },
      ],
      formatter: imageFormatter,
    },
    size: {
      type: 'list',
      required: true,
      label: gettext('Size'),
      columns: [
        {
          name: 'name',
          label: gettext('Size name'),
        },
        {
          name: 'cores',
          label: gettext('vCPU'),
        },
        {
          name: 'ram',
          label: gettext('RAM'),
          filter: 'filesize',
        },
        {
          name: 'disk',
          label: gettext('Storage'),
          filter: 'filesize',
        },
      ],
      formatter: sizeFormatter,
    },
    ssh_public_key: {
      type: 'list',
      label: gettext('SSH public key'),
      columns: [
        {
          name: 'name',
          label: gettext('Name'),
        },
        {
          name: 'fingerprint',
          label: gettext('Fingerprint'),
        },
      ],
      warningMessage:
        'SSH public key is required for accessing a provisioned VM. You can add a key in your <a ui-sref="profile.keys">profile</a>.',
    },
    user_data: {
      type: 'text',
      label: gettext('User data'),
      help_text: gettext(
        'Additional data that will be added to instance on provisioning.',
      ),
    },
  },
  watchers: {
    region: regionWatcher,
  },
};

function validateAndSort(model, options, validator, comparator, name) {
  const choices = options[name].choices;
  angular.forEach(choices, choice => {
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

function imageFormatter($filter, value) {
  if (value.is_official) {
    return value.name + ' distribution';
  } else {
    return (
      value.name +
      ' snapshot created at ' +
      $filter('shortDate')(value.created_at)
    );
  }
}

function imageValidator(model, choice) {
  if (!model.region) {
    return true;
  }
  let region = model.region.url;
  let found = false;
  let regions = choice.regions || [choice.region];
  for (let j = 0; j < regions.length; j++) {
    let choice_region = regions[j];
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

function sizeFormatter($filter, value) {
  const ram = $filter('filesize')(value.ram);
  const storage = $filter('filesize')(value.disk);
  const props = `${value.cores} vCPU, ${ram} RAM, ${storage} storage`;
  return `${value.name} (${props})`;
}
