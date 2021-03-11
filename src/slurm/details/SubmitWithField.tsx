import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { getSlurmAssociations } from '@waldur/slurm/details/api';
import { SlurmAssociation } from '@waldur/slurm/details/types';

const formatSubmitDetails = (resource) => {
  const value = `sbatch -A ${resource.backend_id}`;
  return (
    <CopyToClipboardContainer
      value={value}
      label={
        <>
          {value}
          {resource.homepage ? (
            <a
              href={resource.homepage}
              target="_blank"
              rel="noopener noreferrer"
              title={translate('Batch processing documentation')}
            >
              &nbsp;
              <i className="fa fa-info-circle" />
            </a>
          ) : null}
        </>
      }
    />
  );
};
const checkAssociation = async (resource) => {
  const associations = await getSlurmAssociations(resource.uuid);
  return associations.find(
    (association: SlurmAssociation) =>
      association.username === resource.username,
  );
};

export const SubmitWithField: FunctionComponent<any> = ({ resource }) => {
  const { loading, error, value } = useAsync(() => {
    return checkAssociation(resource);
  }, [resource]);
  if (loading || error) {
    return null;
  }
  return (
    <div className={value ? 'field-container' : ''}>
      <Field
        label={translate('Submit with')}
        value={
          value
            ? formatSubmitDetails(resource)
            : translate('Your account is not authorized to use this allocation')
        }
      />
    </div>
  );
};
