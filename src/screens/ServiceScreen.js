import React from "react";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import DropDownPicker from "react-native-dropdown-picker";
//import "react-calendar/dist/Calendar.css";

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
    maxDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ),
    minDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 1
    ),
  });

  const [vehicleCollection, setVehicleCollection] = useState([]);
  const [vehicleVin, setVehicleVin] = useState([]);
  const [serviceData, setServiceData] = useState({
    email: "",
    serviceId: "",
    vin: "",
    status: "",
    description: "",
    serviceType: "",
    date_in: "",
    makeModel: "",
    cost: "",
  });
  const [serviceCollection, SetServiceCollection] = useState([]);

  const [partsCollection, setPartsCollection] = useState([]);

  const [partsName, setPartsName] = useState([]);

  const [helperData, setHelperData] = useState({
    vin: "",
    status: "",
    description: "",
    serviceType: "",
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

  const onFailure = async (error) => {
    console.log(error);

    if (error && error.response) {
      console.log(error.response);
      if (error && error.response.data.error) {
        console.log(error.response.data.error);
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
      if (item == "Vehicle" || item == "Service Type" || item == "Date")
        toReturn = "Select " + item;
      else if (item == "description")
        toReturn = "Give a short description of the problem.";
      else toReturn = "";
    } else toReturn = "";
    return toReturn;
  };

  // add new part
  async function AddClick({ vin, serviceType, date_in, description }) {
    console.log(vin, serviceType, date_in, description);

    let getValidation = {};
    getValidation.description = validateData({
      prop: description,
      item: "description",
    });
    getValidation.vin = validateData({ prop: vin, item: "Vehicle" });
    getValidation.serviceType = validateData({
      prop: serviceType,
      item: "Service Type",
    });
    getValidation.date_in = validateData({ prop: date_in, item: "Date" });

    setHelperData({
      description: getValidation.description,
      vin: getValidation.vin,
      date_in: getValidation.date_in,
      serviceType: getValidation.serviceType,
    });
    console.log(getValidation);
    // let email = navigation.state.params.vehicle.email;
    console.log(navigation.state.params);

    console.log("ok");
    /* if (
      getValidation.description == "" &&
      getValidation.vin == "" &&
      getValidation.date_in == "" &&
      getValidation.serviceType == ""
    ) {
    
      // add booking
      
      
      
      
      
      
      
      
     
    } */
  }

  const CleanClick = () => {
    setServiceData({
      vin: null,
      description: "",
      serviceType: null,
      cost: "",
      makeModel: "",
    });
    setHelperData({
      ...helperData,
      vin: "",
      description: "",
      serviceType: "",
      date_in: "",
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

  const tileDisabled = () => {
    let sundays = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 5
    );
    console.log(sundays);
    return sundays;
  };
  /* email: userEmail,
        serviceId: serviceId,
        vin: vin,
        status: status,
        description: description,
        staff: staff,
        service: service,
        date_in: date_in, 
        
         tileDisabled={({ activeStartDate, date, view }) =>
              priorityDays.some(
                (day: any) => day.date !== moment(date).format("YYYY-MM-DD")
              )
            }

<Calendar
                tileDisabled={({ date, view }) =>
                  view === "month" && // Block day tiles only
                  date.getDay() === 0
                }
                tileClassName={({ date }) => {
                  const isOnList = disabledDates.some((data, index) => {
                    let datedata = new Date(data);
                    let dateOne = new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      new Date().getDate() + 1
                    );
                    let datetwo = datedata;
                    return dateOne === datetwo;
                  });

                  if (isOnList) {
                    return "{background-color: blue; color: red !important;}";
                  } else {
                    return null;
                  }
                }}
                onChange={SetValueDate}
                value={valueDate}
                maxDetail={"month"}
                maxDate={dateSetting.maxDate}
                minDate={dateSetting.minDate}
              />

        
        */
  const now = new Date();
  const tomorrow = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() + 1
  );

  const disabledDates = [tomorrow];

  return (
    <View style={styles.container}>
      <View style={[{ paddingTop: 10, paddingHorizontal: 20 }]}>
        <View>
          <View style={[{ justifyContent: "center", alignItems: "center" }]}>
            <View style={[{ width: "80%" }]}></View>
          </View>
          <View style={[{ flexDirection: "row", height: 60 }]}>
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
              style={[{ paddingLeft: 5, paddingTop: 10, height: 60 }]}
              styleInput={[
                {
                  width: 150,
                  backgroundColor: "white",
                  borderColor: "gray",
                  borderWidth: 2,
                  height: 32,
                  paddingTop: 10,
                  //  alignSelf: "auto",
                  fontSize: 15,
                  textAlign: "center",
                },
              ]}
              styleHelper={{ height: 10, paddingTop: 0 }}
              text=""
              placeholder=""
              value={[valueDate.toUTCString().substr(0, 16)]}
              onChange={(e) => setPartsData()}
              keyboardtype={"default"}
              helperText={helperData.date_in} //to show errors
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
              ...(Platform.OS !== "android" && { zIndex: 99 }),
              height: 80,
            },
          ]}
        >
          <DropList
            label={"Vehicle: " + serviceData.makeModel}
            helperText={helperData.vin}
            items={vehicleVin}
            style={[{ paddingRight: 50 }]}
            //   containerStyle={[]}
            styleLabel={{ height: 20, paddingTop: 0 }}
            helperStyle={{ height: 20, paddingTop: 0 }}
            placeholder="Select"
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
            helperText={helperData.serviceType}
            items={partsName}
            style={[{ paddingRight: 50 }]}
            //   containerStyle={[]}
            styleLabel={{ height: 20, paddingTop: 0 }}
            helperStyle={{ height: 20, paddingTop: 0 }}
            placeholder="Select"
            onChangeItem={(item) => {
              setServiceData({
                ...serviceData,
                serviceType: item.value,
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
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              height: 77,
            },
          ]}
        >
          <Userinput
            style={[{ paddingRight: 10, borderColor: "red", borderWidth: 2 }]}
            styleInput={[{ width: 300 }]}
            styleHelper={[]}
            maxLength={30}
            text="Description"
            placeholder="Description"
            //value={}
            // onChange={(e) => setPartsData({ ...partsData, category: e })}
            keyboardtype={"default"}
            helperText={helperData.description} //to show errors/>
          />
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",

              height: 77,
            },
          ]}
        >
          <BTN
            style={styles.btn}
            text={btnOption.add == true ? "Confirm" : "Update"}
            onPress={() => {
              btnOption.add
                ? AddClick({
                    serviceType: serviceData.serviceType,
                    vin: serviceData.vin,
                    date_in: serviceData.date_in,
                    description: serviceData.description,
                  })
                : UpdateClick();
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
          <View style={[{}]}>
            {serviceCollection.slug == "" ? (
              <Text>""</Text>
            ) : (
              partsCollection &&
              partsCollection.map((element, index) => {
                let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
                return (
                  <View key={index} style={[]}>
                    <SafeAreaView>
                      <ScrollView>
                        <View style={{ flex: 1 }}>
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
                      </ScrollView>
                    </SafeAreaView>
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
    alignContent: "flex-start",
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
