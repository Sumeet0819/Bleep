import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import HomeScreen from "../screens/Home";
import LoginScreen from "../screens/Login";
import AddReminderScreen from "../screens/AddReminder";

const Stack = createStackNavigator();

export default function RootStack() {
  const { user } = useSelector((state) => state.user);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        presentation: 'card',
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="AddReminder" 
            component={AddReminderScreen}
            options={{
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
