/**
 * A wizard dialog's body: the step indicator above the step content, with
 * the modal body's own padding removed (WizardModal) so the indicator runs
 * edge to edge and the content brings its own insets.
 */
export const WIZARD_BODY_CLASSNAME = 'block w-full overflow-hidden';

export const WIZARD_CONTENT_CLASSNAME =
  'relative block min-h-30 overflow-hidden px-6 pt-3 pb-6';

/** The step panel beside a vertical stepper, as on a full-page wizard. */
export const WIZARD_VERTICAL_BODY_CLASSNAME = 'block min-h-80';
