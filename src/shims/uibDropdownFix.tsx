export function uibDropdownFix() {
  return {
    restrict: 'A',
    require: {
      uibCtrl: 'uibDropdown',
    },
    link(scope, _, __, { uibCtrl }) {
      if (uibCtrl) {
        scope.$watch(() => uibCtrl.isOpen(), () => {
          if (uibCtrl.isOpen()) {
            const button = uibCtrl.toggleElement && uibCtrl.toggleElement[0];
            const dropdown = uibCtrl.dropdownMenu && uibCtrl.dropdownMenu[0];
            if (button && dropdown) {
              const { x, width } = button.getBoundingClientRect();
              const onRightSideOfScreen = window.innerWidth / 2 < x + width / 2;
              if ( onRightSideOfScreen ) {
                dropdown.style.left = 'auto';
                dropdown.style.right = '0';
              } else {
                dropdown.style.left = '0';
                dropdown.style.right = 'auto';
              }
            }
          }
        });
      }
    },
  };
}
