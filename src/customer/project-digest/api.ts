import {
  customersProjectDigestConfigRetrieve,
  customersUpdateProjectDigestConfigUpdate,
  customersProjectDigestConfigPreview,
  customersProjectDigestConfigSendTest,
} from 'waldur-js-client';

export type { ProjectDigestConfig } from 'waldur-js-client';

export async function getProjectDigestConfig(customerUuid: string) {
  const response = await customersProjectDigestConfigRetrieve({
    path: { uuid: customerUuid },
  });
  return response.data;
}

export async function updateProjectDigestConfig(
  customerUuid: string,
  data: Record<string, unknown>,
) {
  const response = await customersUpdateProjectDigestConfigUpdate({
    path: { uuid: customerUuid },
    body: data as any,
  });
  return response.data;
}

export async function previewProjectDigest(
  customerUuid: string,
  projectUuid: string,
) {
  const response = await customersProjectDigestConfigPreview({
    path: { uuid: customerUuid },
    body: { project_uuid: projectUuid },
  });
  return response.data;
}

export async function sendTestDigest(customerUuid: string) {
  await customersProjectDigestConfigSendTest({
    path: { uuid: customerUuid },
  });
}
