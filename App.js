import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Firstscreen from "./src/screens/FirstScreen";
import LoginScreen from "./src/screens/LoginScreen.js";
import UserScreen from "./src/screens/UserScreen.js";
import RegisterScreen from "./src/screens/RegisterScreen.js";
import ConfirmationScreen from "./src/screens/ConfirmationScreen.js";
import AdminScreen from "./src/screens/AdminScreen.js";
import AddVehicleScreen from "./src/screens/AddVehicleScreen.js";
import UpdateVehicleScreen from "./src/screens/UpdateVehicleScreen.js";
import PartsScreen from "./src/screens/PartsScreen.js";

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
    AddVehicleScreen: {
      screen: AddVehicleScreen,
      navigationOptions: { title: "Add Vehicle" },
    },
    UpdateVehicleScreen: {
      screen: UpdateVehicleScreen,
      navigationOptions: { title: "Edit Vehicle" },
    },
    PartsScreen: {
      screen: PartsScreen,
      navigationOptions: { title: "Parts" },
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
