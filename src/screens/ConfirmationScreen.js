import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useState, useEffect } from "react";
import BTN from "../components/BTN";

export default function ConfirmationScreen({ navigation }) {
  const [msgText, setMsgText] = useState({
    msg: "",
    error: false,
    btn: "",
  });

  useEffect(() => {
    const getStorage = async () => {
      try {
        let msg = "Error, try again";
        let userEmail = navigation.state.params.userEmail;
        console.log(navigation.state.params.userEmail);

        if (userEmail == null) {
          setMsgText({ ...msgText, msg: msg, error: true, btn: "Back" });
        } else {
          msg = "An email was sent to " + userEmail + " to confirm.";
          setMsgText({
            ...msgText,
            msg: msg,
            btn: "Go to Login",
          });
        }
      } catch (e) {
        console.log(e);
      }
    };
    getStorage();
  }, []);

  function onClick() {
    if (msgText.error == false) {
      navigation.popToTop() && navigation.navigate("LoginScreen");
    } else navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.boxTitle}>
        <Text style={styles.title}>{msgText.msg}</Text>
      </View>
      <BTN
        style={styles.btn}
        text={msgText.btn}
        onPress={() => {
          onClick();
        }}
      ></BTN>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  boxTitle: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 96,
    justifyContent: "center",
  },

  title: {
    fontFamily: "helvetica",
    color: "rgba(31,31,78,1)",
    fontSize: 20,
    textAlign: "center",
  },
  Header1: {
    height: 60,
    width: 360,
    marginTop: 39,
  },
  btn: {
    height: 53,
    width: 130,
    backgroundColor: "rgba(85,83,208,1)",
    marginTop: 62,
    marginLeft: 115,
  },
});
