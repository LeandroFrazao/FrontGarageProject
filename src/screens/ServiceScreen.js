import React from "react";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  SafeAreaView,
  Button,
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
  GetUserVehicles,
} from "../services/APIConnect";

import { NavigationEvents } from "react-navigation";

export default function ServiceScreen({ navigation }) {
  const [valueDate, SetValueDate] = useState("");
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

  const [partsCollection, setPartsCollection] = useState([]); //pode excluir apos ajeitar a lista de bookings

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

  const [sundays, setSundays] = useState();
  const [busyDay, setBusyDay] = useState();
  const [disableDays, SetDisableDays] = useState();

  const DisableSundays = () => {
    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    let startDay = moment().day("1").month(month).year(year).startOf("month");
    const endMonth = moment()
      .month(month + 1)
      .year(year)
      .endOf("month");
    console.log(startDay);
    console.log(endMonth);
    let disabledDates = {};
    while (startDay.isBefore(endMonth)) {
      disabledDates[startDay.day("Sunday").format("YYYY-MM-DD")] = {
        disabled: true,
        disableTouchEvent: true,
      };
      startDay.add(7, "days");
    }

    SetDisableDays(disabledDates);
    console.log(disabledDates);
    // return disabledDates;
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
    let fullDay = {
      "2021-01-18": {
        disabled: true,
        disableTouchEvent: true,
      },
    };

    console.log(disableDays);
    SetDisableDays({ ...disableDays, ...fullDay });
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

  return (
    <View style={styles.container}>
      <View style={[{ paddingTop: 10, paddingHorizontal: 20 }]}>
        <View>
          <View style={[{ justifyContent: "center", alignItems: "center" }]}>
            <View style={[{}]}>
              <Calendar
                // Specify style for calendar container element. Default = {}

                style={{
                  borderWidth: 1,
                  borderColor: "gray",
                  height: 250,
                }}
                theme={{
                  // textSectionTitleDisabledColor: "#d9e1e8",
                  backgroundColor: "#ffffff",
                  calendarBackground: "#ffffff",
                  textSectionTitleColor: "#b6c1cd",
                  textSectionTitleDisabledColor: "#d9e1e8",
                  selectedDayBackgroundColor: "#00adf5",
                  selectedDayTextColor: "blue",
                  todayTextColor: "#00adf5",
                  dayTextColor: "#2d4150",
                  textDisabledColor: "#d9e1e8",
                  dotColor: "#00adf5",
                  selectedDotColor: "#ffffff",
                  arrowColor: "#2d4150",
                  disabledArrowColor: "#d9e1e8",
                  monthTextColor: "#2d4150",
                  indicatorColor: "#2d4150",
                  textDayFontFamily: "monospace",
                  textMonthFontFamily: "monospace",
                  textDayHeaderFontFamily: "monospace",
                  textDayFontWeight: "300",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "300",
                  textDayFontSize: 14,
                  textMonthFontSize: 14,
                  textDayHeaderFontSize: 14,
                  "stylesheet.day.basic": {
                    base: {
                      height: 20,
                    },
                  },
                  "stylesheet.calendar.header": {
                    week: {
                      marginTop: 0,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    },
                    dayHeader: {
                      marginTop: 0,
                      marginBottom: 0,
                      width: 35,
                      textAlign: "center",
                    },
                  },
                }}
                firstDay={1}
                // hideArrows={false}
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
                markedDates={{ ...disableDays }}
                minDate={dateSetting.minDate}
                maxDate={dateSetting.maxDate}
                // disableAllTouchEventsForDisabledDays={true}
                onDayPress={(day) => {
                  setServiceData({
                    ...serviceData,
                    date_in: day.dateString,
                  });
                }}
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
              // onChange={(e) => setServiceData({ ...serviceData, date_in: e })}
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
              height: 77,
            },
          ]}
        >
          <Userinput
            style={[{ paddingRight: 10 }]}
            styleInput={[{ width: 320 }]}
            styleHelper={[]}
            maxLength={30}
            text="Description"
            placeholder="Description"
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

        <View style={[styles.boxService]}>
          <View style={[styles.headerService]}>
            <Text style={[styles.headerTitle]}>Bookings:</Text>
            <Text style={styles.count}>{serviceCollection.length} items</Text>
          </View>
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

  boxService: {
    marginTop: 30,
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
