import React from "react";
import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import Keyinput from "../components/Keyinput";
import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import { SetUserToken, Login, UserEmail } from "../services/APIConnect";

export default function LoginScreen({ navigation }) {
  //const [userData, setUserData] = useState("");
  const [userLogin, setUserLogin] = useState({
    email: "",
    key: "",
  });
  const [helperData, setHelperData] = useState({
    email: "",
    key: "",
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
    } else if (item == "key") {
      if (prop.length <= 5) {
        toReturn = "Minimum 6 characters !";
      } else toReturn = "";
    }
    return toReturn;
  };

  const onSuccess = async ({ data }) => {
    // if data.user is valid, the login is valid, and the token is saved on header,
    //then the user data is fetched by calling the function UserEmail
    if (data.user && data.token) {
      //console.log(data.token);
      SetUserToken(data.token);
      await UserEmail(data.user).then(onSuccess).catch(onFailure);
    } //if data.users is valid, the user data was fetched,
    //then it is sent by props to to the screen (user or admin).
    else if (data.users && data.users[0]) {
      if (data.users[0].userType === "admin") {
        navigation.popToTop() &&
          navigation.navigate("AdminScreen", {
            userEmail: data.users[0].email,
            userData: data.users[0],
          });
      } else {
        navigation.popToTop() &&
          navigation.navigate("UserScreen", {
            userEmail: data.users[0].email,
            userData: data.users[0],
          });
      }
    }
    return data;
  };
  const onFailure = (error) => {
    if (error && error.response) {
      console.log(error.response);
      if (error.response.data.error) {
        if (error.response.data.error == "Incorrect Password!") {
          setHelperData({
            ...helperData,
            email: "",
            key: "invalid password!",
          });
        } else
          setHelperData({
            ...helperData,
            email: "User not Found!",
            key: "",
          });
      } else {
        console.log(error && error.response.data.Security);
      }
    }
  };

  async function click({ email, key }) {
    // let email = "bolivar@lgmail.com";
    // let key = "123456";
    //email = "leandrofrazao@hotmail.com"; /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    email = "bolivar@lgmail.com";
    //email = "hulk@marvel.com";
    key = "123456";
    let getValidation = {};
    getValidation.email = validateData({ prop: email, item: "email" });
    getValidation.key = validateData({ prop: key, item: "key" });
    setHelperData({
      email: getValidation.email,
      key: getValidation.key,
    });
    if (getValidation.email == "" && getValidation.key == "") {
      await Login(email, key).then(onSuccess).catch(onFailure);

      // console.log(userData);
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.boxTitle}>
          <Text style={styles.title}>Login</Text>
        </View>

        <Userinput
          style={styles.styleTextBox1}
          text="Email"
          placeholder="Type your email"
          onChange={(e) => setUserLogin({ ...userLogin, email: e })}
          keyboardtype={"email-address"}
          helperText={helperData.email} //to show errors
        ></Userinput>

        <Keyinput
          style={styles.styleTextBox2}
          onChange={(e) => setUserLogin({ ...userLogin, key: e })}
          helperText={helperData.key} //to show errors
        ></Keyinput>
        <BTN
          style={styles.btn}
          text="Log In"
          onPress={() => {
            //  console.log(userLogin.key);
            click({ email: userLogin.email, key: userLogin.key });
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
  body: {
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    // paddingVertical: 20,
  },
  boxTitle: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 80,
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
    marginTop: 50,
    marginLeft: 43,
  },
  styleTextBox2: {
    height: 74,
    width: 275,
    marginTop: 45,
    marginLeft: 43,
  },
  btn: {
    height: 36,
    width: 100,
    marginTop: 50,
  },
});
