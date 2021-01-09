import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import BTN from "../components/BTN";
import { DeleteUserToken } from "../services/APIConnect";

export default function FirstScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <BTN
          style={styles.btn}
          text="Login"
          onPress={() => {
            DeleteUserToken();
            navigation.navigate("LoginScreen");
          }}
        ></BTN>
        <BTN
          style={styles.btn}
          text="Register"
          onPress={() => {
            navigation.navigate("RegisterScreen");
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
    height: 60,
    width: 360,
    marginTop: 150,
  },
  btn: {
    height: 53,
    width: 130,
    backgroundColor: "rgba(85,83,208,1)",
    marginTop: 62,
    marginLeft: 115,
  },
});
