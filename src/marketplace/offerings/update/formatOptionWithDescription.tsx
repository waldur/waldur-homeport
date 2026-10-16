/** Pass as `formatOptionLabel`. Description is menu-only, so the control
 * stays one line high. */
export const formatOptionWithDescription = (
  option: { label: string; description?: string },
  meta: { context: 'menu' | 'value' },
) =>
  meta.context === 'menu' && option.description ? (
    <div className="flex flex-col">
      <span>{option.label}</span>
      <small className="text-quaternary">{option.description}</small>
    </div>
  ) : (
    option.label
  );
