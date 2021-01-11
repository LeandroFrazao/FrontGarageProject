import React from "react";

import { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";

import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import DropDownPicker from "react-native-dropdown-picker";
import { GetParts } from "../services/APIConnect";
import DropList from "../components/DropList";

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

  const onFailure = async (error) => {
    console.log(error);
    if (error && error.response) {
      console.log(error.response);
      if (error.response.data.error) {
        setHelperData({ ...helperData, email: error.response.data.error });
        //alert(error && error.response.data.error);
      } else if (error.response.data.Security) {
        console.log(error.response.data.Security);
        //alert(error && error.response.data.Security);
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
        response.data.parts.map((element, index) => {
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
    let date = new Date();
    let year = parseInt(date.getFullYear()) + 1;
    let yearV = parseInt(prop);
    console.log("year: " + year + " yearV: " + yearV);
    if (!prop && prop == "") {
      toReturn = "Type the " + item;
    } else if (item == "vin") {
      if (prop.length <= 9) {
        toReturn = "Minimum 5 characters !";
      } else toReturn = "";
    } else if (item == "model") {
      if (prop.length <= 2) {
        toReturn = "Minimum 2 characters !";
      } else toReturn = "";
    } else if (item == "engine" || item == "type" || item == "make") {
      if (prop.length > 0) {
        toReturn = "";
      }
    } else if (item == "year") {
      if (prop.length <= 4 || yearV >= 1920 || yearV <= year) {
        toReturn = "Invalid Year";
      } else toReturn = "";
    }
    return toReturn;
  };
  function onclick({ vin, type, make, model, engine, year }) {
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
      console.log("aqui 3");
      console.log(vin, type, make, model, engine, year, email);
      /*    AddVehicles({ vin, type, make, model, engine, year, email })
        .then(onSuccess)
        .catch(onFailure);*/
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.bodyLogin}>
        <View
          style={
            (styles.droplistView,
            { paddingTop: 30, flexDirection: "row", zIndex: 10 })
          }
        >
          <View>
            <Text style={styles.textDroplist}>Type of Vehicle: </Text>
            <Text style={styles.helper}>{helperData.type}</Text>
            <DropList
              items={vehicleType}
              zIndex={1}
              placeholder="Select the Type"
              onChangeItem={(item) => {
                setVehicleData({ ...vehicleData, type: item.value });
              }}
            />
          </View>

          <View>
            <Text style={styles.textDroplist}>Make: </Text>
            <Text style={styles.helper}>{helperData.make}</Text>
            <DropList
              items={vehicleMake}
              zIndex={2}
              placeholder="Select the Make"
              onChangeItem={(item) => {
                console.log(item),
                  setVehicleData({ ...vehicleData, make: item.value });
              }}
            />
          </View>
        </View>

        <Userinput
          style={styles.styleTextBox1}
          text="Model"
          placeholder=".."
          onChange={(e) => setVehicleData({ ...vehicleData, model: e })}
          keyboardtype={"default"}
          helperText={helperData.model} //to show errors
        ></Userinput>
        <View
          style={
            (styles.droplistView,
            { paddingTop: 30, flexDirection: "row", zIndex: 8 })
          }
        >
          <View>
            <Text style={styles.textDroplist}>Engine: </Text>
            <Text style={styles.helper}>{helperData.engine}</Text>

            <DropList
              items={vehicleEngine}
              zIndex={3}
              placeholder="Select the Engine"
              onChangeItem={(item) => {
                console.log(item),
                  setVehicleData({ ...vehicleData, engine: item.value });
              }}
            />
          </View>
        </View>

        <Userinput
          style={styles.styleTextBox1}
          text="Year"
          placeholder=".."
          onChange={(e) => setVehicleData({ ...vehicleData, year: e })}
          keyboardtype={"default"}
          helperText={helperData.year} //to show errors
        ></Userinput>
        <Userinput
          style={styles.styleTextBox1}
          text="Vehicle Identification Number (VIN)"
          placeholder=".."
          onChange={(e) => setVehicleData({ ...vehicleData, vin: e })}
          keyboardtype={"default"}
          helperText={helperData.vin} //to show errors
        ></Userinput>

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

  droplistView: {
    paddingTop: 10,
    paddingBottom: 50,
  },

  textDroplist: {
    width: 100,
    fontSize: 12,
    marginTop: 5,
    textAlign: "left",
    paddingBottom: 5,
  },
  helper: {
    fontSize: 12,
    textAlign: "left",
    color: "red",
    opacity: 0.6,
    //paddingVertical: 8,
  },
});
