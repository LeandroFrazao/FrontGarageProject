import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Firstscreen from "./src/screens/FirstScreen";
import LoginScreen from "./src/screens/LoginScreen.js";
import UserScreen from "./src/screens/UserScreen.js";
import RegisterScreen from "./src/screens/RegisterScreen.js";
import ConfirmationScreen from "./src/screens/ConfirmationScreen.js";
import AdminScreen from "./src/screens/AdminScreen.js";

const navigator = createStackNavigator(
  {
    Main: {
      screen: Firstscreen,
      navigationOptions: { title: "Ger's Garage" },
    },
    LoginScreen: {
      screen: LoginScreen,
      navigationOptions: { title: "Login" },
    },
    UserScreen: {
      screen: UserScreen,
      navigationOptions: { title: "User Profile" },
    },
    RegisterScreen: {
      screen: RegisterScreen,
      navigationOptions: { title: "Register" },
    },
    ConfirmationScreen: {
      screen: ConfirmationScreen,
      navigationOptions: { title: "Confirmation" },
    },
    AdminScreen: {
      screen: AdminScreen,
      navigationOptions: { title: "Admin" },
    },
  },

  {
    initialRouteName: "Main",
    defaultNavigationOptions: {
      title: "Ger's Garage",
    },
  }
);

export default createAppContainer(navigator);
