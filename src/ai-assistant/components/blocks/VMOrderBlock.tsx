import {
  CheckCircleIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AlertItem, Code } from 'waldur-ui';

import {
  BlockActionButton,
  BlockActions,
} from '@/ai-assistant/components/blocks/BlockActions';
import { SkeletonLoader } from '@/ai-assistant/components/shared/SkeletonLoader';
import { UIBlock, UIBlockProps } from '@/ai-assistant/lib/types';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Link } from '@/core/Link';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

// Utility: Generate avatar initials from VM name
const getInitials = (name: string): string => {
  const words = name.split('-').filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface VMPreviewCardProps {
  block: Partial<UIBlock>;
  flavor?: string;
  orderId?: string;
  success?: boolean;
  className?: string;
}

// Reusable VM preview card (avatar + name + project/org + specs details panel)
const VMPreviewCard: FC<VMPreviewCardProps> = ({
  block,
  flavor = block.flavor,
  orderId,
  success,
  className,
}) => {
  const {
    name,
    project,
    organization,
    image,
    network,
    ssh_key_name,
    system_volume_size,
  } = block;

  const detailItems = [
    { label: translate('Size'), value: flavor },
    { label: translate('OS'), value: image },
    { label: translate('Network'), value: network },
    { label: translate('SSH Key'), value: ssh_key_name },
    {
      label: translate('Volume'),
      value: system_volume_size ? `${system_volume_size} GB` : undefined,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <div
      className={classNames(
        'rounded-xl border p-4 transition-colors duration-200',
        success
          ? 'bg-success-subtle border-success-subtle'
          : 'bg-tertiary border-primary hover:bg-quaternary',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={classNames(
            'size-10 flex items-center justify-center rounded-full font-semibold text-xs shrink-0',
            success
              ? 'bg-[var(--status-success-bg-strong)] text-success'
              : 'bg-quaternary text-secondary',
          )}
        >
          {name ? getInitials(name) : 'VM'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-primary break-words">
            {orderId ? (
              <Link
                state="marketplace-orders.details"
                params={{ order_uuid: orderId }}
              >
                {name || translate('VM')}
              </Link>
            ) : (
              name || translate('VM')
            )}
          </div>
          {project && (
            <div className="text-xs text-tertiary break-words mt-0.5">
              {translate('Project')}: {project}
            </div>
          )}
          {organization && (
            <div className="text-xs text-tertiary break-words">
              {translate('Organization')}: {organization}
            </div>
          )}
        </div>
      </div>
      {detailItems.length > 0 && (
        <div className="mt-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs sm:text-sm divide-y divide-blue-200/60 dark:divide-blue-800/60">
          {detailItems.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0 gap-4"
            >
              <span className="font-medium opacity-75 shrink-0">{label}</span>
              <span className="font-semibold text-right truncate">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface SelectFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

const SelectFormField: FC<SelectFormFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-semibold text-primary mb-2">
      {label} <span className="text-danger">*</span>
    </label>
    <Select
      value={value ? options.find((opt) => opt.value === value) : null}
      onChange={(option: any) => onChange(option?.value || '')}
      options={options}
      placeholder={placeholder}
      isClearable
    />
  </div>
);

// Single-field select form (used for project_form and offering_form steps)
const SelectFormStep: FC<
  SelectFormFieldProps & {
    intro: string;
  }
> = ({ intro, ...fieldProps }) => (
  <div className="mb-4" data-has-actions="true">
    <div className="text-sm leading-[1.75] mb-2.5">{intro}</div>
    <div className="mt-5">
      <SelectFormField {...fieldProps} />
    </div>
  </div>
);

// Context to share form state between VMOrderBlock and VMOrderActions
interface VMOrderFormState {
  selectedFlavor: string;
  setSelectedFlavor: (value: string) => void;
  selectedImage: string;
  setSelectedImage: (value: string) => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedOffering: string;
  setSelectedOffering: (value: string) => void;
}

const VMOrderFormContext = createContext<VMOrderFormState | null>(null);

export const VMOrderFormProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedOffering, setSelectedOffering] = useState<string>('');

  const value = useMemo(
    () => ({
      selectedFlavor,
      setSelectedFlavor,
      selectedImage,
      setSelectedImage,
      selectedProject,
      setSelectedProject,
      selectedOffering,
      setSelectedOffering,
    }),
    [selectedFlavor, selectedImage, selectedProject, selectedOffering],
  );

  return (
    <VMOrderFormContext.Provider value={value}>
      {children}
    </VMOrderFormContext.Provider>
  );
};

const useVMOrderForm = () => {
  const context = useContext(VMOrderFormContext);
  if (!context) {
    // Return dummy state if context not available (shouldn't happen in normal flow)
    return {
      selectedFlavor: '',
      setSelectedFlavor: () => {},
      selectedImage: '',
      setSelectedImage: () => {},
      selectedProject: '',
      setSelectedProject: () => {},
      selectedOffering: '',
      setSelectedOffering: () => {},
    };
  }
  return context;
};

/**
 * VMOrderBlock component for displaying VM creation order.
 * Shows form mode (flavor/image selection), preview mode, or result state.
 */
export const VMOrderBlock: FC<UIBlockProps> = ({ block }) => {
  const { showSuccess } = useNotify();
  const {
    selectedFlavor,
    setSelectedFlavor,
    selectedImage,
    setSelectedImage,
    selectedProject,
    setSelectedProject,
    selectedOffering,
    setSelectedOffering,
  } = useVMOrderForm();

  // Show success notification when VM creation completes
  useEffect(() => {
    if (block.order_status === 'success' && !block.error) {
      showSuccess(translate('Operation completed successfully'));
    }
  }, [block.order_status, block.error]);

  const isLoading = block.status === 'loading';
  if (isLoading) {
    return (
      <div className="mb-4">
        <SkeletonLoader />
      </div>
    );
  }

  const hasError = !!block.error;
  // `order_status` is only set on the live path (blockManager renames the wire
  // `status` field). The audit log reads the raw persisted block where that
  // rename hasn't happened, so fall back to `order_id` — only present once
  // the VM creation has completed — as a result-state signal.
  const isResult =
    block.order_status === 'success' ||
    block.order_status === 'error' ||
    hasError ||
    !!block.order_id;

  // Project form mode - show project selector
  if (block.order_status === 'project_form' && block.projects) {
    return (
      <SelectFormStep
        intro={translate('Please select a project to create your VM in.')}
        label={translate('Project')}
        options={block.projects.map((p) => ({
          value: p.uuid,
          label: `${p.name} — ${p.organization}`,
        }))}
        value={selectedProject}
        onChange={setSelectedProject}
        placeholder={translate('Select a project...')}
      />
    );
  }

  // Offering form mode - show cloud provider selector
  if (block.order_status === 'offering_form' && block.offerings) {
    return (
      <SelectFormStep
        intro={translate('Please select a cloud provider for your VM.')}
        label={translate('Cloud provider')}
        options={block.offerings.map((o) => ({ value: o.uuid, label: o.name }))}
        value={selectedOffering}
        onChange={setSelectedOffering}
        placeholder={translate('Select a cloud provider...')}
      />
    );
  }

  // Form mode - show flavor/image selectors
  if (block.order_status === 'form' && block.flavors && block.images) {
    const hasFlavors = block.flavors.length > 0;
    const hasImages = block.images.length > 0;

    // Transform flavors into react-select options
    const flavorOptions = block.flavors.map((flavor) => ({
      value: flavor.name,
      label: `${flavor.name} (${flavor.cores} ${flavor.cores === 1 ? translate('vCPU') : translate('vCPUs')}, ${(flavor.ram / 1024).toFixed(0)} GB RAM)`,
    }));

    // Transform images into react-select options
    const imageOptions = block.images.map((image) => ({
      value: image.name,
      label: image.name,
    }));

    return (
      <div className="mb-4" data-has-actions="true">
        {/* Intro text */}
        <div className="text-sm leading-[1.75] mb-2.5">
          {translate('Please select a flavor and image for your VM.')}
        </div>

        {/* Section heading */}
        <h4 className="text-sm font-semibold text-primary mb-2.5">
          {translate('Configure your VM:')}
        </h4>

        {/* Preview-style card with avatar */}
        <VMPreviewCard block={block} flavor={undefined} className="mb-3" />

        {/* No options available message */}
        {(!hasFlavors || !hasImages) && (
          <AlertItem
            type="floating"
            variant="warning"
            title={(() => {
              if (!hasFlavors && !hasImages)
                return translate('No flavors or images available.');
              if (!hasFlavors) return translate('No flavors available.');
              return translate('No images available.');
            })()}
          />
        )}

        {/* Form fields */}
        {hasFlavors && hasImages && (
          <div className="mt-5 space-y-5">
            <SelectFormField
              label={translate('VM Size')}
              value={selectedFlavor}
              onChange={setSelectedFlavor}
              options={flavorOptions}
              placeholder={translate('Select a flavor...')}
            />
            <SelectFormField
              label={translate('Operating System')}
              value={selectedImage}
              onChange={setSelectedImage}
              options={imageOptions}
              placeholder={translate('Select an image...')}
            />
          </div>
        )}
      </div>
    );
  }

  // Result/Success state
  if (isResult) {
    return (
      <div className="mb-4">
        {/* Error state */}
        {hasError ? (
          <div className="p-5 rounded-md border border-danger-subtle bg-danger-subtle">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-8 flex items-center justify-center rounded-full shrink-0 bg-[var(--status-danger-bg-strong)] text-danger">
                <XCircleIcon size={24} weight="bold" />
              </div>
              <div className="text-sm font-semibold text-primary">
                {translate('VM Creation Failed')}
              </div>
            </div>

            {block.error && (
              <div className="flex items-start gap-2 p-3 bg-[var(--status-danger-bg-strong)] rounded-sm text-danger text-xs">
                <WarningCircleIcon
                  size={20}
                  weight="bold"
                  className="shrink-0 mt-0.5"
                />
                <span>{block.error}</span>
              </div>
            )}
          </div>
        ) : (
          // Success state - use preview-style card
          <>
            {block.message && (
              <div className="text-sm leading-[1.75] mb-2.5">
                {block.message}
              </div>
            )}
            <h4 className="text-sm font-semibold text-primary mb-2.5">
              {translate('VM order created successfully!')}
            </h4>
            {/* Preview-style card with avatar and badge */}
            <VMPreviewCard block={block} orderId={block.order_id} success />
            {/* Order ID with copy button */}
            {block.order_id && (
              <div className="flex items-center gap-2 py-3 px-4 bg-tertiary rounded-md border border-primary mt-2.5">
                <span className="text-xs font-semibold text-secondary">
                  {translate('Order ID')}:
                </span>
                <Link
                  state="marketplace-orders.details"
                  params={{ order_uuid: block.order_id }}
                >
                  <Code className="rounded-sm bg-primary px-1.5 py-1 text-xs leading-[inherit] text-primary">
                    {block.order_id}
                  </Code>
                </Link>
                <CopyToClipboardButton
                  value={block.order_id}
                  className="ms-1.5"
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Preview/Confirmation state
  return (
    <div className="mb-4" data-has-actions="true">
      {/* Section heading */}
      <h4 className="text-sm font-semibold text-primary mb-2.5">
        {translate('Here is the preview of changes:')}
      </h4>

      {/* Preview card */}
      <VMPreviewCard block={block} />

      {/* Confirmation question */}
      <div className="text-sm leading-[1.75] font-semibold mt-3">
        {translate('Do you confirm these changes?')}
      </div>
    </div>
  );
};

// Continue button — active when a prompt is provided, disabled otherwise
const ContinueButton: FC<{ prompt?: string }> = ({ prompt }) => (
  <BlockActionButton prompt={prompt} disabled={!prompt} variant="primary">
    <CheckCircleIcon size={16} weight="bold" />
    {translate('Continue')}
  </BlockActionButton>
);

// Reusable Modify button for both form and preview modes
const ModifyButton: FC = () => (
  <BlockActionButton
    prompt={translate('I want to modify VM configuration. What can i change?')}
    variant="secondary"
  >
    <PencilSimpleIcon size={16} weight="bold" />
    {translate('Modify')}
  </BlockActionButton>
);

/**
 * Renders action buttons for VM order preview/form state.
 * These are rendered outside the message content box in the footer.
 */
export const VMOrderActions: FC<UIBlockProps> = ({ block }) => {
  const { selectedFlavor, selectedImage, selectedProject, selectedOffering } =
    useVMOrderForm();

  // Hide actions once the order has finalized — success, failure, or any
  // path that already produced an order_id. Mirrors VMOrderBlock's isResult
  // check so the footer doesn't outlive the result card.
  if (
    block.order_status === 'success' ||
    block.order_status === 'error' ||
    block.error ||
    block.order_id
  ) {
    return null;
  }

  if (
    block.order_status === 'offering_form' ||
    block.order_status === 'project_form'
  ) {
    const prompt =
      block.order_status === 'offering_form'
        ? selectedOffering
          ? `offering_uuid: ${selectedOffering}`
          : undefined
        : selectedProject
          ? `project_uuid: ${selectedProject}`
          : undefined;

    return (
      <BlockActions>
        <ContinueButton prompt={prompt} />
      </BlockActions>
    );
  }

  return (
    <BlockActions>
      <ModifyButton />
      {block.order_status === 'form' ? (
        <ContinueButton
          prompt={
            selectedFlavor && selectedImage
              ? `I selected ${selectedFlavor} and ${selectedImage}`
              : undefined
          }
        />
      ) : (
        // Preview mode - Create button
        <BlockActionButton
          prompt={translate('proceed with creating the VM')}
          variant="primary"
        >
          <CheckCircleIcon size={16} weight="bold" />
          {translate('Create')}
        </BlockActionButton>
      )}
    </BlockActions>
  );
};
