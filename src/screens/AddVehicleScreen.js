import React from "react";

import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Keyinput from "../components/Keyinput";
import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import {
  Login,
  UserEmail,
  Register,
  SaveStorage,
  RemoveStorage,
} from "../services/APIConnect";

function AddVehicleScreen({ navigation }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    userType: "user",
    key: "",
  });
  const [helperData, setHelperData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    key: "",
  });

  const onSuccess = async ({ data }) => {
    console.log("ON SUCCESS");
    console.log(data);
    //setUserToken(data.token);

    await SaveStorage("userEmail", userData.email);
    await SaveStorage("Error", data.user);

    navigation.navigate("ConfirmationScreen", { userEmail: userData.email });

    //RemoveStorage("Error", "");
    //localStorage.setItem("user", JSON.stringify(data.token));

    //setUserData(data);
    return data;
  };
  const onFailure = async (error) => {
    console.log(error);
    if (error && error.response) {
      console.log(error.response);
      //console.log(error.response.data.error);
      //console.log(error.response.data.Security);
      //console.log(error && error.response);
      if (error.response.data.error) {
        console.log("error 1");
        setHelperData({ ...helperData, email: error.response.data.error });
        //alert(error && error.response.data.error);
      } else if (error.response.data.Security) {
        console.log(error.response.data.Security);
        //alert(error && error.response.data.Security);
      }
    }
  };

  useEffect(() => {
    // Update the document title using the browser API
  });

  const validateData = ({ prop, item }) => {
    let toReturn = {};
    if (!prop && prop == "") {
      toReturn = "Type your " + item;
    } else if (item == "email") {
      const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailValidator.test(prop)) {
        toReturn = "Email invalid";
      } else toReturn = "";
    } else if (item != "email" && item != "key" && item != "phone") {
      if (prop.length <= 4) {
        toReturn = "Minimum 5 characters !";
      } else toReturn = "";
    } else if (item == "phone" || item == "key") {
      if (prop.length <= 5) {
        toReturn = "Minimum 6 characters !";
      } else toReturn = "";
    }

    return toReturn;
  };

  async function click({ name, email, phone, address, city, userType, key }) {
    // console.log(email);
    //console.log(userKey);
    // let email = "bolivar@lgmail.com";
    // let key = "123456";

    let getValidation = {};
    getValidation.email = validateData({ prop: email, item: "email" });
    getValidation.name = validateData({ prop: name, item: "name" });
    getValidation.phone = validateData({ prop: phone, item: "phone" });
    getValidation.address = validateData({ prop: address, item: "address" });
    getValidation.city = validateData({ prop: city, item: "city" });
    getValidation.key = validateData({ prop: key, item: "key" });
    setHelperData({
      name: getValidation.name,
      email: getValidation.email,
      phone: getValidation.phone,
      address: getValidation.address,
      city: getValidation.city,
      key: getValidation.key,
    });

    // console.log(helperData);
    if (
      getValidation.name == "" &&
      getValidation.email == "" &&
      getValidation.address == "" &&
      getValidation.city == "" &&
      getValidation.phone == "" &&
      getValidation.key == ""
    ) {
      Register({ name, email, phone, address, city, userType, key })
        .then(onSuccess)
        .catch(onFailure);
    }
  } /* 
  <View style={styles.boxTitle}>
          <Text style={styles.title}>Register</Text>
        </View> */
  return (
    <View style={styles.container}>
      <View style={styles.bodyLogin}>
        <Userinput
          style={styles.styleTextBox1}
          text="Email"
          placeholder="Type your email"
          onChange={(e) => setUserData({ ...userData, email: e })}
          keyboardtype={"email-address"}
          helperText={helperData.email} //to show errors
        ></Userinput>
        <Userinput
          style={styles.styleTextBox1}
          text="Name"
          placeholder="Type your name"
          onChange={(e) => setUserData({ ...userData, name: e })}
          keyboardtype={"default"}
          helperText={helperData.name} //to show errors
        ></Userinput>
        <Userinput
          style={styles.styleTextBox1}
          text="Address"
          placeholder="Type your address"
          onChange={(e) => setUserData({ ...userData, address: e })}
          keyboardtype={"default"}
          helperText={helperData.address} //to show errors
        ></Userinput>
        <Userinput
          style={styles.styleTextBox1}
          text="City"
          placeholder="Type your city"
          onChange={(e) => setUserData({ ...userData, city: e })}
          keyboardtype={"default"}
          helperText={helperData.city} //to show errors
        ></Userinput>
        <Userinput
          style={styles.styleTextBox1}
          text="Phone"
          placeholder="Type your phone"
          onChange={(e) => setUserData({ ...userData, phone: e })}
          keyboardtype={"phone-pad"}
          helperText={helperData.phone} //to show errors
        ></Userinput>

        <Keyinput
          style={styles.styleTextBox2}
          onChange={(e) => setUserData({ ...userData, key: e })}
          keyboardtype={"default"}
          helperText={helperData.key} //to show errors
        ></Keyinput>
        <BTN
          style={styles.btn}
          text="Confirm"
          onPress={() => {
            //  console.log(userLogin.key);
            click({
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
              city: userData.address,
              key: userData.key,
              userType: userData.userType,
            });
          }}
        ></BTN>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyLogin: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    //   marginTop: -80,
  },
  boxTitle: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 96,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 30,
    textAlign: "center",
  },
  styleTextBox1: {
    height: 74,
    width: 275,
    marginTop: 5,
    marginLeft: 43,
  },
  styleTextBox2: {
    height: 74,
    width: 275,
    marginTop: 5,
    marginLeft: 43,
  },
  btn: {
    height: 36,
    width: 100,
    marginTop: 30,
  },
});

export default AddVehicleScreen;
