import React, { Component } from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Header from "../components/HeaderScreen";

import BTN from "../components/BTN";
import { GetUserVehicles } from "../services/APIConnect";

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
  const [vehicleData, setVehicleData] = useState([]);
  /* {
      vin: "",
      type: "",
      make: "",
      model: "",
      engine: "",
      year: "",
    },
  ]); */
  const [helperData, setHelperData] = useState({
    msg: "",
  });

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
      console.log(error);
      if (error.response.data.error) {
        setHelperData({ ...helperData, msg: "No Vehicles" });
      } else console.log(error && error.response.data.Security);
      //alert(error && error.response.data.Security);
    }
  };

  // Load user data that was passed by params from navigation
  const loadUserData = () => {
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
  const loadUserVehicles = () => {
    GetUserVehicles()
      .then((response) => {
        console.log(response);
        console.log(response.data.users[0]);
        let vehicles = [];
        vehicles = response.data.users[0].vehicles;
        console.log(vehicles);
        setVehicleData((vehicleData) => vehicleData.concat(vehicles));
        /*  setVehicleData({ ...vehicleData,vin: data.vin,
        type: data.type,
        make: data.make,
        model:data.model,
        engine: data.engine,
        year: data.year, })  */
      })
      .catch(onFailure);
  };

  useEffect(() => {
    loadUserVehicles();
    loadUserData();
  }, []);

  function onClick() {
    // UserEmail("bolivar@lgmail.com").then(onSuccess).catch(onFailure);
  }
  /* <Text style={styles.details}>
                  Type: {element.type}
                  Make: {element.make}
                  Model:{element.model}
                  Engine: {element.engine}
                  Year: {element.year}
                </Text> */
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.boxTitle}>
          <Text style={styles.title}>Welcome</Text>
        </View>
        <View style={styles.boxDetails}>
          <Text style={styles.details}>User: {userData.name} </Text>
          <Text style={styles.details}>Email: {userData.email}</Text>
          <Text style={styles.details}>Phone: {userData.phone}</Text>
          <Text style={styles.details}>Address: {userData.address}</Text>
          <Text style={styles.details}>City: {userData.city}</Text>
        </View>
        <View style={styles.boxButtons}>
          <BTN
            style={styles.btn}
            text="Add Vehicle"
            onPress={() => {
              onClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Service"
            onPress={() => {
              onClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="History"
            onPress={() => {
              onClick();
            }}
          ></BTN>
        </View>
        <View style={styles.boxVehicles}>
          <View style={styles.headerVehicles}>
            <Text style={styles.details}>Vehicles:</Text>
          </View>
          <View style={styles.bodyVehicles}>
            {vehicleData.vin == "" ? (
              <Text style={styles.details}>{helperData.msg}</Text>
            ) : (
              vehicleData &&
              vehicleData.map((element, index) => {
                console.log(element.type, index);
                let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
                console.log(color);
                return (
                  <View
                    key={index}
                    style={(styles.blockVehicle, { backgroundColor: color })}
                  >
                    <Text style={styles.vehicleText}>
                      {" "}
                      Type: {element.type}
                      {"      "}Make: {element.make}
                      {"      "}Engine: {element.engine}
                    </Text>

                    <Text style={styles.vehicleText}>
                      {" "}
                      Model: {element.model}
                      {"      "}Year: {element.year}
                    </Text>
                  </View>
                );
              })
            )}
            {console.log(vehicleData)}
          </View>
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
    // paddingVertical: 20,
  },

  boxTitle: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  boxDetails: {
    marginTop: 10,
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 150,
    justifyContent: "center",
    paddingBottom: 10,
  },
  boxVehicles: {
    marginTop: 10,
    backgroundColor: "#E6E6E6",
    width: "100%",
  },
  headerVehicles: {
    backgroundColor: "#E6E6E6",
    width: "100%",

    justifyContent: "center",
  },
  bodyVehicles: {
    backgroundColor: "#E6E6E6",
    width: "100%",

    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  title: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 25,
    marginTop: 5,
    textAlign: "left",
  },
  details: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 18,
    marginLeft: 35,
    marginTop: 5,
    textAlign: "left",
  },

  vehicleText: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 14,
    marginTop: 5,
    textAlign: "left",
    marginHorizontal: 35,
  },
  blockVehicle: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 12,
    width: "100%",

    marginTop: 10,
  },
  btn: {
    height: 30,
    width: 105,
    backgroundColor: "rgba(85,83,208,1)",
  },
  boxButtons: {
    flexDirection: "row",

    backgroundColor: "rgba(85,83,10,1)",

    marginBottom: 30,
  },
});
