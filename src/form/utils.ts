export const reactSelectMenuPortaling = (): any => ({
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed',
  menuPlacement: 'bottom',
});

export const datePickerOverlayContainerInDialogs = () => ({
  calendarPlacement: 'bottom',
  calendarContainer: document.getElementsByClassName('modal-dialog')[0],
});
