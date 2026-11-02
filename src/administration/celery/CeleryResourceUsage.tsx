import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

interface CeleryResourceUsageProps {
  rusage: Record<string, number>;
}

export const CeleryResourceUsage = ({ rusage }: CeleryResourceUsageProps) => {
  return (
    <AccordionCard
      title={translate('Resource usage')}
      className="mb-5"
      defaultOpen={false}
    >
      <PropertyList>
        <PropertyItem
          label={translate('User CPU time')}
          value={propVal.duration(rusage.utime)}
        />
        <PropertyItem
          label={translate('System CPU time')}
          value={propVal.duration(rusage.stime)}
        />
        <PropertyItem
          label={translate('Max resident memory')}
          value={propVal.fileSize(rusage.maxrss)}
        />
        <PropertyItem
          label={translate('Page faults (minor)')}
          value={propVal.count(rusage.minflt)}
        />
        <PropertyItem
          label={translate('Page faults (major)')}
          value={propVal.count(rusage.majflt)}
        />
        <PropertyItem
          label={translate('Block input operations')}
          value={propVal.count(rusage.inblock)}
        />
        <PropertyItem
          label={translate('Block output operations')}
          value={propVal.count(rusage.oublock)}
        />
        <PropertyItem
          label={translate('Messages sent')}
          value={propVal.count(rusage.msgsnd)}
        />
        <PropertyItem
          label={translate('Messages received')}
          value={propVal.count(rusage.msgrcv)}
        />
        <PropertyItem
          label={translate('Voluntary context switches')}
          value={propVal.count(rusage.nvcsw)}
        />
        <PropertyItem
          label={translate('Involuntary context switches')}
          value={propVal.count(rusage.nivcsw)}
        />
      </PropertyList>
    </AccordionCard>
  );
};
