import React from "react";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import DropDownPicker from "react-native-dropdown-picker";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";

import {
  GetParts,
  DeleteService,
  GetUserService,
  GetUserVehicles,
  GetBookings,
  AddService,
  UpdateService,
} from "../services/APIConnect";

// BOOKINGS SCREEN FOR Customers

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
  const [serviceCollection, setServiceCollection] = useState([]);
  const [oldServicesCollection, setOldServicesCollection] = useState([]);
  const [serviceType, setServiceType] = useState([]);

  const [helperData, setHelperData] = useState({
    vin: "",
    status: "",
    description: "",
    serviceType: "",
    date_in: "",
    status: "",
    error: "",
  });
  const [btnOption, setBtnOption] = useState({
    add: true,
    update: false,
  });
  const [dropList, setDropList] = useState({
    isVisibleVin: false,
    isVisibleServiceType: false,
  });

  const changeVisibility = (props) => {
    setDropList({
      isVisibleVin: false,
      isVisibleServiceType: false,
      ...props,
    });
  };

  const [markedDays, setMarkedDays] = useState();
  const [selectedDay, setSelectedDay] = useState({
    day: "",
    options: "",
  });
  const [updateAll, setupdateAll] = useState(false);
  const [updateUser, setupdateUser] = useState(false);
  const [resetCalendar, setResetCalendar] = useState(false);
  const [unableSundays, setUnableSundays] = useState(false);

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
        if (Platform.OS == "web") {
          alert(error.response.data.error);
        } else {
          Alert.alert(
            error.response.data.error,
            "Sorry?",
            [
              {
                text: "OK",
              },
            ],
            { cancelable: false }
          );
        }
      } else if (error.response.data.Security) {
        console.log(error.response.data.Security);
      }
    }
  };

  const loadUserVehicles = () => {
    let userEmail = navigation.state.params.userEmail;

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
      })
      .catch(onFailure);
  };

  const loadServiceType = () => {
    GetParts()
      .then((response) => {
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

        //load information type of service and its cost from parts collection,
        let serviceTypeMap = [];
        result.map((obj) => {
          serviceTypeMap.push({
            label: obj.partName,
            value: obj.partName,
            cost: obj.cost,
          });
        });
        serviceTypeMap.push({ label: "", value: null });

        setServiceType(
          serviceTypeMap.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );
      })
      .catch(onFailure);
  };

  //load all bookings from all users to the calendar
  const loadAllBookings = () => {
    GetBookings()
      .then((response) => {
        let bookings;
        let fullDay = {};

        bookings = response.data.results;
        bookings.map((obj) => {
          if (obj.count > 3) {
            fullDay[obj._id] = {
              key: obj.count,
              color: "red",
              selected: true,
              marked: true,
              dayTextColor: "#F5F5F5",
              disableTouchEvent: true,
              dotColor: "red",
              selectedColor: "#C7D4D7",
            };
          } else if (obj.count == 3) {
            fullDay[obj._id] = {
              key: obj.count,
              marked: true,
              dayTextColor: "#F5F5F5",
              dotColor: "orange",
            };
          } else if (obj.count >= 1) {
            fullDay[obj._id] = {
              key: obj.count,
              marked: true,
              dayTextColor: "#F5F5F5",
              dotColor: "#ECE515",
            };
          }
        });

        setMarkedDays({ ...markedDays, ...fullDay });
        setupdateUser(true);
      })
      .catch(onFailure);
  };

  const loadServiceCollection = () => {
    let email = navigation.state.params.userEmail;
    GetUserService(email)
      .then((response) => {
        // console.log(response.data.users[0].services);
        let services = response.data.users[0].services;
        let currentDate = new Date().toISOString().substr(0, 10);
        let selecteddays = {};
        let currentBookings = [];
        let oldBookings = [];
        services.map((obj) => {
          if (obj.date_in >= currentDate) {
            currentBookings.push(obj);

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
          } else oldBookings.push(obj);
        });
        // days to be marked in the calendar
        setMarkedDays({ ...markedDays, ...selecteddays });
        // data of current bookings to be mapped to user screen
        setServiceCollection(currentBookings);
        // data of old bookings to be mapped to user screen
        setOldServicesCollection(oldBookings);
      })
      .catch((response) => {
        console.log(response);
      });
  };

  //after sundays are marked in the calendar, it loads data of bookings to be marked in the calendar.

  useEffect(() => {
    if (unableSundays) {
      DisableSundays();
      setUnableSundays(false);
    }
  }, [unableSundays]);

  useEffect(() => {
    if (resetCalendar) {
      setMarkedDays([]);
      setUnableSundays(true);
      setResetCalendar(false);
    }
  }, [resetCalendar]);
  useEffect(() => {
    if (updateAll) {
      loadAllBookings();
      setupdateAll(false);
    }
  }, [updateAll]);
  useEffect(() => {
    if (updateUser) {
      loadServiceCollection();
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

    if (!prop && prop == "") {
      if (item == "Vehicle" || item == "Service Type" || item == "Date")
        toReturn = "Select " + item;
      else if (item == "description")
        toReturn = "Give a short description of the problem.";
      else toReturn = "";
    } else if (item == "Vehicle") {
      //check if there is any VIN already booked.
      if (serviceCollection.length > 0) {
        serviceCollection.some((obj) => {
          {
            console.log(obj);
            if (obj.vin === prop && obj.status == "Booked") {
              return (toReturn = "Already booked on " + obj.date_in + ".");
            } else if (obj.vin === prop && obj.status == "In Service") {
              return (toReturn = "Vehicle is being fixed.");
            } else if (obj.vin === prop && obj.status == "Fixed") {
              return (toReturn = "Vehicle is fixed at the garage.");
            } else toReturn = "";
          }
        });
      } else toReturn = "";
    } else toReturn = "";
    return toReturn;
  };

  // add new part
  function AddClick({ vin, serviceType, date_in, description }) {
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
      ...helperData,
      description: getValidation.description,
      vin: getValidation.vin,
      date_in: getValidation.date_in,
      serviceType: getValidation.serviceType,
    });

    if (
      getValidation.description == "" &&
      getValidation.vin == "" &&
      getValidation.date_in == "" &&
      getValidation.serviceType == ""
    ) {
      console.log(vin, serviceType, date_in, description);
      if (Platform.OS == "web") {
        if (confirm("Confirm Booking at " + date_in + " ?")) {
          addbooking({ vin, date_in, serviceType, description });
        }
      } else {
        Alert.alert(
          "Confirm Booking at " + date_in,
          "Confirm?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "OK",
              onPress: () => {
                addbooking({ vin, date_in, serviceType, description });
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  }

  const addbooking = ({ vin, date_in, serviceType, description }) => {
    AddService({ vin, date_in, serviceType, description })
      .then((response) => {
        setServiceCollection([]);
        setOldServicesCollection([]);
        loadServiceCollection();
        CleanClick();
      })
      .catch(onFailure);
  };

  // to mark the selected day in the calendar, and remove the last selection
  const ClickDay = (day) => {
    let selectedday;
    // check if it had a previous selected day, then it is set to selected false,
    //and add the new selected day. Both are add in the useState array markedDays.
    selectedday = {
      [selectedDay ? selectedDay.day : ""]: selectedDay.options,

      [day]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: "#00adf5",
        selectedTextColor: "#C8D1E8",
      },
    };
    setMarkedDays({ ...markedDays, ...selectedday });
    setServiceData({
      ...serviceData,
      date_in: day,
    });

    //record the current selected day
    setSelectedDay({ day: day, options: markedDays[day] });
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

  const updateService = ({
    serviceType,
    vin,
    date_in,
    description,
    serviceId,
  }) => {
    let email = navigation.state.params.userEmail;
    UpdateService({ serviceType, vin, date_in, description, email, serviceId })
      .then((result) => {
        console.log(result);
        setBtnOption({ add: true, update: false });
        setServiceCollection([]);
        setOldServicesCollection([]);
        // reset calendar, reload bookings and disable sundays
        setResetCalendar(true);
        setSelectedDay({
          day: "",
          options: "",
        });

        CleanClick();
      })
      .catch(onFailure);
  };

  // update Booking
  const UpdateClick = async ({
    serviceType,
    vin,
    date_in,
    description,
    serviceId,
  }) => {
    if (Platform.OS == "web") {
      if (confirm("Update booking to " + date_in + " ?")) {
        updateService({
          serviceType,
          vin,
          date_in,
          description,

          serviceId,
        });
      }
    } else {
      Alert.alert(
        "Update booking on " + date_in,
        "Confirm?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              updateService({
                serviceType,
                vin,
                date_in,
                description,

                serviceId,
              });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const EditClick = async (index) => {
    console.log(serviceCollection[index]);
    setBtnOption({ add: false, update: true });
    setHelperData({ ...helperData, error: "" });
    controllerDropService.selectItem(serviceCollection[index].serviceType);
    controllerDropVehicle.selectItem(serviceCollection[index].vin);
    setServiceData({
      vin: serviceCollection[index].vin,
      serviceType: serviceCollection[index].serviceType,
      date_in: serviceCollection[index].date_in,
      cost: serviceCollection[index].cost,
      description: serviceCollection[index].description,
      makeModel: serviceCollection[index].makeModel,
      serviceId: serviceCollection[index].serviceId,
    });
  };

  const deleteService = ({ serviceId }) => {
    console.log(serviceId + " deleted");
    let email = navigation.state.params.userEmail;

    DeleteService({ serviceId, email })
      .then((response) => {
        setServiceCollection(
          serviceCollection.filter((element) => element.serviceId !== serviceId)
        );
        //   loadServiceCollection();
        // setServiceCollection([]);
        //   setOldServicesCollection([]);
        // reset calendar, reload bookings and disable sundays
        setResetCalendar(true);
      })
      .catch(onFailure);
  };
  const deleteOldService = ({ serviceId }) => {
    console.log(serviceId + " deleted");
    let email = navigation.state.params.userEmail;

    DeleteService({ serviceId, email })
      .then((response) => {
        setOldServicesCollection(
          oldServicesCollection.filter(
            (element) => element.serviceId !== serviceId
          )
        );
        loadServiceCollection();
      })
      .catch(onFailure);
  };

  const DelClick = ({ serviceId, date_in }) => {
    if (Platform.OS == "web") {
      if (confirm("Cancel booking on " + date_in + " ?")) {
        deleteService({ serviceId: serviceId });
      }
    } else {
      Alert.alert(
        "Cancel booking on " + date_in,
        "Confirm?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              deleteService({ serviceId: serviceId });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={[styles.container, { height: 1000 }]}>
      <>
        <ScrollView>
          <View
            style={[
              styles.bodyService,
              { marginTop: 0 },
              { ...(Platform.OS !== "android" && { zIndex: 100 }) },
            ]}
          >
            <View style={[{ justifyContent: "center", alignItems: "center" }]}>
              <Calendar
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
                style={[
                  {
                    position: "relative",
                    height: 74,
                    width: 180,
                    //   paddingRight: 40,
                  },
                ]}
              >
                <Text style={[styles.label]}>
                  Vehicle: {serviceData.makeModel}
                </Text>
                <DropDownPicker
                  items={vehicleVin}
                  placeholder="Select"
                  defaultValue={""}
                  controller={(instance) => (controllerDropVehicle = instance)}
                  onChangeList={(items, callback) => {
                    new Promise((resolve, reject) =>
                      resolve(setVehicleVin(items))
                    )
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
                <Text style={[styles.label]}>
                  Service Type: {serviceData.cost}
                </Text>
                <DropDownPicker
                  items={serviceType}
                  placeholder="Select"
                  defaultValue={""}
                  controller={(instance) => (controllerDropService = instance)}
                  onChangeList={(items, callback) => {
                    new Promise((resolve, reject) =>
                      resolve(setServiceType(items))
                    )
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
                  isVisible={dropList.isVisibleServiceType}
                  onOpen={() =>
                    changeVisibility({ isVisibleServiceType: true })
                  }
                  onClose={() =>
                    setDropList({
                      isVisibleServiceType: false,
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
                onChange={(e) =>
                  setServiceData({ ...serviceData, description: e })
                }
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
                text={btnOption.add == true ? "Add" : "Update"}
                onPress={() => {
                  btnOption.add
                    ? AddClick({
                        serviceType: serviceData.serviceType,
                        vin: serviceData.vin,
                        date_in: serviceData.date_in,
                        description: serviceData.description,
                      })
                    : UpdateClick({
                        serviceType: serviceData.serviceType,
                        vin: serviceData.vin,
                        date_in: serviceData.date_in,
                        description: serviceData.description,
                        serviceId: serviceData.serviceId,
                      });
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
          </View>
          <View style={[styles.boxService, { height: 150 }]}>
            <View style={[styles.headerService]}>
              <Text style={[styles.headerTitle]}>Bookings:</Text>
              <Text style={styles.count}>
                {serviceCollection.length} bookings
              </Text>
            </View>
            <>
              <ScrollView nestedScrollEnabled>
                <View>
                  {serviceCollection.length == 0 ? (
                    <Text></Text>
                  ) : (
                    serviceCollection &&
                    serviceCollection.map((element, index) => {
                      let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
                      return (
                        <View
                          key={element._id}
                          style={[
                            styles.blockService,
                            { backgroundColor: color },
                          ]}
                        >
                          <View style={{ flexDirection: "row" }}>
                            <View style={{ maxWidth: 320 }}>
                              <Text style={styles.serviceText}>
                                Booking: {element.date_in}
                                {"  "}Status: {element.status}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}VIN: {element.vin}
                                {"  "}Service Type: {element.serviceType}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}Description: {element.description}
                              </Text>
                            </View>
                            {element.status == "Booked" ? (
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
                                    DelClick({
                                      serviceId: element.serviceId,
                                      date_in: element.date_in,
                                    });
                                  }}
                                />
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            </>
          </View>
          <View
            style={[
              styles.boxService,
              {
                marginTop: 0,
                borderTopWidth: 10,
                borderTopColor: "white",
                height: 150,
              },
            ]}
          >
            <View style={[styles.headerService]}>
              <Text style={[styles.headerTitle]}>Old Bookings:</Text>
              <Text style={styles.count}>
                {oldServicesCollection.length} bookings
              </Text>
            </View>
            <>
              <ScrollView nestedScrollEnabled>
                <View>
                  {oldServicesCollection.length == 0 ? (
                    <Text> </Text>
                  ) : (
                    oldServicesCollection &&
                    oldServicesCollection.map((element, index) => {
                      let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";

                      return (
                        <View
                          key={element._id}
                          style={[
                            styles.blockService,
                            { backgroundColor: color },
                          ]}
                        >
                          <View style={{ flexDirection: "row" }}>
                            <View style={{ maxWidth: 320 }}>
                              <Text style={styles.serviceText}>
                                Booking: {element.date_in}
                                {"  "}Status: {element.status}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}VIN: {element.vin}
                                {"  "}Service Type: {element.serviceType}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}Description: {element.description}
                              </Text>
                            </View>
                            <View>
                              <BTN
                                style={styles.smallBtn}
                                styleCaption={styles.smallBtnText}
                                text="Del"
                                onPress={() => {
                                  deleteOldService({
                                    serviceId: element.serviceId,
                                    date_in: element.date_in,
                                  });
                                }}
                              />
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            </>
          </View>
        </ScrollView>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 10,
    // paddingHorizontal: 10,
  },
  bodyService: {
    //  alignItems: "center",
    justifyContent: "center",
    // paddingTop: 10,
    paddingHorizontal: 20,
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
  serviceText: {
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

  boxService: {
    marginTop: 20,
    backgroundColor: "#E6E6E6",
    // width: "100%",
  },
  blockService: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 12,
    width: "100%",

    marginTop: 10,
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

/*    */
