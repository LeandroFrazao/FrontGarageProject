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
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";

import {
  GetParts,
  AddParts,
  DeletePart,
  UpdatePart,
  GetUserService,
  GetUserVehicles,
  GetBookings,
  AddService,
} from "../services/APIConnect";

import { NavigationEvents } from "react-navigation";

export default function ServiceScreen({ navigation }) {
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

  const [markedDays, setMarkedDays] = useState();
  const [selectedDay, setSelectedDay] = useState();
  const [updateAll, setupdateAll] = useState(false);
  const [updateUser, setupdateUser] = useState(false);
  const [bookings, setBookings] = useState();

  let controllerDropService;
  let controllerDropVehicle;

  const DisableSundays = () => {
    const today = moment().format("YYYY-MM-DD");

    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    let startDay = moment().day("1").month(month).year(year).startOf("month");
    const endMonth = moment()
      .month(month + 1)
      .year(year)
      .endOf("month");
    //console.log(startDay);
    //console.log(endMonth);
    let disabledDates = {};
    while (startDay.isBefore(endMonth)) {
      disabledDates[startDay.day("Sunday").format("YYYY-MM-DD")] = {
        disabled: true,
        disableTouchEvent: true,
      };
      startDay.add(7, "days");
    }
    disabledDates[today] = { selected: true, selectedColor: "#EBF2FF" };
    setMarkedDays({ ...markedDays, ...disabledDates });
    setupdateAll(true);
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
        result.push({ label: "", value: null });
        setVehicleVin(
          result.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );

        // setVehicleCollection((vehicleCollection) =>
        //   vehicleCollection.concat(vehicles)
        //);
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
        partNameMap.push({ label: "", value: null });

        setPartsName(
          partNameMap.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );
      })
      .catch(onFailure);
  };

  const loadAllBookings = () => {
    GetBookings()
      .then((response) => {
        let bookings;
        let fullDay = {};

        console.log(fullDay);
        bookings = response.data.results;
        bookings.map((obj) => {
          if (obj.count > 3) {
            fullDay[obj._id] = {
              key: "busydays",
              color: "red",
              selected: true,
              marked: true,
              dayTextColor: "#F5F5F5",
              disableTouchEvent: true,
              dotColor: "red",
              selectedColor: "#C7D4D7",
            };
          }
        });
        setBookings(fullDay);

        setMarkedDays({ ...markedDays, ...fullDay });
        setupdateUser(true);
      })
      .catch(onFailure);
  };

  const loadUserService = () => {
    GetUserService()
      .then((response) => {
        console.log(response.data.users[0].services);
        let services = response.data.users[0].services;
        let currentDate = new Date().toISOString().substr(0, 10);
        let selecteddays = {};
        services.map((obj) => {
          if (obj.date_in >= currentDate) {
            selecteddays[obj.date_in] = {
              key: "bookedday",
              color: "#FFFF84",
              selected: true,
              marked: true,
              dayTextColor: "#F5F5F5",
              disableTouchEvent: true,
              dotColor: "green",
              selectedColor: "#FFFF84",
            };
          }
        });
        //  setBookings(selecteddays);

        setMarkedDays({ ...markedDays, ...selecteddays });

        SetServiceCollection(services);
      })
      .catch(onFailure);
  };

  //after sundays are marked in the calendar, it loads data of bookings to be marked in the calendar.
  useEffect(() => {
    if (updateAll) {
      loadAllBookings();
      setupdateAll(false);
    }
  }, [updateAll]);
  useEffect(() => {
    if (updateUser) {
      loadUserService();
      setupdateUser(false);
    }
  }, [updateUser]);

  //load data from veihicles, services, and get all sundays of 2 months.
  useEffect(() => {
    DisableSundays();

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
  function AddClick({ vin, serviceType, date_in, description }) {
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
    if (
      getValidation.description == "" &&
      getValidation.vin == "" &&
      getValidation.date_in == "" &&
      getValidation.serviceType == ""
    ) {
      //  let email = navigation.state.params.userEmail;
      let status = "Pending";
      AddService({ vin, date_in, serviceType, description, status })
        .then((response) => {
          console.log(response);
          SetServiceCollection([]);

          loadUserService();
        })
        .catch(onFailure);
    }
  }

  // to mark the selected day in the calendar, and remove the last selection
  const ClickDay = (day) => {
    let selectedday;
    // check if it had a previous selected day, then it is set to selected false,
    //and add the new selected day. Both are add in the useState array markedDays.
    selectedday = {
      [selectedDay ? selectedDay : ""]: {
        selected: false,
      },
      [day]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: "#00adf5",
        selectedTextColor: "C8D1E8",
      },
    };

    setMarkedDays({ ...markedDays, ...selectedday });
    setServiceData({
      ...serviceData,
      date_in: day,
    });

    //record the current selected day
    setSelectedDay(day);
  };

  //clean dropdown picker and userinputs
  const CleanClick = () => {
    let selectedday;
    // set the previous selected day to be selected false,
    selectedday = {
      [selectedDay ? selectedDay : ""]: {
        selected: false,
      },
    };
    setMarkedDays({ ...markedDays, ...selectedday });
    controllerDropService.selectItem(null);
    controllerDropVehicle.selectItem(null);

    setServiceData({
      vin: "",
      description: "",
      serviceType: "",
      cost: "",
      makeModel: "",
      date_in: "",
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

  return (
    <View style={styles.container}>
      <NavigationEvents
        onWillFocus={() => {
          //     loadBookings();
        }}
        onWillBlur={() => {}}
      />
      <View style={[{ paddingTop: 10, paddingHorizontal: 10 }]}>
        <View>
          <View style={[{ justifyContent: "center", alignItems: "center" }]}>
            <View style={[{}]}>
              <Calendar
                // Specify style for calendar container element. Default = {}
                style={{
                  borderWidth: 1,
                  borderColor: "gray",
                  height: 280,
                  width: 300,
                }}
                theme={{
                  textSectionTitleDisabledColor: "#d9e1e8",
                  backgroundColor: "#FAFFFF",
                  calendarBackground: "#FAFFFF",
                  textSectionTitleColor: "#b6c1cd",
                  selectedDayBackgroundColor: "#00adf5",
                  selectedDayTextColor: "blue",
                  todayTextColor: "#00adf5",
                  dayTextColor: "#2d4150",
                  //    textDisabledColor: "#d9e1e8",
                  //  dotColor: "#00adf5",
                  //   selectedDotColor: "#ffffff",
                  // arrowColor: "#2d4150",
                  //    disabledArrowColor: "#d9e1e8",
                  monthTextColor: "#2d4150",
                  indicatorColor: "#2d4150",
                  textDayFontFamily: "monospace",
                  textMonthFontFamily: "monospace",
                  textDayHeaderFontFamily: "monospace",
                  textDayFontWeight: "300",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "300",
                  "stylesheet.calendar.main": {
                    week: {
                      marginTop: 2,
                      marginBottom: 2,
                      flexDirection: "row",
                      justifyContent: "space-around",
                    },
                  },
                  "stylesheet.day.basic": {
                    container: {
                      alignSelf: "stretch",
                      alignItems: "center",
                      //   backgroundColor: "red",
                      height: 60,
                    },
                    base: {
                      overflow: "hidden",
                      height: 35,
                      width: 35,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    selected: {
                      borderRadius: 0,
                    },
                  },
                  "stylesheet.calendar.header": {
                    week: {
                      marginTop: 5,
                      flexDirection: "row",
                      justifyContent: "space-around",
                    },
                    dayHeader: {
                      width: 30,
                      textAlign: "center",
                    },
                  },
                }}
                firstDay={1}
                hideExtraDays={true}
                disableMonthChange={false}
                current={new Date()}
                disabledDaysIndexes={[6]}
                renderArrow={(direction) =>
                  direction === "left" ? (
                    <Icon
                      name="md-arrow-back-circle-outline"
                      size={20}
                      color="#4F8EF7"
                    />
                  ) : (
                    <Icon
                      name="ios-arrow-forward-circle-outline"
                      size={20}
                      color="#4F8EF7"
                    />
                  )
                }
                markedDates={{ ...markedDays }}
                minDate={dateSetting.minDate}
                maxDate={dateSetting.maxDate}
                onDayPress={(day) => {
                  ClickDay(day.dateString);
                }}
                markingType="custom"
              />
            </View>
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
                  fontSize: 15,
                  textAlign: "center",
                },
              ]}
              styleHelper={{ height: 10, paddingTop: 0 }}
              text=""
              placeholder="Pick a Day Above"
              value={serviceData.date_in}
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

              ...(Platform.OS !== "android" && { zIndex: 99 }),
              height: 80,
            },
          ]}
        >
          <View
            style={[{ position: "relative", height: 74, paddingRight: 20 }]}
          >
            <Text style={[styles.label]}>Vehicle: {serviceData.makeModel}</Text>
            <DropDownPicker
              items={vehicleVin}
              placeholder="Select"
              defaultValue={""}
              controller={(instance) => (controllerDropVehicle = instance)}
              onChangeList={(items, callback) => {
                new Promise((resolve, reject) => resolve(setVehicleVin(items)))
                  .then(() => callback())
                  .catch(() => {});
              }}
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
              zIndex={7000}
              dropDownStyle={[{ marginTop: 2, backgroundColor: "#fafafa" }]}
            />
            <Text style={[styles.helper]}>{helperData.vin}</Text>
          </View>

          <View style={[{ position: "relative", height: 74 }]}>
            <Text style={[styles.label]}>Service Type: {serviceData.cost}</Text>
            <DropDownPicker
              items={partsName}
              placeholder="Select"
              defaultValue={""}
              controller={(instance) => (controllerDropService = instance)}
              onChangeList={(items, callback) => {
                new Promise((resolve, reject) => resolve(setPartsName(items)))
                  .then(() => callback())
                  .catch(() => {});
              }}
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
              zIndex={6000}
              dropDownStyle={[{ marginTop: 2, backgroundColor: "#fafafa" }]}
            />
            <Text style={[styles.helper]}>{helperData.serviceType}</Text>
          </View>
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              height: 70,
            },
          ]}
        >
          <Userinput
            style={[{ paddingRight: 10 }]}
            styleInput={[{ width: 320 }]}
            styleHelper={[{ paddingTop: 0 }]}
            maxLength={30}
            text="Description"
            placeholder="Describe the problem."
            value={serviceData.description}
            onChange={(e) => setServiceData({ ...serviceData, description: e })}
            keyboardtype={"default"}
            helperText={helperData.description} //to show errors/>
          />
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              height: 25,
              paddingTop: 10,
              justifyContent: "flex-end",
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

        <View style={[styles.boxService]}>
          <View style={[styles.headerService]}>
            <Text style={[styles.headerTitle]}>Bookings:</Text>
            <Text style={styles.count}>{serviceCollection.length} items</Text>
          </View>
          <>
            <ScrollView>
              <View style={[{}]}>
                {serviceCollection.slug == "" ? (
                  <Text>""</Text>
                ) : (
                  serviceCollection &&
                  serviceCollection.map((element, index) => {
                    let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
                    return (
                      <View
                        key={index}
                        style={[styles.blockParts, { backgroundColor: color }]}
                      >
                        <SafeAreaView>
                          <ScrollView>
                            <View style={{ flexDirection: "row" }}>
                              <View style={{ maxWidth: 320 }}>
                                <Text style={styles.partsText}>
                                  Booking: {element.date_in}
                                  {"  "}Status: {element.status}
                                </Text>
                                <Text style={styles.partsText}>
                                  {"  "}VIN: {element.vin}
                                  {"  "}Service Type: {element.serviceType}
                                </Text>
                                <Text style={styles.partsText}>
                                  {"  "}Description: {element.model}
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
            </ScrollView>
          </>
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
    width: 280,
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

  boxService: {
    marginTop: 20,
    backgroundColor: "#E6E6E6",
    width: "100%",
  },

  headerService: {
    flexDirection: "row",
    backgroundColor: "#E6E6E6",
    width: "100%",

    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 18,
    marginLeft: 35,
    marginTop: 5,
    textAlign: "left",
  },
  count: {
    alignContent: "flex-start",
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    marginRight: 35,
    marginTop: 5,
  },
  helper: {
    fontSize: 12,
    textAlign: "left",
    color: "red",
    opacity: 0.6,
  },
});
