const React = require('react');
const { useState, useEffect } = React;
const { navigationRef } = require('../services/NavigationService');

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

    const tabScreens = ['Home', 'Mezmurs', 'Calendar', 'Profile'];
    const hiddenOnScreens = ['Detail', 'HymnPlayer', 'Welcome', 'Auth'];

    const hasBottomTabs = React.useMemo(() => tabScreens.includes(currentRoute), [currentRoute]);
    const isVisible = React.useMemo(() => !hiddenOnScreens.includes(currentRoute), [currentRoute]);

    return children({ isVisible, hasBottomTabs });
};

module.exports = MiniPlayerManager;
