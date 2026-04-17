import { useMutation } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectDigestPreviewResponse } from 'waldur-js-client';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { useCustomerProjects } from '../workspace/fetchCustomer';

import { previewProjectDigest } from './api';

interface ProjectDigestPreviewProps {
  customerUuid: string;
}

export const ProjectDigestPreview: FC<ProjectDigestPreviewProps> = ({
  customerUuid,
}) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const { loading: projectsLoading } = useCustomerProjects();
  const [preview, setPreview] = useState<ProjectDigestPreviewResponse | null>(
    null,
  );

  const projects = useMemo(
    () => customer?.projects ?? [],
    [customer?.projects],
  );

  const {
    mutate: loadPreview,
    isPending,
    reset,
  } = useMutation({
    mutationFn: (projectUuid: string) =>
      previewProjectDigest(customerUuid, projectUuid),
    onSuccess: (data) => {
      setPreview(data);
    },
    onError: (error) => {
      setPreview(null);
      dispatch(
        showErrorResponse(
          error as any,
          translate('Unable to load digest preview.'),
        ),
      );
    },
  });

  const handleProjectChange = (project) => {
    if (project) {
      reset();
      setPreview(null);
      loadPreview(project.uuid);
    } else {
      setPreview(null);
    }
  };

  return (
    <>
      <div className="mb-5">
        <Form.Label>
          {translate('Select a project to preview the digest')}
        </Form.Label>
        <Select
          options={projects}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.uuid}
          onChange={handleProjectChange}
          isLoading={projectsLoading}
          isClearable
          placeholder={translate('Select project...')}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </div>

      {isPending && <LoadingSpinner />}

      {preview && !isPending && (
        <div
          className="rounded shadow-sm p-6"
          style={{ backgroundColor: '#fff', color: '#333' }}
        >
          <FormattedHtml html={preview.html_body} />
        </div>
      )}
    </>
  );
};
