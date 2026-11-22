import { useMemo } from 'react';
import { Project } from 'waldur-js-client';

import { useMe, useOfferings, useProjectKeys, useServices } from './queries';
import {
  inferenceEndpoint,
  offeredModels,
  selectedModels,
  serviceModels,
} from './services';

/**
 * What every page of a project reads: its services, each with its endpoint
 * and models, and the project's keys, the user's own marked. Keys of
 * services the app does not count are left out.
 */
export const useInferenceData = (project: Project) => {
  const services = useServices(project.uuid);
  const keys = useProjectKeys(project.uuid);
  const me = useMe();
  const offeringUuids = useMemo(
    () => [...new Set((services.data ?? []).map((s) => s.offering_uuid))],
    [services.data],
  );
  const offerings = useOfferings(offeringUuids);

  return useMemo(() => {
    const list = (services.data ?? []).map((resource) => {
      const offering = offerings.byUuid.get(resource.offering_uuid);
      return {
        resource,
        /** The offering, for its components and plugin options. */
        offering,
        endpoint: inferenceEndpoint(resource, offering?.endpoints),
        models: serviceModels(
          offeredModels(offering?.resource_options),
          selectedModels(resource.options as Record<string, unknown>),
        ),
        keys: (keys.data ?? []).filter(
          (key) => key.resource_uuid === resource.uuid,
        ),
      };
    });
    const serviceUuids = new Set(list.map((item) => item.resource.uuid));
    const projectKeys = (keys.data ?? []).filter((key) =>
      serviceUuids.has(key.resource_uuid),
    );
    return {
      services: list,
      keys: projectKeys,
      myKeys: projectKeys.filter((key) => key.user_uuid === me.data?.uuid),
      me: me.data,
      // The offerings too: until they arrive a service seems to list no models.
      isLoading:
        services.isLoading ||
        keys.isLoading ||
        me.isLoading ||
        offerings.isLoading,
      isError: services.isError || keys.isError,
      refetch: () => {
        services.refetch();
        keys.refetch();
      },
    };
  }, [services, keys, me, offerings]);
};

export type InferenceService = ReturnType<
  typeof useInferenceData
>['services'][number];
