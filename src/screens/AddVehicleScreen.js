import React from "react";

import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";

import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import { GetParts, AddVehicles } from "../services/APIConnect";
import DropList from "../components/DropList";
import DropDownPicker from "react-native-dropdown-picker";

export default function AddVehicleScreen({ navigation }) {
  const [vehicleData, setVehicleData] = useState({
    vin: "",
    type: "",
    make: "",
    model: "",
    engine: "",
    year: "",
  });
  const [vehicleMake, setVehicleMake] = useState([]);

  const [vehicleEngine, setVehicleEngine] = useState([
    { label: "Diesel", value: "diesel" },
    { label: "Petrol", value: "petrol" },
    { label: "Electric", value: "electric" },
    { label: "Hybrid", value: "hybrid" },
  ]);
  const [vehicleType, setVehicleType] = useState([
    { label: "Motorcycle", value: "Mmotorcycle" },
    { label: "Car", value: "car" },
    { label: "Van", value: "van" },
    { label: "Bus", value: "bus" },
  ]);
  const [helperData, setHelperData] = useState({
    vin: "",
    type: "",
    make: "",
    model: "",
    engine: "",
    year: "",
  });
  const [dropList, setDropList] = useState({
    isVisibleType: false,
    isVisibleMake: false,
    isVisibleEngine: false,
  });

  const onFailure = async (error) => {
    console.log(error);

    if (error && error.response) {
      console.log(error.response);
      if (error && error.response.data.error) {
        setHelperData({
          ...helperData,
          vin: "Vehicle registered already!",
          type: "",
          make: "",
          model: "",
          engine: "",
          year: "",
        });
      } else if (error.response.data.Security) {
        console.log(error.response.data.Security);
      }
    }
  };

  // function to load parts from databe, and then get a list of unique models to an array.
  const loadParts = () => {
    // get all parts
    GetParts()
      .then((response) => {
        console.log(response.data.parts);
        let makes = [];
        // add to models array, each model of vehicles found in the parts collection from database
        response.data.parts.map((element) => {
          makes.push(element.make);
        });
        makes = [...new Set(makes)]; // overwrite the array with unique elements/model.
        console.log(makes);
        let makesMap = [];
        // create a map with label and value for each model to be used on drop list
        makes.map((obj) => {
          makesMap.push({
            label: obj,
            value: obj,
          });
        });
        setVehicleMake(makesMap);
      })
      .catch(onFailure);
  };

  useEffect(() => {
    loadParts();
  }, []);

  const validateData = ({ prop, item }) => {
    let toReturn = {};

    if (!prop && prop == "") {
      if (item == "type" || item == "make" || item == "engine") {
        toReturn = "Select the " + item;
      } else toReturn = "Type the " + item;
    } else if (item == "vin") {
      if (prop.length < 9) {
        toReturn = "Minimum 9 characters, only numbers and letters";
      } else toReturn = "";
    } else if (item == "model") {
      if (prop.length < 2) {
        toReturn = "Minimum 2 characters !";
      } else toReturn = "";
    } else if (item == "engine" || item == "type" || item == "make") {
      if (prop.length > 0) {
        toReturn = "";
      }
    } else if (item == "year") {
      let date = new Date();
      let year = parseInt(date.getFullYear()) + 1;
      let yearV = parseInt(prop);
      //check if year is valid with minimun year of 1920 and max of the current year + 1
      if (prop.length < 4 || yearV < 1920 || yearV > year) {
        toReturn = "Invalid Year";
      } else toReturn = "";
    }
    return toReturn;
  };

  async function onclick({ vin, type, make, model, engine, year }) {
    let getValidation = {};
    getValidation.vin = validateData({ prop: vin, item: "vin" });
    getValidation.model = validateData({ prop: model, item: "model" });
    getValidation.year = validateData({ prop: year, item: "year" });
    getValidation.type = validateData({ prop: type, item: "type" });
    getValidation.engine = validateData({ prop: engine, item: "engine" });
    getValidation.make = validateData({ prop: make, item: "make" });
    console.log({ vin, type, make, model, engine, year });
    setHelperData({
      vin: getValidation.vin,
      model: getValidation.model,
      year: getValidation.year,
      make: getValidation.make,
      type: getValidation.type,
      engine: getValidation.engine,
    });

    let email = navigation.state.params.userEmail;
    console.log(getValidation);
    if (
      getValidation.vin == "" &&
      getValidation.model == "" &&
      getValidation.year == "" &&
      getValidation.engine == "" &&
      getValidation.type == "" &&
      getValidation.make == ""
    ) {
      AddVehicles({ vin, type, make, model, engine, year, email })
        .then((response) => {
          console.log(response);

          navigation.goBack();
        })
        .catch(onFailure);
    }
  }

  const changeVisibility = (props) => {
    setDropList({
      isVisibleEngine: false,
      isVisibleType: false,
      isVisibleMake: false,
      ...props,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              width: 270,

              ...(Platform.OS !== "android" && { zIndex: 90 }),
            },
          ]}
        >
          <View
            style={[{ position: "relative", height: 74, paddingRight: 10 }]}
          >
            <Text style={[styles.label]}>Vehicle Type </Text>
            <DropDownPicker
              items={vehicleType}
              placeholder="Select the Type"
              onChangeItem={(item) => {
                setVehicleData({ ...vehicleData, type: item.value });
              }}
              isVisible={dropList.isVisibleType}
              onOpen={() => changeVisibility({ isVisibleType: true })}
              onClose={() =>
                setDropList({
                  isVisibleType: false,
                })
              }
              containerStyle={[
                {
                  height: 40,
                  width: 130,
                },
              ]}
              style={[
                styles.dropListStyle,
                { backgroundColor: "#fafafa", paddingRight: 5 },
              ]}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              labelStyle={{
                fontSize: 14,
                textAlign: "left",
                color: "blue",
              }}
              zIndex={7000}
              dropDownStyle={[{ marginTop: 1, backgroundColor: "#fafafa" }]}
            />
            <Text style={[styles.helper]}>{helperData.type}</Text>
          </View>

          <View style={[{ position: "relative", height: 74 }]}>
            <Text style={[styles.label]}>Make: </Text>
            <DropDownPicker
              items={vehicleMake}
              placeholder="Select the Make"
              onChangeItem={(item) => {
                console.log(item),
                  setVehicleData({ ...vehicleData, make: item.value });
              }}
              isVisible={dropList.isVisibleMake}
              onOpen={() => changeVisibility({ isVisibleMake: true })}
              onClose={() =>
                setDropList({
                  isVisibleMake: false,
                })
              }
              containerStyle={[
                {
                  height: 40,
                  width: 130,
                },
              ]}
              style={[
                styles.dropListStyle,
                { backgroundColor: "#fafafa", paddingLeft: 5 },
              ]}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              labelStyle={{
                fontSize: 14,
                textAlign: "left",
                color: "blue",
              }}
              zIndex={6000}
              dropDownStyle={[{ marginTop: 1, backgroundColor: "#fafafa" }]}
            />
            <Text style={[styles.helper]}>{helperData.make}</Text>
          </View>
        </View>

        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              ...(Platform.OS !== "android" && { zIndex: 80 }),
            },
          ]}
        >
          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 20 }]}
            styleLabel={[styles.label, { paddingTop: 0 }]}
            styleInput={{ width: 120 }}
            maxLength={10}
            text="Model"
            placeholder="Model"
            onChange={(e) => setVehicleData({ ...vehicleData, model: e })}
            keyboardtype={"default"}
            helperText={helperData.model} //to show errors
          ></Userinput>

          <View style={[{ position: "relative", height: 74 }]}>
            <Text style={[styles.label]}>Engine: </Text>
            <DropDownPicker
              items={vehicleEngine}
              placeholder="Select the Engine"
              onChangeItem={(item) => {
                console.log(item),
                  setVehicleData({ ...vehicleData, engine: item.value });
              }}
              containerStyle={[
                {
                  height: 40,
                  width: 130,
                },
              ]}
              style={[styles.dropListStyle, { backgroundColor: "#fafafa" }]}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              labelStyle={{
                fontSize: 14,
                textAlign: "left",
                color: "blue",
              }}
              zIndex={5000}
              dropDownStyle={[{ marginTop: 2, backgroundColor: "#fafafa" }]}
              isVisible={dropList.isVisibleEngine}
              onOpen={() => changeVisibility({ isVisibleEngine: true })}
              onClose={() =>
                setDropList({
                  isVisibleEngine: false,
                })
              }
            />
            <Text style={[styles.helper]}>{helperData.engine}</Text>
          </View>
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              width: 270,
            },
          ]}
        >
          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 10 }]}
            styleLabel={[styles.label, { paddingTop: 0 }]}
            styleInput={{ width: 80 }}
            maxLength={4}
            text="Year"
            placeholder="Year"
            onChange={(e) => setVehicleData({ ...vehicleData, year: e })}
            keyboardtype={"default"}
            helperText={helperData.year} //to show errors
          ></Userinput>

          <Userinput
            style={styles.styleTextBox1}
            styleLabel={[styles.label, { paddingTop: 0, width: 180 }]}
            styleInput={{ width: 120 }}
            maxLength={10}
            text="Vehicle Identification Number"
            placeholder="VIN"
            onChange={(e) => setVehicleData({ ...vehicleData, vin: e })}
            keyboardtype={"default"}
            helperText={helperData.vin} //to show errors
          ></Userinput>
        </View>

        <BTN
          style={styles.btn}
          text="Confirm"
          onPress={() => {
            // console.log(vehicleData);
            onclick({
              vin: vehicleData.vin,
              make: vehicleData.make,
              model: vehicleData.model,
              type: vehicleData.type,
              year: vehicleData.year,
              engine: vehicleData.engine,
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
  body: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  boxTitle: {
    //    backgroundColor: "#E6E6E6",
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
    marginTop: 5,
  },
  btn: {
    height: 36,
    width: 100,
    marginTop: 30,
  },

  dropListStyle: {
    height: 100,
    fontSize: 12,
  },

  viewStyle: {
    paddingTop: 20,
  },
  helper: {
    fontSize: 12,
    textAlign: "left",
    color: "red",
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    textAlign: "left",
    color: "#000",
    opacity: 0.6,
    // paddingTop: 16,
    width: 100,
  },
});
