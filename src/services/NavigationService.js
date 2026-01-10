const React = require('react');
const { createNavigationContainerRef, TabActions } = require('@react-navigation/native');

const navigationRef = createNavigationContainerRef();
let tabRefManual = null;

/**
 * Allows the TabNavigator to register itself so we can 
 * send imperative jump commands directly to it.
 */
function registerTabRef(ref) {
  tabRefManual = ref;
}

/**
 * Switches to a specific tab within the nested Tab Navigator.
 * If the tabRef is available, we use jumpTo for an imperative transition (better for mobile).
 * Fallback to nested navigate if not available.
 */
function jumpToTab(tabName) {
  if (tabRefManual) {
    tabRefManual.dispatch(TabActions.jumpTo(tabName));
    return;
  }

  if (navigationRef.isReady()) {
    navigationRef.navigate('Drawer', { 
      screen: 'Tabs', 
      params: { screen: tabName } 
    });
  }
}

/**
 * Navigates to a screen that is a direct sibling of Tabs in the Drawer.
 */
function navigateInDrawer(screenName) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Drawer', { screen: screenName });
  }
}

/**
 * Navigates to a screen in the Root Stack (e.g., Detail, Favorites).
 */
function navigateToRoot(screenName, params = {}) {
  if (navigationRef.isReady()) {
     navigationRef.navigate(screenName, params);
  }
}

module.exports = {
  navigationRef,
  registerTabRef,
  jumpToTab,
  navigateInDrawer,
  navigateToRoot,
};
