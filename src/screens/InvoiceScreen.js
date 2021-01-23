import React from "react";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  SectionList,
} from "react-native";
import Userinput from "../components/Userinput";
import BTN from "../components/BTN";
import DropDownPicker from "react-native-dropdown-picker";

import {
  DeleteService,
  GetService,
  UpdateStatusService,
  GetParts,
} from "../services/APIConnect";

export default function InvoiceScreen({ navigation }) {
  const [partsCollection, setPartsCollection] = useState([]);
  const [partsData, setPartsData] = useState({
    slug: "",
    category: "",
    make: "",
    model: "",
    cost: "",
    partName: "",
  });

  const [partsCategory, setPartsCategory] = useState([]);
  const [partsMake, setPartsMake] = useState([]);
  const [partsModel, setPartsModel] = useState([]);
  const [partsName, setPartsName] = useState([]);

  const [btnOption, setBtnOption] = useState({
    add: true,
    update: false,
  });
  const [dropList, setDropList] = useState({
    isVisibleCategory: false,
    isVisibleMake: false,
    isVisibleModel: false,
    isVisiblePartName: false,
  });

  const changeVisibility = (props) => {
    setDropList({
      isVisibleModel: false,
      isVisiblePartName: false,
      isVisibleMake: false,
      isVisibleCategory: false,
      ...props,
    });
  };
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

  const [updateUser, setupdateUser] = useState(false);

  let controllerDropStatus;
  //let controllerDropModel;

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

  // function to load parts from databe, and then get a list of unique makes to an array.
  const loadPartsCollection = () => {
    // height: 25 all parts
    GetParts()
      .then((response) => {
        console.log(response.data.parts);
        // console.log(response);
        let makes = [];
        let models = [];
        let categories = [];
        let partNames = [];
        // add to models array, each model of vehicles found in the parts collection from database
        let parts = response.data.parts;
        parts.map((element) => {
          makes.push(element.make);
          models.push(element.model);
          categories.push(element.category);
          partNames.push(element.partName);
        });
        // overwrite the array with unique elements
        makes = [...new Set(makes)];
        models = [...new Set(models)];
        categories = [...new Set(categories)];
        partNames = [...new Set(partNames)];

        //  console.log(makes);
        let makesMap = [];
        let modelMap = [];
        let categoryMap = [];
        let partNameMap = [];
        // create a map with label and value for each model to be used on drop list
        makes.map((obj) => {
          makesMap.push({
            label: obj,
            value: obj,
          });
        });

        categories.map((obj) => {
          categoryMap.push({
            label: obj,
            value: obj,
          });
        });

        if (partsModel.length == 0) {
          setPartsModel([{ label: "Model", value: null, hidden: true }]);
          /*  models.map((obj) => {
            modelMap.push({
              label: obj,
              value: obj,
            });
          });
          setPartsModel(
            modelMap.sort((a, b) =>
              a.value < b.value ? -1 : a.value > b.value ? 1 : 0
            )
          ); */
        } else loadDropListModels(partsData.make);

        if (partsName.length == 0) {
          setPartsName([{ label: "Part Name", value: null, hidden: true }]);

          /*  partNames.map((obj) => {
            partNameMap.push({
              label: obj,
              value: obj,
            });
          });
          setPartsName(
            partNameMap.sort((a, b) =>
              a.value < b.value ? -1 : a.value > b.value ? 1 : 0
            )
          ); */
        } else loadDropListPartNames(partsData.category);

        setPartsCollection((partsCollection) => partsCollection.concat(parts));
        setPartsMake(
          makesMap.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );
        setPartsCategory(
          categoryMap.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );

        //console.log(makesMap, modelMap, categoryMap, partNameMap);
      })
      .catch(onFailure);
  };

  //to load models in the droplist associated to a chosen make
  const loadDropListModels = (value) => {
    let result = partsCollection.filter(
      (element, index) =>
        index ===
        partsCollection.findIndex(
          (obj) => element.make == value && element.model == obj.model
        )
    );

    let modelMap = [];
    result.map((obj) => {
      modelMap.push({
        label: obj.model,
        value: obj.model,
      });
    });
    modelMap.push({ label: "Model", value: null, hidden: true });
    setPartsModel(
      modelMap.sort((a, b) =>
        a.value < b.value ? -1 : a.value > b.value ? 1 : 0
      )
    );
    //  controllerDropModel.selectItem(null);
  };

  //to load part names in the droplist associated to a chosen model
  const loadListPartNamesByModel = (value) => {
    let result = partsCollection.filter(
      (element, index) =>
        index ===
        partsCollection.findIndex(
          (obj) => element.model == value && element.partName == obj.partName
        )
    );
    console.log(result);
    let partNameMap = [];
    result.map((obj) => {
      console.log(obj);
      partNameMap.push({
        label: obj.partName,
        value: obj.partName,
      });
    });
    setPartsName(
      partNameMap.sort((a, b) =>
        a.value < b.value ? -1 : a.value > b.value ? 1 : 0
      )
    );
  };

  //to load parts names in the droplist associated to a chosen category
  const loadDropListMake = (value) => {
    //filter categories and remove duplicates.
    /* let result = partsCollection.filter(
      (element, index) =>
        index ==
        partsCollection.findIndex(
          (obj) => element.category == value && element.make == obj.make
        )
    ); */
    /*  result = partsCollection.filter(
      (element, index) =>
        element.category == value &&
        index === partsCollection.findIndex((obj) => element.make == obj.make)
    ); */
    let result = partsCollection.reduce((filtered, current) => {
      if (
        !filtered.some(
          (obj) => current.category === value && obj.make === current.make
        )
      ) {
        filtered.push(current);
      }
      return filtered;
    }, []);

    //result = partsCollection.map((obj) => obj.category == value);
    //[...new Map(partsCollection.map(obj => [obj.category, obj])).values()]
    //result = [...new Set(result)];
    console.log(result);
    let makeMap = [];
    result.map((obj) => {
      makeMap.push({
        label: obj.make,
        value: obj.make,
      });
    });
    console.log(makeMap);
    setPartsMake(
      makeMap.sort((a, b) =>
        a.value < b.value ? -1 : a.value > b.value ? 1 : 0
      )
    );
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
          if (
            obj.date_in >= currentDate ||
            obj.status != "Collected" ||
            obj.status != "Unrepairable"
          ) {
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
    if (userService) {
      console.log(userService);

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
    } else CleanClick();

    setHelperData({ ...helperData, error: "" });

    setupdateUser(true);
  };

  useEffect(() => {
    if (updateUser) {
      //   loadServiceCollection();
      setupdateUser(false);
    }
  }, [updateUser]);

  //load data from veihicles, services, and get all sundays of 2 months.
  useEffect(() => {
    loadPartsCollection();
    //  loadUserService();
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
  //clean dropdown picker and userinputs
  const CleanClick = () => {
    setServiceData({
      status: "",
      staff: "",
      vin: "",
      description: "",
      serviceType: "",
      date_in: "",
    });
    setHelperData({
      ...helperData,
      status: "",
      staff: "",
      error: "",
    });
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
              { paddingTop: 20 },
              { ...(Platform.OS !== "android" && { zIndex: 200 }) },
            ]}
          >
            <>
              <View
                style={[
                  {
                    flexDirection: "row",
                    height: 200,
                    width: 310,

                    ...(Platform.OS !== "android" && { zIndex: 100 }),
                  },
                ]}
              >
                <SectionList
                  style={[{ backgroundColor: "#ffff" }]}
                  sections={[
                    { title: "D", data: ["Devin", "Dan", "Dominic"] },
                    {
                      title: "J",
                      data: [
                        "Jackson",
                        "James",
                        "Jillian",
                        "Jimmy",
                        "Joel",
                        "John",
                        "Julie",
                      ],
                    },
                  ]}
                  renderItem={({ item }) => <Text style={[]}>{item}</Text>}
                  renderSectionHeader={({ section }) => (
                    <Text style={[]}>{section.title}</Text>
                  )}
                  keyExtractor={(item, index) => index}
                />
                <View>
                  <View
                    style={[
                      styles.viewStyle,
                      {
                        height: 36,
                        ...(Platform.OS !== "android" && { zIndex: 180 }),
                        paddingTop: 5,
                      },
                    ]}
                  >
                    <View style={[{ position: "relative", height: 36 }]}>
                      <DropDownPicker
                        items={partsCategory}
                        placeholder="Categoy"
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, category: item.value });
                          loadDropListMake(item.value);
                        }}
                        isVisible={dropList.isVisibleCategory}
                        onOpen={() =>
                          changeVisibility({ isVisibleCategory: true })
                        }
                        onClose={() =>
                          setDropList({
                            isVisibleCategory: false,
                          })
                        }
                        containerStyle={[
                          {
                            height: 30,
                            width: 120,
                          },
                        ]}
                        style={[
                          styles.dropListStyle,
                          { backgroundColor: "#fafafa", paddingRight: 10 },
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
                        dropDownStyle={[
                          { marginTop: 1, backgroundColor: "#fafafa" },
                        ]}
                      />
                      <Text style={[styles.helper]}>{helperData.category}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.viewStyle,
                      {
                        height: 36,
                        ...(Platform.OS !== "android" && { zIndex: 170 }),
                        paddingTop: 5,
                      },
                    ]}
                  >
                    <View style={[{ position: "relative", height: 36 }]}>
                      <DropDownPicker
                        items={partsMake}
                        placeholder="Make"
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, make: item.value });
                          loadDropListModels(item.value);
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
                            height: 30,
                            width: 120,
                          },
                        ]}
                        style={[
                          styles.dropListStyle,
                          { backgroundColor: "#fafafa", paddingRight: 10 },
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
                        dropDownStyle={[
                          { marginTop: 1, backgroundColor: "#fafafa" },
                        ]}
                      />
                      <Text style={[styles.helper]}>{helperData.make}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.viewStyle,
                      {
                        height: 36,
                        ...(Platform.OS !== "android" && { zIndex: 160 }),
                        paddingTop: 5,
                      },
                    ]}
                  >
                    <View style={[{ position: "relative", height: 36 }]}>
                      <DropDownPicker
                        items={partsModel}
                        placeholder="Model"
                        defaultValue={""}
                        /*   controller={(instance) =>
                          (controllerDropModel = instance)
                        }
                        onChangeList={(items, callback) => {
                          new Promise((resolve, reject) =>
                            resolve(setPartsModel(items))
                          )
                            .then(() => callback())
                            .catch(() => {});
                        }} */
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, model: item.value });
                          loadListPartNamesByModel(item.value);
                        }}
                        isVisible={dropList.isVisibleModel}
                        onOpen={() =>
                          changeVisibility({ isVisibleModel: true })
                        }
                        onClose={() =>
                          setDropList({
                            isVisibleModel: false,
                          })
                        }
                        containerStyle={[
                          {
                            height: 30,
                            width: 120,
                          },
                        ]}
                        style={[
                          styles.dropListStyle,
                          { backgroundColor: "#fafafa", paddingRight: 0 },
                        ]}
                        itemStyle={{
                          justifyContent: "flex-start",
                        }}
                        labelStyle={{
                          fontSize: 14,
                          textAlign: "left",
                          color: "blue",
                        }}
                        zIndex={5000}
                        dropDownStyle={[
                          { marginTop: 1, backgroundColor: "#fafafa" },
                        ]}
                      />
                      <Text style={[styles.helper]}>{helperData.model}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.viewStyle,
                      {
                        height: 36,
                        ...(Platform.OS !== "android" && { zIndex: 150 }),
                        paddingTop: 5,
                      },
                    ]}
                  >
                    <View style={[{ position: "relative", height: 36 }]}>
                      <DropDownPicker
                        items={partsName}
                        placeholder="Part name"
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, partName: item.value });
                        }}
                        isVisible={dropList.isVisiblePartName}
                        onOpen={() =>
                          changeVisibility({ isVisiblePartName: true })
                        }
                        onClose={() =>
                          setDropList({
                            isVisiblePartName: false,
                          })
                        }
                        containerStyle={[
                          {
                            height: 30,
                            width: 120,
                          },
                        ]}
                        style={[
                          styles.dropListStyle,
                          { backgroundColor: "#fafafa", paddingRight: 10 },
                        ]}
                        itemStyle={{
                          justifyContent: "flex-start",
                        }}
                        labelStyle={{
                          fontSize: 14,
                          textAlign: "left",
                          color: "blue",
                        }}
                        zIndex={4000}
                        dropDownStyle={[
                          { marginTop: 1, backgroundColor: "#fafafa" },
                        ]}
                      />
                      <Text style={[styles.helper]}>{helperData.partName}</Text>
                    </View>
                  </View>
                  <View>
                    <Userinput
                      style={[{ paddingRight: 46, height: 46 }]}
                      styleInput={[styles.styleInput]}
                      styleHelper={{ height: 0, paddingTop: 0 }}
                      maxLength={16}
                      text="Cost"
                      placeholder="Select options above"
                      value={partsData.cost}
                      onChange={(e) =>
                        setPartsData({ ...partsData, partName: e })
                      }
                      keyboardtype={"default"}
                    ></Userinput>
                  </View>
                </View>
              </View>
            </>

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
                              {element.status == "Fixed" ? (
                                <BTN
                                  style={styles.smallBtn}
                                  styleCaption={styles.smallBtnText}
                                  text="Invoice"
                                  onPress={() => {
                                    /*  DelClick({
                                   serviceId: element.serviceId,
                                   date_in: element.date_in,
                                 }); */
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
              <Text style={[styles.headerTitle]}>
                Collected / Unrepairable / Old Booking
              </Text>
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
