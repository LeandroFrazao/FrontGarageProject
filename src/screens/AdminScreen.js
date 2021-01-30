import React, { Component } from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import BTN from "../components/BTN";
import { Calendar } from "react-native-calendars";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import {
  GetService,
  GetBookings,
  DeleteService,
  GetUsers,
} from "../services/APIConnect";
import { NavigationEvents } from "react-navigation";
import * as Print from "expo-print";
import * as MediaLibrary from "expo-media-library";

export default function AdminScreen({ navigation }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    userType: "user",
    key: "",
  });
  const [dateSetting, setDateSetting] = useState({
    maxDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ),
    minDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    ),
  });

  const [usersCollection, setUsersCollection] = useState([]);
  const [bookingsDay, setBookingsDay] = useState([]);
  const [serviceInProgress, setServiceInProgress] = useState([]);
  const [serviceBooked, setServiceBooked] = useState([]);
  const [oldServicesCollection, setOldServicesCollection] = useState([]);

  const [markedDays, setMarkedDays] = useState();

  const [updateAll, setupdateAll] = useState(false);
  const [updateUser, setupdateUser] = useState(false);
  const [toPrintBookings, setToPrintBookings] = useState(false);
  const onFailure = (error) => {
    if (error) {
      console.log(error);
      if (error.response.response && error.response.data.error) {
        console.log(error.response && error.response.data.error);
      } else console.log(error.response && error.response.data.Security);
    }
  };

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
        dotColor: "#fff",
      };
      startDay.add(7, "days");
    }
    disabledDates[today] = {
      selected: true,
      selectedColor: "#EBF2FF",
      dotColor: "#fff",
    };
    setMarkedDays({ ...markedDays, ...disabledDates });
    setupdateAll(true);
  };
  //load all bookings from all users to the calendar
  const loadAllBookings = () => {
    GetBookings()
      .then((response) => {
        let bookings;
        let fullDay = {};

        bookings = response.data.results;
        console.log(bookings);
        bookings.map((obj) => {
          if (obj.count > 3) {
            fullDay[obj._id] = {
              key: obj.count,
              color: "#FF0000",
              selected: true,
              marked: true,
              dayTextColor: "#F5F5F5",
              disableTouchEvent: true,
              dotColor: "#FF0000",
              selectedColor: "#C7D4D7",
            };
          } else if (obj.count == 3) {
            fullDay[obj._id] = {
              key: obj.count,
              marked: true,
              dayTextColor: "#F5F5F5",
              dotColor: "#B3A100",
            };
          } else if (obj.count == 2) {
            fullDay[obj._id] = {
              key: obj.count,
              marked: true,
              dayTextColor: "#F5F5F5",
              dotColor: "#0049DC",
            };
          } else if (obj.count == 1) {
            fullDay[obj._id] = {
              key: obj.count,
              marked: true,
              dayTextColor: "#F5F5F5",
              dotColor: "#2CDC00",
            };
          }
        });

        setMarkedDays({ ...markedDays, ...fullDay });
        setupdateUser(true);
      })
      .catch(onFailure);
  };

  const loadServiceCollection = () => {
    GetService()
      .then((response) => {
        //console.log(response.data.services);
        let services = response.data.services;
        let currentDate = new Date().toISOString().substr(0, 10);
        let selecteddays = {};
        let currentBookings = [];
        let inProgress = [];
        console.log(services);
        services.map((obj) => {
          if (obj.date_in >= currentDate && obj.status == "Booked") {
            currentBookings.push(obj);
            console.log(obj);
            selecteddays[obj.date_in] = {
              key: markedDays[obj.date_in] ? markedDays[obj.date_in].key : 0,
              color: "#FFFF84",
              selected: true,
              marked: true,
              dayTextColor: "#F5F5F5",
              disableTouchEvent: false,
              dotColor: markedDays[obj.date_in]
                ? markedDays[obj.date_in].dotColor
                : "#fff",
              selectedColor: "#FFFF84",
            };
            console.log(selecteddays);
          } else if (obj.status == "Fixed" || obj.status == "In Service") {
            inProgress.push(obj);
          }
        });

        // days to be marked in the calendar
        setMarkedDays({ ...markedDays, ...selecteddays });
        // data of current bookings to be mapped to adm screen
        setServiceBooked(
          currentBookings.sort((a, b) =>
            a.date_in < b.date_in ? -1 : a.date_in > b.date_in ? 1 : 0
          )
        );

        // data of old bookings to be mapped to user screen
        setServiceInProgress(inProgress);
      })
      .catch(onFailure);
  };

  // load information of user, includind their vehicles
  const loadUsers = () => {
    GetUsers()
      .then((response) => {
        let user = [];
        user = response.data.users;
        setUsersCollection(user);
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
      loadServiceCollection();
      setupdateUser(false);
    }
  }, [updateUser]);

  //load data from veihicles, services, and get all sundays of 2 months.
  useEffect(() => {
    console.log("UseEffect");
    DisableSundays();
    loadUsers();
  }, []);

  useEffect(() => {
    const getStorage = () => {
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
    getStorage();
  }, []);

  // to call to print after the useState of toPrintbooking is updated
  useEffect(() => {
    if (toPrintBookings) {
      PrintClick();
      setToPrintBookings(false);
    }
  }, [toPrintBookings]);

  const PartsClick = () => {
    navigation.navigate("PartsScreen", {});
  };

  const CheckClickBooked = (index) => {
    //if admin clicked in one of the services, it opens the booking page with its data on the fields, ]

    navigation.navigate("CheckServiceScreen", {
      CheckService: serviceBooked[index],
    });
  };
  const CheckClickInProgress = (index) => {
    //if admin clicked in one of the services, it opens the booking page with its data on the fields, ]

    navigation.navigate("CheckServiceScreen", {
      CheckService: serviceInProgress[index],
    });
  };
  const invoiceClick = (index) => {
    //if admin clicked in one of the services, it opens the booking page with its data on the fields, ]
    //if clicked on bookings, it opens the booking page with blank fields.

    navigation.navigate("InvoiceScreen", {
      CheckService: serviceInProgress[index],
    });
  };

  // Print list of bookings for specific date
  const PrintClick = () => {
    if (Platform.OS == "web") {
      if (confirm("Print bookings of day " + bookingsDay.date + "?")) {
        ToPrint();
      }
    } else {
      Alert.alert(
        "Print bookings to PDF",
        "Confirm?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              ToPrint();
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const htmlforMobile = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pdf Content</title>
      <style>
          body { 
              font-size: 16px;
              color: rgb(28, 28, 28);
          }            h1, h2 {
              text-align: center;
          }
          table {
            border: 1px solid black;
          }
          td{
            width:150px;  text-align:center;
            height:30px
          }
      </style>
  </head>
  <body>
      <h1>Bookings </h1>
      <h2> Date: ${bookingsDay.date} </h2>   
      <br>        
      ${bookingsDay.bookings}
      </body>
  </html>
`;

  const createPDF = async (html) => {
    console.log(html);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      console.log(uri);
      if (Platform.OS === "android") {
        const permission = await MediaLibrary.requestPermissionsAsync();

        if (permission.granted) {
          await MediaLibrary.createAssetAsync(uri);
          Alert.alert(
            "Bookings printed as pdf",
            "PDF is located on " + uri,
            [
              {
                text: "OK",
              },
            ],
            { cancelable: false }
          );
        }
      }
      return uri;
    } catch (err) {
      console.error(err);
    }
  };

  // function to detect which Platform is being used, then call the specific function to print
  const ToPrint = () => {
    if (Platform.OS != "web") {
      createPDF(htmlforMobile);
    } else {
      const popwin = window.open("", "", "heigh=400", "width=400");
      if (popwin && popwin.document) {
        popwin.document.write(htmlforMobile);
        popwin.document.close();
        popwin.print();
      }
    }
  };

  // when admin clicks on the calendar, it checks if the day has bookings and asked if the admin wants to print it
  const ClickDay = (date) => {
    console.log(serviceBooked);
    console.log(usersCollection);
    let bookings = [];
    let singleBooking;
    serviceBooked.map((obj, index) => {
      if (obj.date_in == date) {
        console.log(obj);
        usersCollection.map((element) => {
          if (
            element.email == obj.email &&
            element.vehicles &&
            element.vehicles.length > 0
          ) {
            element.vehicles.map((item) => {
              if (item.vin == obj.vin) {
                singleBooking =
                  "<table>" +
                  "<tr style='height:40px ;'>" +
                  "<td style='width:200px ;'>" +
                  "Service Type: " +
                  obj.serviceType +
                  "</td>" +
                  "</tr>" +
                  "<tr>" +
                  "<td>" +
                  "User: " +
                  element.name +
                  "  " +
                  "</td>" +
                  "<td>" +
                  " Phone: " +
                  element.phone +
                  "</td>" +
                  "<td  style='width:300px ;'>" +
                  " Email: " +
                  element.email +
                  "</td>" +
                  "</tr>" +
                  "<tr>" +
                  "<td>" +
                  "VIN: " +
                  obj.vin +
                  "</td>" +
                  "<td>" +
                  item.make +
                  " " +
                  item.model +
                  " " +
                  "</td>" +
                  "<td>" +
                  "Year: " +
                  " " +
                  item.year +
                  " " +
                  "</td>" +
                  "</tr>" +
                  "</table>" +
                  "<br>";
              }
            });
          }
        });
        if (singleBooking.length !== 0) {
          bookings += singleBooking;
        }
      }
    });
    console.log(bookings);

    setBookingsDay({ date: date, bookings: bookings });
    setToPrintBookings(true);
  };

  const deleteService = ({ serviceId, email }) => {
    console.log(serviceId + " deleted");

    DeleteService({ serviceId, email })
      .then((response) => {
        setServiceBooked(
          serviceBooked.filter((element) => element.serviceId !== serviceId)
        );
        loadServiceCollection();
      })
      .catch(onFailure);
  };
  const deleteServiceInProgress = ({ serviceId, email }) => {
    console.log(serviceId + " deleted");

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

  const DelClick = ({ serviceId, date_in, email, type }) => {
    if (Platform.OS == "web") {
      if (confirm("Cancel booking on " + date_in + " ?")) {
        if (type == "Booked") {
          deleteService({ serviceId, email });
        }
        if (type == "InProgress") {
          deleteServiceInProgress({ serviceId, email });
        }
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
              if (type == "Booked") {
                deleteService({ serviceId, email });
              }
              if (type == "InProgress") {
                deleteServiceInProgress({ serviceId, email });
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={[styles.container, { height: 1000 }]}>
      <NavigationEvents
        onWillFocus={() => {
          // to activate a chain of userstates, to reload the marked days on the calendar
          serviceBooked.length !== 0 ? setupdateUser(true) : "";
        }}
      />
      <>
        <ScrollView>
          <View style={styles.body}>
            <View style={styles.boxTitle}>
              <Text style={styles.title}>Administrator:{userData.name} </Text>
            </View>
            <View style={styles.buttons}>
              <BTN
                style={styles.btn}
                text="Bookings"
                onPress={() => {
                  navigation.navigate("CheckServiceScreen", {
                    ServiceBooked: serviceBooked,
                    ServiceInProgress: serviceInProgress,
                  });
                }}
              ></BTN>
              <BTN
                style={styles.btn}
                text="Parts"
                onPress={() => {
                  PartsClick();
                }}
              ></BTN>
            </View>
          </View>
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
                //message: Do a long press on a date to print its bookings.
              }}
              onDayLongPress={(day) => {
                ClickDay(day.dateString);
              }}
              markingType="custom"
              disabledByDefault
            />
            <Text> Long-Press on a date to print its bookings. </Text>
          </View>
          <View style={[styles.boxService, { height: 200 }]}>
            <View style={[styles.headerService]}>
              <Text style={[styles.headerTitle]}>Bookings:</Text>
              <Text style={styles.count}>{serviceBooked.length} bookings</Text>
            </View>
            <>
              <ScrollView nestedScrollEnabled>
                <View>
                  {serviceBooked.length == 0 ? (
                    <Text></Text>
                  ) : (
                    serviceBooked &&
                    serviceBooked.map((element, index) => {
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
                                {"  "}Email: {element.email}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}Description: {element.description}
                              </Text>
                            </View>
                            <View>
                              <BTN
                                style={styles.smallBtn}
                                styleCaption={styles.smallBtnText}
                                text="Check"
                                onPress={() => {
                                  CheckClickBooked(index);
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
                                    email: element.email,
                                    type: "Booked",
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
          <View style={[styles.boxService, { height: 200 }]}>
            <View style={[styles.headerService]}>
              <Text style={[styles.headerTitle]}>In Progress</Text>
              <Text style={styles.count}>
                {serviceInProgress.length} vehicles{" "}
              </Text>
            </View>
            <>
              <ScrollView nestedScrollEnabled>
                <View>
                  {serviceInProgress.length == 0 ? (
                    <Text></Text>
                  ) : (
                    serviceInProgress &&
                    serviceInProgress.map((element, index) => {
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
                                {"  "}Staff: {element.staff}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}VIN: {element.vin}
                                {"  "}Service Type: {element.serviceType}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}Email: {element.email}
                              </Text>
                              <Text style={styles.serviceText}>
                                {"  "}Description: {element.description}
                              </Text>
                            </View>
                            <View>
                              <BTN
                                style={styles.smallBtn}
                                styleCaption={styles.smallBtnText}
                                text="Check"
                                onPress={() => {
                                  CheckClickInProgress(index);
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
                                    email: element.email,

                                    type: "InProgress",
                                  });
                                }}
                              />
                              {element.status == "Fixed" ? (
                                <BTN
                                  style={[styles.smallBtn, { width: 40 }]}
                                  styleCaption={styles.smallBtnText}
                                  text="Invoice"
                                  onPress={() => {
                                    invoiceClick(index);
                                  }}
                                />
                              ) : null}
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
  },
  Header1: {
    height: 60,
    width: 360,
    marginTop: 39,
  },
  body: {
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    // paddingVertical: 20,
  },
  boxTitle: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 18,
    marginLeft: 35,
    marginTop: 5,
    textAlign: "left",
  },
  btn: {
    height: 30,
    width: 150,
    backgroundColor: "rgba(85,83,208,1)",
  },
  buttons: {
    flexDirection: "row",
    backgroundColor: "rgba(85,83,10,1)",
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
    width: 30,
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
