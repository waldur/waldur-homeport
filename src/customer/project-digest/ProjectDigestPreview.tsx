import { useMutation } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ProjectDigestPreviewResponse } from 'waldur-js-client';

import { FormattedHtml } from '@/core/FormattedHtml';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';

import { useCustomerProjects } from '../workspace/fetchCustomer';

import { previewProjectDigest } from './api';

interface ProjectDigestPreviewProps {
  customerUuid: string;
}

export const ProjectDigestPreview: FC<ProjectDigestPreviewProps> = ({
  customerUuid,
}) => {
  const customer = useCustomer();
  const { showErrorResponse } = useNotify();
  const { loading: projectsLoading } = useCustomerProjects();
  const [preview, setPreview] = useState<ProjectDigestPreviewResponse | null>(
    null,
  );

  const projects = useMemo(() => customer?.projects ?? [], []);

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
      showErrorResponse(
        error as any,
        translate('Unable to load digest preview.'),
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
