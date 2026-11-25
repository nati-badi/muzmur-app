const React = require('react');
const { useState, useEffect } = React;
const { navigationRef } = require('../services/NavigationService');

const TAB_SCREENS = ['Home', 'Mezmurs', 'Calendar', 'Profile'];
const HIDDEN_ON_SCREENS = ['Detail', 'HymnPlayer', 'Welcome', 'Auth'];

const MiniPlayerManager = ({ children }) => {
    const [currentRoute, setCurrentRoute] = useState('Drawer');

    useEffect(() => {
        const handleStateChange = () => {
            const route = navigationRef.getCurrentRoute();
            if (route && route.name !== currentRoute) {
                setCurrentRoute(route.name);
            }
        };

        const unsubscribe = navigationRef.addListener('state', handleStateChange);
        return unsubscribe;
    }, [currentRoute]);

    const hasBottomTabs = React.useMemo(() => TAB_SCREENS.includes(currentRoute), [currentRoute]);
    const isVisible = React.useMemo(() => !HIDDEN_ON_SCREENS.includes(currentRoute), [currentRoute]);

    return children({ isVisible, hasBottomTabs });
};

module.exports = MiniPlayerManager;
