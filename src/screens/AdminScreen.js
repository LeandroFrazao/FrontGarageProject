import React, { Component } from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Header from "../components/HeaderScreen";

import BTN from "../components/BTN";
import { UserEmail } from "../services/APIConnect";

export default function UserScreen({ navigation }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    userType: "user",
    key: "",
  });
  const [msgText, setMsgText] = useState("");

  const onSuccess = ({ data }) => {
    console.log(data);
    console.log(data.users[0]);

    setUserData({
      name: data.users[0].name,
      email: data.users[0].email,
      phone: data.users[0].phone,
      address: data.users[0].address,
      city: data.users[0].city,
      key: data.users[0].key,
    });

    return data;
  };
  const onFailure = (error) => {
    if (error) {
      console.log(error.response);
      if (error.response.data.error) {
        alert(error && error.response.data.error);
      } else alert(error && error.response.data.Security);
    }
  };

  useEffect(() => {
    const getStorage = () => {
      try {
        let userEmail = navigation.state.params.userEmail;
        let data = navigation.state.params.userData;
        setUserData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          key: data.key,
        });
        console.log(userEmail);
      } catch (e) {
        console.log(e);
      }
    };
    getStorage();
  }, []);

  function PartsClick() {
    navigation.navigate("PartsScreen", {
      // userEmail: userData.email,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.boxTitle}>
          <Text style={styles.title}>Administrator </Text>
          <Text style={styles.title}>User: {userData.name} </Text>
        </View>
        <View style={styles.buttons}>
          <BTN
            style={styles.btn}
            text="Users"
            onPress={() => {
              onClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Parts"
            onPress={() => {
              PartsClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Invoices"
            onPress={
              () => {
                onClick();
              }
              //navigation.navigate("Login");
            }
          ></BTN>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Header1: {
    height: 60,
    width: 360,
    marginTop: 39,
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
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 18,
    marginLeft: 35,
    marginTop: 5,
    textAlign: "left",
  },
  btn: {
    height: 30,
    width: 110,
    backgroundColor: "rgba(85,83,208,1)",
    //  marginTop: 20,
    //marginLeft: 115,
  },
  buttons: {
    flexDirection: "row",
    //height: 30,
    // width: 105,
    backgroundColor: "rgba(85,83,10,1)",
    //marginTop: 20,
    //marginLeft: 115,
  },
});
