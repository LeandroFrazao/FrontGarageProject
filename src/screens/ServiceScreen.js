import React from "react";

import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  GetParts,
  AddParts,
  DeletePart,
  UpdatePart,
  GetUserVehicles,
} from "../services/APIConnect";
import DropList from "../components/DropList";
import { NavigationEvents } from "react-navigation";

export default function ServiceScreen({ navigation }) {
  const [valueDate, SetValueDate] = useState(new Date());
  const [dateSetting, setDateSetting] = useState({
    maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    today: new Date(),
  });

  const [vehicleCollection, setVehicleCollection] = useState([]);
  const [vehicleVin, setVehicleVin] = useState([]);
  const [serviceData, setServiceData] = useState({
    email: "",
    serviceId: "",
    vin: "",
    status: "",
    description: "",
    service: "",
    date_in: "",
    makeModel: "",
    cost: "",
    reset: false,
  });
  const [serviceCollection, SetServiceCollection] = useState([]);

  const [partsCollection, setPartsCollection] = useState([]);

  const [partsName, setPartsName] = useState([]);

  const [helperData, setHelperData] = useState({
    vin: "",
    status: "",
    description: "",
    service: "",
    date_in: "",
    status: "",
  });
  const [btnOption, setBtnOption] = useState({
    add: true,
    update: false,
  });
  const [dropList, setDropList] = useState({
    isVisibleVin: false,
    isVisiblePartName: false,
  });

  const changeVisibility = (props) => {
    setDropList({
      isVisibleVin: false,
      isVisiblePartName: false,
      ...props,
    });
  };

  let controller; //to control droplist

  const onFailure = async (error) => {
    console.log(error);

    if (error && error.response) {
      console.log(error.response);
      if (error && error.response.data.error) {
        setHelperData({
          ...helperData,
          category: "",
          make: "",
          model: "",
          cost: "",
          partName: "",
          partName2: error.response.data.error,
        });
      } else if (error.response.data.Security) {
        console.log(error.response.data.Security);
      }
    }
  };

  const loadUserVehicles = () => {
    let userEmail = navigation.state.params.userEmail;
    //console.log("loaduserVehicles " + userEmail);
    GetUserVehicles(userEmail)
      .then((response) => {
        let vehicles = [];
        vehicles = response.data.users[0].vehicles;
        let result = vehicles.map((obj) => {
          return {
            label: obj.vin,
            value: obj.vin,
            makeModel: obj.make + " " + obj.model,
          };
        });
        setVehicleVin(
          result.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );

        setVehicleCollection((vehicleCollection) =>
          vehicleCollection.concat(vehicles)
        );
      })
      .catch(onFailure);
  };

  const loadServiceType = () => {
    GetParts()
      .then((response) => {
        //  console.log(response.data.parts);
        // console.log(response);
        let parts = response.data.parts;
        let result = parts.filter(
          (element, index) =>
            index ===
            parts.findIndex(
              (obj) =>
                element.category == "Services" &&
                element.partName == obj.partName
            )
        );
        let partNameMap = [];
        result.map((obj) => {
          partNameMap.push({
            label: obj.partName,
            value: obj.partName,
            cost: obj.cost,
          });
        });
        setPartsName(
          partNameMap.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );
      })
      .catch(onFailure);
  };

  useEffect(() => {
    loadUserVehicles();
    loadServiceType();
  }, []);

  const validateData = ({ prop, item }) => {
    let toReturn = {};
    console.log(prop, item);
    if (!prop && prop == "") {
      toReturn = "Type the " + item;
    } else if (prop.length < 2 && item != "cost") {
      toReturn = "Minimum 2 characters, only numbers and letters";
    } else if (prop.length < 2 && item == "cost") {
      toReturn = "Minimum 2 characters !";
    } else if (prop.length > 0) {
      toReturn = "";
    }

    return toReturn;
  };

  // add new part
  async function AddClick({ category, cost, model, make, partName }) {
    let getValidation = {};
    getValidation.description = validateData({
      prop: description,
      item: "description",
    });
    getValidation.vin = validateData({ prop: vin, item: "vin" });

    setHelperData({
      description: getValidation.description,
      vin: getValidation.vin,
      date_in: getValidation.date_in,
      service: getValidation.service,
    });
    console.log(getValidation);
    // let email = navigation.state.params.vehicle.email;
    console.log(navigation.state.params);
    if (
      getValidation.description == "" &&
      getValidation.vin == "" &&
      getValidation.date_in == "" &&
      getValidation.service == "" &&
      getValidation.make == ""
    ) {
      // add booking
      /* 
      
      
      
      
      
      
      
      */
    }
  }

  const CleanClick = () => {
    controller.reset();
    setServiceData({
      vin: null,
      description: "",
      service: null,
      cost: "",
      makeModel: "",
    });
    setHelperData({
      ...helperData,
      category: "",
      make: "",
      model: "",
      cost: "",
      partName: "",
    });
  };

  // update Booking
  const UpdateClick = async ({}) => {};

  const EditClick = async (index) => {};
  const deletePart = async ({ slug }) => {
    console.log(slug + " deleted");
  };

  const DelClick = ({ slug }) => {
    if (Platform.OS == "web") {
      if (confirm("Confirm to delete Part: " + slug + " ?")) {
        deletePart({ slug: slug });
      }
    } else {
      Alert.alert(
        "Delete Part: " + slug,
        "Confirm?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              deletePart({ slug: slug });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };
  /* email: userEmail,
        serviceId: serviceId,
        vin: vin,
        status: status,
        description: description,
        staff: staff,
        service: service,
        date_in: date_in, 
        
        
        
        
        */

  return (
    <View style={styles.container}>
      <View style={[{ paddingTop: 10, paddingHorizontal: 20 }]}>
        <View>
          <View style={[{ justifyContent: "center", alignItems: "center" }]}>
            <View style={[{ width: "80%" }]}>
              <Calendar
                onChange={SetValueDate}
                value={valueDate}
                activeStartDate={dateSetting.today}
                maxDetail={"month"}
                maxDate={dateSetting.maxDate}
                minDate={dateSetting.today}
              />
            </View>
          </View>
          <View style={[{ flexDirection: "row" }]}>
            <Text
              style={[
                {
                  height: 30,
                  marginTop: 20,

                  fontFamily: "Roboto",
                  color: "rgba(31,31,78,1)",
                  fontSize: 18,
                },
              ]}
            >
              Pick a day:
            </Text>
            <Userinput
              style={[{ paddingLeft: 5 }]}
              styleInput={[
                {
                  width: 150,
                  backgroundColor: "white",
                  borderColor: "gray",
                  borderWidth: 2,
                  height: 30,
                  fontSize: 15,
                  textAlign: "center",
                },
              ]}
              styleHelper={[]}
              text=""
              placeholder=""
              value={[valueDate.toUTCString().substr(0, 16)]}
              onChange={(e) => setPartsData()}
              keyboardtype={"default"}
              helperText={helperData.category} //to show errors
              editable={false}
              focusable={false}
            />
          </View>
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              borderColor: "yellow",
              borderWidth: 2,
              zIndex: 99,
            },
          ]}
        >
          <DropList
            label={"Vehicle: " + serviceData.makeModel}
            // helperText={[]}
            items={vehicleVin}
            style={[{ paddingRight: 50 }]}
            //   containerStyle={[]}
            //   styleLabel={}
            //    helperStyle={}
            placeholder="Select"
            controller={() => (instance) => (controller = instance)}
            onChangeItem={(item) => {
              setServiceData({
                ...serviceData,
                vin: item.value,
                makeModel: item.makeModel,
              });
            }}
            isVisible={dropList.isVisibleVin}
            onOpen={() => changeVisibility({ isVisibleVin: true })}
            onClose={() =>
              setDropList({
                isVisibleVin: false,
              })
            }
          />
          <DropList
            label={"Service Type: " + serviceData.cost}
            // helperText={[]}
            items={partsName}
            style={[{ paddingRight: 50 }]}
            //   containerStyle={[]}
            styleLabel={{ width: 150 }}
            //    helperStyle={}
            placeholder="Select"
            onChangeItem={(item) => {
              setServiceData({
                ...serviceData,
                service: item.value,
                cost: "€ " + item.cost,
              });
            }}
            isVisible={dropList.isVisiblePartName}
            onOpen={() => changeVisibility({ isVisiblePartName: true })}
            onClose={() =>
              setDropList({
                isVisiblePartName: false,
              })
            }
          />
          <Userinput
            style={[{ paddingRight: 10, borderColor: "red", borderWidth: 2 }]}
            styleInput={[styles.styleInput]}
            styleHelper={styles.styleHelperInput}
            maxLength={16}
            text="Category"
            placeholder="Category"
            //value={}
            // onChange={(e) => setPartsData({ ...partsData, category: e })}
            keyboardtype={"default"}
            helperText={helperData.category} //to show errors
          />
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              zIndex: 16,
            },
          ]}
        >
          <BTN
            style={styles.btn}
            text={btnOption.add == true ? "Confirm" : "Update"}
            onPress={() => {
              btnOption.add ? AddClick() : UpdateClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Clean"
            onPress={() => {
              CleanClick();
            }}
          ></BTN>
        </View>

        <View style={[]}>
          <View style={[]}>
            <Text style={[]}>Bookings:</Text>
            <Text style={styles.count}>{partsCollection.length} items</Text>
          </View>
          <View style={{ zIndex: 5 }}>
            {serviceCollection.slug == "" ? (
              <Text>""</Text>
            ) : (
              partsCollection &&
              partsCollection.map((element, index) => {
                let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
                return (
                  <View key={index} style={[]}>
                    <View style={[]}>
                      <View style={{ maxWidth: 320 }}>
                        <Text style={styles.partsText}>
                          id: {element.slug}
                          {"  "}Name: {element.partName}
                        </Text>
                        <Text style={styles.partsText}>
                          {"  "}Category: {element.category}
                          {"  "}Make: {element.make}
                        </Text>
                        <Text style={styles.partsText}>
                          {"  "}Model: {element.model}
                          {"  "}Cost: {element.cost}
                        </Text>
                      </View>
                      <View>
                        <BTN
                          style={styles.smallBtn}
                          styleCaption={styles.smallBtnText}
                          text="Edit"
                          onPress={() => {
                            //   EditClick(index);
                          }}
                        ></BTN>

                        <BTN
                          style={styles.smallBtn}
                          styleCaption={styles.smallBtnText}
                          text="Del"
                          onPress={() => {
                            //DelClick({ slug: element.slug });
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
  title: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 30,
    textAlign: "center",
  },
  styleTextBox1: {
    height: 35,
    marginTop: 5,
  },

  btn: {
    height: 25,
    width: 80,
    marginTop: 50,
    paddingRight: 10,
  },

  viewStyle: {
    // paddingTop: 15,
    alignItems: "center",
  },

  count: {
    alignContent: "right",
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    marginRight: 35,
    marginTop: 5,
  },
  partsText: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 14,
    marginTop: 5,
    textAlign: "left",
    width: 300,
    marginHorizontal: 10,
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
  styleHelperInput: {
    paddingTop: 0,
  },
  styleInput: {
    width: 100,
  },
});
