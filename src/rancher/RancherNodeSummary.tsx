import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureResourceSummaryBase } from '@waldur/resource/summary';

import { KeyValueButton } from './KeyValueButton';

const PureRancherNodeSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Kubernetes version')}
        value={props.resource.k8s_version}
      />
      <Field
        label={translate('Docker version')}
        value={props.resource.docker_version}
      />
      <Field
        label={translate('CPU')}
        value={`${props.resource.cpu_allocated} / ${props.resource.cpu_total} cores`}
      />
      <Field
        label={translate('RAM')}
        value={`${props.resource.ram_allocated} / ${props.resource.ram_total} GiB`}
      />
      <Field
        label={translate('Pods')}
        value={`${props.resource.pods_allocated} / ${props.resource.pods_total}`}
      />
      <Field
        label={translate('Labels')}
        value={props.resource.labels && <KeyValueButton items={props.resource.labels}/>}
      />
      <Field
        label={translate('Annotations')}
        value={props.resource.annotations && <KeyValueButton items={props.resource.annotations}/>}
      />
    </>
  );
};

export const RancherNodeSummary = withTranslation(PureRancherNodeSummary);
