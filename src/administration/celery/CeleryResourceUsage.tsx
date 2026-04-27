import { AccordionCard } from '@/core/AccordionCard';
import { formatFilesize } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

interface CeleryResourceUsageProps {
  rusage: Record<string, number>;
}

const formatCpuTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return `${minutes}m ${remainingSeconds}s`;
};

export const CeleryResourceUsage = ({ rusage }: CeleryResourceUsageProps) => {
  return (
    <AccordionCard
      title={translate('Resource usage')}
      className="mb-6"
      defaultOpen={false}
    >
      <FormTable>
        <FormTable.Item
          label={translate('User CPU time')}
          value={formatCpuTime(rusage.utime)}
        />
        <FormTable.Item
          label={translate('System CPU time')}
          value={formatCpuTime(rusage.stime)}
        />
        <FormTable.Item
          label={translate('Max resident memory')}
          value={formatFilesize(rusage.maxrss, 'B')}
        />
        <FormTable.Item
          label={translate('Page faults (minor)')}
          value={rusage.minflt.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Page faults (major)')}
          value={rusage.majflt.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Block input operations')}
          value={rusage.inblock.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Block output operations')}
          value={rusage.oublock.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Messages sent')}
          value={rusage.msgsnd.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Messages received')}
          value={rusage.msgrcv.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Voluntary context switches')}
          value={rusage.nvcsw.toLocaleString()}
        />
        <FormTable.Item
          label={translate('Involuntary context switches')}
          value={rusage.nivcsw.toLocaleString()}
        />
      </FormTable>
    </AccordionCard>
  );
};
