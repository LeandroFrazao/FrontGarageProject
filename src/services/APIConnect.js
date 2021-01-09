import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create axios client, pre-configured with baseURL
export const APIConnect = axios.create({
  baseURL: "https://tranquil-coast-47648.herokuapp.com",
  //baseURL: "http://localhost:3000",

  timeout: 100000,
});

//Delete  headers authorizarion
export const DeleteUserToken = () => {
  //console.log("Apiconnect deleted");
  delete APIConnect.defaults.headers.common["Authorization"];
};

// Set  Token in Authorization to be included in all calls
export const SetUserToken = (token) => {
  APIConnect.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  /* APIConnect.interceptors.request.use(
    (config) => {
      console.log("aqui 2", token);
      config.headers.Authorization = `Bearer ${token}`;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  ); */
};

export const RemoveStorage = async (item) => {
  try {
    await AsyncStorage.removeItem(item);
  } catch (e) {
    console.log(e);
  }

  console.log(item + " removed!");
};
export const SaveStorage = async (item, value) => {
  try {
    await AsyncStorage.setItem(item, value);
  } catch (e) {
    console.log(e);
  }
};

export const GetStorage = async (item) => {
  try {
    let userEmail = await AsyncStorage.getItem(item);
    if (userEmail == null) {
      //userEmail = userEmail.substr(1, userEmail.length - 2);
      console.log(item + "from AsyncStorage is null");
    }
    return userEmail;
  } catch (e) {
    console.log(e);
  }
};

export const Login = async (email, key) => {
  return await APIConnect.post("/login", {
    email,
    key,
  });
};

//check users by email, if email is null, show all users
export const UserEmail = async (email) => {
  return await APIConnect.get("/users/" + email);
};

export const Register = async ({
  name,
  email,
  phone,
  address,
  city,
  userType,
  key,
}) => {
  return await APIConnect.post("/register", {
    name,
    email,
    phone,
    address,
    city,
    userType,
    key,
  });
};
//only admin
export const GetVehicles = async (email) => {
  return await APIConnect.get("/vehicles/" + email);
};

// get user vehicles
export const GetUserVehicles = async (email) => {
  return await APIConnect.get("/users/" + email + "/vehicles");
};

export const AddVehicles = async ({ vin, type, make, model, engine, year }) => {
  return await APIConnect.post("/vehicles", {
    vin,
    type,
    make,
    model,
    engine,
    year,
  });
};

export default APIConnect;
