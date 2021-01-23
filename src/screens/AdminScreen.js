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
import { GetService, GetBookings, DeleteService } from "../services/APIConnect";

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
      new Date().getDate() + 1
    ),
  });

  const [serviceCollection, setServiceCollection] = useState([]);
  const [oldServicesCollection, setOldServicesCollection] = useState([]);

  const [markedDays, setMarkedDays] = useState();

  const [updateAll, setupdateAll] = useState(false);
  const [updateUser, setupdateUser] = useState(false);

  const onFailure = (error) => {
    if (error) {
      console.log(error.response);
      if (error.response.data && error.response.data.error) {
        alert(error && error.response.data.error);
      } else alert(error && error.response.data.Security);
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
      };
      startDay.add(7, "days");
    }
    disabledDates[today] = { selected: true, selectedColor: "#EBF2FF" };
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
    GetService()
      .then((response) => {
        //console.log(response.data.services);
        let services = response.data.services;
        let currentDate = new Date().toISOString().substr(0, 10);
        let selecteddays = {};
        let currentBookings = [];
        let oldBookings = [];
        services.map((obj) => {
          if (obj.date_in >= currentDate && obj.status == "Booked") {
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
        // data of current bookings to be mapped to adm screen
        setServiceCollection(
          currentBookings.sort((a, b) =>
            a.date_in < b.date_in ? -1 : a.date_in > b.date_in ? 1 : 0
          )
        );
        // data of old bookings to be mapped to user screen
        setOldServicesCollection(oldBookings);
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
      // setupdateUser(false);
    }
  }, [updateUser]);

  //load data from veihicles, services, and get all sundays of 2 months.
  useEffect(() => {
    DisableSundays();

    //loadUserVehicles();
    //  loadServiceType();
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

  const PartsClick = () => {
    navigation.navigate("PartsScreen", {});
  };

  const CheckClick = (index) => {
    //if admin clicked in one of the services, it opens the booking page with its data on the fields, ]
    //if clicked on bookings, it opens the booking page with blank fields.
    if (index || index == 0) {
      navigation.navigate("CheckServiceScreen", {
        CheckService: serviceCollection[index],
        ServiceCollection: serviceCollection,
      });
    } else {
      navigation.navigate("CheckServiceScreen", {
        ServiceCollection: serviceCollection,
      });
    }
  };

  const deleteService = ({ serviceId, email }) => {
    console.log(serviceId + " deleted");

    DeleteService({ serviceId, email })
      .then((response) => {
        setServiceCollection(
          serviceCollection.filter((element) => element.serviceId !== serviceId)
        );
        loadServiceCollection();
      })
      .catch(onFailure);
  };
  const deleteServiceInProgress = ({ serviceId }) => {
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

  const DelClick = ({ serviceId, date_in, email }) => {
    if (Platform.OS == "web") {
      if (confirm("Cancel booking on " + date_in + " ?")) {
        deleteService({ serviceId, email });
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
              deleteService({ serviceId, email });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.boxTitle}>
          <Text style={styles.title}>Administrator </Text>
          <Text style={styles.title}>User: {userData.name} </Text>
        </View>
        <View style={styles.buttons}>
          <BTN
            style={styles.btn}
            text="Users"
            onPress={() => {
              onClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Bookings"
            onPress={() => {
              CheckClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Parts"
            onPress={() => {
              PartsClick();
            }}
          ></BTN>
          <BTN
            style={styles.btn}
            text="Invoices"
            onPress={
              () => {
                navigation.navigate("InvoiceScreen");
              }
              //navigation.navigate("Login");
            }
          ></BTN>
        </View>
      </View>
      <View style={[{ justifyContent: "center", alignItems: "center" }]}>
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
            //  ClickDay(day.dateString);
          }}
          markingType="custom"
        />
      </View>
      <View style={[styles.boxService, { height: 200 }]}>
        <View style={[styles.headerService]}>
          <Text style={[styles.headerTitle]}>Bookings:</Text>
          <Text style={styles.count}>{serviceCollection.length} bookings</Text>
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
                      style={[styles.blockService, { backgroundColor: color }]}
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
                              CheckClick(index);
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
          <Text style={[styles.headerTitle]}>Fixed</Text>
          <Text style={styles.count}>{serviceCollection.length} vehicles </Text>
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
                      style={[styles.blockService, { backgroundColor: color }]}
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
                              CheckClick(index);
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
    height: 80,
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
    width: 90,
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
