const React = require('react');
const { createStackNavigator } = require('@react-navigation/stack');
const AdminDashboardScreen = require('../screens/admin/AdminDashboardScreen').default || require('../screens/admin/AdminDashboardScreen');
const ManageMezmursScreen = require('../screens/admin/ManageMezmursScreen').default || require('../screens/admin/ManageMezmursScreen');
const EditMezmurScreen = require('../screens/admin/EditMezmurScreen').default || require('../screens/admin/EditMezmurScreen');
const ManageUsersScreen = require('../screens/admin/ManageUsersScreen').default || require('../screens/admin/ManageUsersScreen');
const AdminFeedbackListScreen = require('../screens/admin/AdminFeedbackListScreen').default || require('../screens/admin/AdminFeedbackListScreen');
const ManageSubmissionsScreen = require('../screens/admin/ManageSubmissionsScreen').default || require('../screens/admin/ManageSubmissionsScreen');
const SubmissionReviewScreen = require('../screens/admin/SubmissionReviewScreen').default || require('../screens/admin/SubmissionReviewScreen');

const Stack = createStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="ManageMezmurs" component={ManageMezmursScreen} />
            <Stack.Screen name="EditMezmur" component={EditMezmurScreen} />
            <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
            <Stack.Screen name="AdminFeedback" component={AdminFeedbackListScreen} />
            <Stack.Screen name="ManageSubmissions" component={ManageSubmissionsScreen} />
            <Stack.Screen name="SubmissionReview" component={SubmissionReviewScreen} />
        </Stack.Navigator>
    );
};

module.exports = AdminNavigator;
