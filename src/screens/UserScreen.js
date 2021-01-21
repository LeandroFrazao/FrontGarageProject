import React, { Component } from "react";
import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert, Platform } from "react-native";
import { NavigationEvents } from "react-navigation";

import Header from "../components/HeaderScreen";

import BTN from "../components/BTN";
import { GetUserVehicles, DeleteVehicle } from "../services/APIConnect";

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
  const [helperData, setHelperData] = useState({ msg: "" });

  const onFailure = (error) => {
    if (error && error.response) {
      console.log(error);
      if (error.response.data.error) {
        setHelperData({ ...helperData, msg: "No Vehicles" });
      } else console.log(error && error.response.data.Security);
    }
  };

  // Load user data that was passed by params from navigation
  const loadUserData = () => {
    try {
      let data = navigation.state.params.userData;
      setUserData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        key: data.key,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const loadUserVehicles = () => {
    let userEmail = navigation.state.params.userEmail;
    //console.log("loaduserVehicles " + userEmail);
    GetUserVehicles(userEmail)
      .then((response) => {
        //console.log(response.data.users[0]);
        let vehicles = [];
        vehicles = response.data.users[0].vehicles;

        setVehicleData((vehicleData) => vehicleData.concat(vehicles));
      })
      .catch(onFailure);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const deleteVehicle = async ({ vin }) => {
    console.log(vin + " deleted");
    await DeleteVehicle({ email: userData.email, vin: vin })
      .then((result) => {
        setVehicleData(vehicleData.filter((element) => element.vin !== vin));
      })
      .catch(onFailure);
  };

  const AddVehicle = () => {
    navigation.navigate("AddVehicleScreen", {
      userEmail: userData.email,
    });
  };
  const ServiceClick = () => {
    navigation.navigate("ServiceScreen", {
      userEmail: userData.email,
    });
  };

  const EditClick = (index) => {
    navigation.navigate("UpdateVehicleScreen", {
      vehicle: vehicleData[index],
    });
  };

  const DelClick = ({ vin }) => {
    if (Platform.OS == "web") {
      if (confirm("Confirm to delete Vehicle: " + vin + " ?")) {
        deleteVehicle({ vin: vin });
      }
    } else {
      Alert.alert(
        "Delete Vehicle: " + vin,
        "Confirm?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              deleteVehicle({ vin: vin });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <NavigationEvents
        onWillFocus={() => {
          loadUserVehicles();
        }}
        onWillBlur={() => {
          setVehicleData([]);
        }}
      />
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
              AddVehicle();
            }}
          />
          <BTN
            style={styles.btn}
            text="Service"
            onPress={() => {
              ServiceClick();
            }}
          />
          <BTN
            style={styles.btn}
            text="History"
            onPress={() => {
              // onClick();
            }}
          />
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
                let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
                return (
                  <View
                    key={element._id}
                    style={(styles.blockVehicle, { backgroundColor: color })}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <View style={{ maxWidth: 320 }}>
                        <Text style={styles.vehicleText}>
                          {" "}
                          Type: {element.type}
                          {"      "}Make: {element.make}
                          {"      "}Engine: {element.engine}
                        </Text>
                        <Text style={styles.vehicleText}>
                          {" "}
                          Model: {element.model}
                          {"    "}Year: {element.year}
                          {"    "}VIN: {element.vin}
                        </Text>
                      </View>
                      <View>
                        <BTN
                          style={styles.smallBtn}
                          styleCaption={styles.smallBtnText}
                          text="Edit"
                          onPress={() => {
                            EditClick(index);
                          }}
                        ></BTN>

                        <BTN
                          style={styles.smallBtn}
                          styleCaption={styles.smallBtnText}
                          text="Del"
                          onPress={() => {
                            DelClick({ vin: element.vin });
                          }}
                        />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
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
    width: 300,
    marginHorizontal: 10,
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
  smallBtn: {
    height: 18,
    width: 28,
    marginVertical: 3,
    backgroundColor: "rgba(85,83,208,1)",
    paddingLeft: 0,
    paddingRight: 0,
  },
  smallBtnText: {
    fontSize: 12,
  },
});
