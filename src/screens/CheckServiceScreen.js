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

import {
  DeleteService,
  GetService,
  UpdateStatusService,
} from "../services/APIConnect";

export default function ServiceScreen({ navigation }) {
  const [serviceData, setServiceData] = useState({
    email: "",
    serviceId: "",
    vin: "",
    status: "",
    description: "",
    serviceType: "",
    date_in: "",
    staff: "",
  });
  const [serviceCollection, setServiceCollection] = useState([]);
  const [serviceInProgress, setServiceInProgress] = useState([]);
  const [oldServicesCollection, setOldServicesCollection] = useState([]);

  const [helperData, setHelperData] = useState({
    error: "",
    status: "",
    staff: "",
  });

  const [serviceStatus, setServiceStatus] = useState([
    { label: "Booked", value: "Booked" },
    { label: "In Service", value: "In Service" },
    { label: "Fixed", value: "Fixed" },
    { label: "Collected", value: "Collected" },
    { label: "Unrepairable", value: "Unrepairable" },
    { label: "", value: null },
  ]);

  const [dropList, setDropList] = useState({
    isVisibleVin: false,
    isVisibleServiceType: false,
    isVisibleStatus: false,
  });

  const changeVisibility = (props) => {
    setDropList({
      isVisibleVin: false,
      isVisibleServiceType: false,
      isVisibleStatus: false,
      ...props,
    });
  };

  const [updateUser, setupdateUser] = useState(false);

  let controllerDropStatus;

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

  const loadServiceCollection = () => {
    GetService()
      .then((response) => {
        //console.log(response.data.services);
        let services = response.data.services;
        let currentDate = new Date().toISOString().substr(0, 10);
        let currentBookings = [];
        let inProgress = [];
        let oldBookings = [];
        services.map((obj) => {
          if (obj.date_in >= currentDate) {
            if (obj.status == "Booked") {
              currentBookings.push(obj);
            } else inProgress.push(obj);
          } else oldBookings.push(obj);
        });
        // data of current bookings to be mapped to adm screen
        setServiceCollection(
          currentBookings.sort((a, b) =>
            a.date_in < b.date_in ? -1 : a.date_in > b.date_in ? 1 : 0
          )
        );
        // data of vehicles in the garage to be mapped to adm screen
        setServiceInProgress(
          inProgress.sort((a, b) =>
            a.date_in < b.date_in ? -1 : a.date_in > b.date_in ? 1 : 0
          )
        );
        // data of old bookings to be mapped to user screen
        setOldServicesCollection(oldBookings);
      })
      .catch(onFailure);
  };

  const loadUserService = () => {
    console.log(serviceData);

    let services = navigation.state.params.ServiceCollection;
    console.log(services);

    setServiceCollection(services);
    let userService = navigation.state.params.CheckService;
    console.log(userService);

    setHelperData({ ...helperData, error: "" });

    setServiceData({
      vin: userService.vin,
      serviceType: userService.serviceType,
      date_in: userService.date_in,
      description: userService.description,
      serviceId: userService.serviceId,
      status: userService.status,
      email: userService.email,
      staff: userService.staff,
    });

    setupdateUser(true);
  };

  useEffect(() => {
    if (updateUser) {
      loadServiceCollection();
      setupdateUser(false);
    }
  }, [updateUser]);

  //load data from veihicles, services, and get all sundays of 2 months.
  useEffect(() => {
    loadUserService();
  }, []);

  const validateData = ({ prop, item }) => {
    let toReturn = {};

    if (!prop && prop == "") {
      if (item == "Status") toReturn = "Select " + item;
      else if (item == "Staff") toReturn = "Type the name of the Staff";
      else if (item == "ServiceId") toReturn = "Select one service.";
      else toReturn = "";
    } else if (item == "Status" && prop == "Booked") {
      toReturn = "Change Status!";
    } else toReturn = "";

    return toReturn;
  };

  const updateService = ({
    serviceType,
    vin,
    date_in,
    description,
    serviceId,
    staff,
    status,
    email,
  }) => {
    UpdateStatusService({
      serviceType,
      vin,
      date_in,
      description,
      email,
      serviceId,
      staff,
      status,
    })
      .then((result) => {
        console.log(result);
        setServiceCollection([]);
        setOldServicesCollection([]);
        loadServiceCollection();
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
    staff,
    status,
    email,
  }) => {
    let getValidation = {};
    getValidation.staff = validateData({ prop: staff, item: "Staff" });
    getValidation.status = validateData({ prop: status, item: "Status" });
    getValidation.serviceId = validateData({
      prop: serviceId,
      item: "ServiceId",
    });
    setHelperData({
      staff: getValidation.staff,
      status: getValidation.status,
      error: getValidation.serviceId,
    });
    console.log(getValidation);
    if (
      getValidation.status == "" &&
      getValidation.staff == "" &&
      getValidation.serviceId == ""
    ) {
      if (Platform.OS == "web") {
        if (confirm("Update booking on " + date_in + " ?")) {
          updateService({
            serviceType,
            vin,
            date_in,
            description,
            serviceId,
            status,
            staff,
            email,
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
                  staff,
                  status,
                  email,
                });
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  };

  const EditClick = ({ index, status }) => {
    console.log(serviceCollection[index]);

    setHelperData({ ...helperData, error: "" });

    //  controllerDropStatus.selectItem(serviceCollection[index].status);
    if (status == "Booked") {
      setServiceData({
        vin: serviceCollection[index].vin,
        serviceType: serviceCollection[index].serviceType,
        date_in: serviceCollection[index].date_in,

        description: serviceCollection[index].description,

        serviceId: serviceCollection[index].serviceId,
        email: serviceCollection[index].email,
        status: serviceCollection[index].status,
      });
    } else {
      setServiceData({
        vin: serviceInProgress[index].vin,
        serviceType: serviceInProgress[index].serviceType,
        date_in: serviceInProgress[index].date_in,

        description: serviceInProgress[index].description,

        serviceId: serviceInProgress[index].serviceId,
        email: serviceInProgress[index].email,
        status: serviceInProgress[index].status,
        staff: serviceInProgress[index].staff,
      });
    }
  };

  const deleteService = ({ serviceId }) => {
    console.log(serviceId + " deleted");
    let email = navigation.state.params.userEmail;

    DeleteService({ serviceId, email })
      .then((response) => {
        setServiceCollection(
          serviceCollection.filter((element) => element.serviceId !== serviceId)
        );
        loadServiceCollection();
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
              { ...(Platform.OS !== "android" && { zIndex: 120 }) },
            ]}
          >
            <View
              style={[
                { flexDirection: "row", height: 60 },
                { ...(Platform.OS !== "android" && { zIndex: 110 }) },
              ]}
            >
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
                Date:
              </Text>
              <Userinput
                style={[{ paddingLeft: 5, paddingTop: 10, height: 60 }]}
                styleInput={[
                  {
                    width: 100,
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
                value={serviceData.date_in}
                keyboardtype={"default"}
                helperText={helperData.serviceId} //to show errors
                editable={false}
                focusable={false}
              />
              <Text style={[styles.label, { marginLeft: 15, marginTop: 20 }]}>
                Status:{" "}
              </Text>
              <View
                style={[
                  {
                    position: "relative",
                    height: 74,
                    width: 180,
                    paddingTop: 10,
                  },
                ]}
              >
                <DropDownPicker
                  items={serviceStatus}
                  placeholder="Select"
                  defaultValue={serviceData.status}
                  controller={(instance) => (controllerDropStatus = instance)}
                  onChangeList={(items, callback) => {
                    new Promise((resolve, reject) =>
                      resolve(setServiceStatus(items))
                    )
                      .then(() => callback())
                      .catch(() => {});
                  }}
                  onChangeItem={(item) => {
                    setServiceData({
                      ...serviceData,
                      status: item.value,
                    });
                  }}
                  isVisible={dropList.isVisibleStatus}
                  onOpen={() => changeVisibility({ isVisibleStatus: true })}
                  onClose={() =>
                    setDropList({
                      isVisibleStatus: false,
                    })
                  }
                  containerStyle={[
                    {
                      height: 30,
                      width: 110,
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
                  zIndex={9000}
                  dropDownStyle={[{ marginTop: 2, backgroundColor: "#fafafa" }]}
                />
                <Text style={[styles.helper]}>{helperData.status}</Text>
              </View>
            </View>

            <View
              style={[
                styles.viewStyle,
                {
                  flexDirection: "row",

                  ...(Platform.OS !== "android" && { zIndex: 90 }),
                  height: 60,
                },
              ]}
            >
              <Text
                style={[
                  {
                    height: 30,
                    marginTop: 20,

                    fontFamily: "Roboto",
                    color: "rgba(31,31,78,1)",
                    fontSize: 14,
                  },
                ]}
              >
                Staff:
              </Text>
              <Userinput
                style={[{ paddingLeft: 5, paddingTop: 10, height: 60 }]}
                styleInput={[
                  {
                    width: 200,
                    backgroundColor: "white",
                    height: 32,
                    paddingTop: 10,
                    fontSize: 14,
                  },
                ]}
                placeholder="Type the Name of the Staff"
                value={serviceData.staff ? serviceData.staff : ""}
                onChange={(e) => setServiceData({ ...serviceData, staff: e })}
                helperText={helperData.staff}
                styleHelper={{ height: 10, paddingTop: 0 }}
                text=""
                keyboardtype={"default"}
              />
            </View>
            <View
              style={[
                styles.viewStyle,
                {
                  flexDirection: "row",

                  ...(Platform.OS !== "android" && { zIndex: 90 }),
                  height: 80,
                },
              ]}
            >
              <Text
                style={[
                  {
                    height: 30,
                    marginTop: 20,

                    fontFamily: "Roboto",
                    color: "rgba(31,31,78,1)",
                    fontSize: 14,
                  },
                ]}
              >
                Vehicle:
              </Text>
              <Userinput
                style={[{ paddingLeft: 5, paddingTop: 10, height: 60 }]}
                styleInput={[
                  {
                    width: 100,
                    backgroundColor: "white",
                    borderColor: "gray",
                    borderWidth: 2,
                    height: 32,
                    paddingTop: 10,
                    fontSize: 14,
                    textAlign: "center",
                  },
                ]}
                styleHelper={{ height: 10, paddingTop: 0 }}
                text=""
                value={serviceData.vin}
                keyboardtype={"default"}
                editable={false}
                focusable={false}
              />

              <Text
                style={[
                  {
                    paddingLeft: 5,
                    height: 30,
                    marginTop: 20,

                    fontFamily: "Roboto",
                    color: "rgba(31,31,78,1)",
                    fontSize: 14,
                  },
                ]}
              >
                Service Type:
              </Text>
              <Userinput
                style={[{ paddingLeft: 5, paddingTop: 10, height: 60 }]}
                styleInput={[
                  {
                    width: 100,
                    backgroundColor: "white",
                    borderColor: "gray",
                    borderWidth: 2,
                    height: 32,
                    paddingTop: 10,
                    fontSize: 14,
                    textAlign: "center",
                  },
                ]}
                styleHelper={{ height: 0, paddingTop: 0 }}
                text=""
                value={serviceData.serviceType}
                keyboardtype={"default"}
                editable={false}
                focusable={false}
              />
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
                styleHelper={[{ height: 0, paddingTop: 0 }]}
                maxLength={30}
                text="Description"
                placeholder="Describe the problem."
                value={serviceData.description}
                onChange={(e) =>
                  setServiceData({ ...serviceData, description: e })
                }
                keyboardtype={"default"}
                helperText={helperData.description} //to show errors/>
                editable={false}
              />
            </View>
            <View
              style={[
                styles.viewStyle,
                {
                  flexDirection: "row",
                  height: 25,
                  paddingTop: 10,
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text style={[styles.helper]}>{helperData.error}</Text>
              <BTN
                style={styles.btn}
                text={"Update"}
                onPress={() => {
                  UpdateClick({
                    serviceType: serviceData.serviceType,
                    vin: serviceData.vin,
                    date_in: serviceData.date_in,
                    description: serviceData.description,
                    serviceId: serviceData.serviceId,
                    staff: serviceData.staff,
                    status: serviceData.status,
                    email: serviceData.email,
                  });
                }}
              ></BTN>
            </View>
          </View>
          <View style={[styles.boxService, { height: 200 }]}>
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
                                text="Edit"
                                onPress={() => {
                                  EditClick({ index, status: element.status });
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
              { height: 200 },
              {
                marginTop: 0,
                borderTopWidth: 15,
                borderTopColor: "#FFFF00",
              },
            ]}
          >
            <View style={[styles.headerService]}>
              <Text style={[styles.headerTitle]}>In Progress:</Text>
              <Text style={styles.count}>
                {serviceCollection.length} vehicles
              </Text>
            </View>
            <>
              <ScrollView nestedScrollEnabled>
                <View>
                  {serviceCollection.length == 0 ? (
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
                                text="Edit"
                                onPress={() => {
                                  EditClick({ index, status: element.status });
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
                borderTopWidth: 15,
                borderTopColor: "#7D8F92",
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
    paddingVertical: 5,
    //backgroundColor: "rgba(243,243,243,1)",
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
