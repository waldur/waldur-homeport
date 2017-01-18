## scrollToMe directive

Let's say you have a container with list of expandable items.
When last item of the menu is expanded, it's not visible because it is located outside of the viewport.
This directive allows to scroll container to the element on which you have clicked.

containerClass attribute is used for locating container by its class.

example:

    <div class="mobile-menu-side">
        <!-- A lot of items -->
        <a scroll-to-me container-class="mobile-menu-side" ng-click="showExpanded = !showExpanded">
          Click me
          <div ng-if="showExpanded">
            Submenu
          </div>
        </a>
    </div>
