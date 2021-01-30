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
import * as Print from "expo-print";
import * as MediaLibrary from "expo-media-library";
import { GetParts, GetUserVehicles } from "../services/APIConnect";

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
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    userType: "user",

    vehicle: [],
  });
  const [partsCategory, setPartsCategory] = useState([]);
  const [partsMake, setPartsMake] = useState([]);
  const [partsModel, setPartsModel] = useState([]);
  const [partsName, setPartsName] = useState([]);

  const [listData, setListData] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [costInvoice, setCostInvoice] = useState({
    totalCost: 0,
    serviceCost: 0,
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
    costService: "",
  });

  const [helperData, setHelperData] = useState({
    error: "",
    status: "",
    staff: "",
  });

  const [updateUser, setupdateUser] = useState(false);

  let controllerDropStatus;
  let controllerDropModel;
  let controllerDropMake;
  let controllerDropCategory;
  let controllerDropPartsName;

  const onFailure = (error) => {
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

  // function to load parts from databe
  const loadPartsCollection = () => {
    GetParts()
      .then((response) => {
        let categories = [];
        let parts = response.data.parts;
        parts.map((element) => {
          categories.push(element.category);
        });
        // overwrite the array with unique elements
        categories = [...new Set(categories)];
        let categoryMap = [];
        // create a map with label and value for each category to be used on drop list
        categories.map((obj) => {
          categoryMap.push({
            label: obj,
            value: obj,
          });
        });

        setPartsCollection((partsCollection) => partsCollection.concat(parts));

        setPartsModel([{ label: "Model", value: null, hidden: true }]);
        setPartsName([{ label: "Part Name", value: null, hidden: true }]);
        setPartsMake([{ label: "Make", value: null, hidden: true }]);
        setPartsCategory(
          categoryMap.sort((a, b) =>
            a.value < b.value ? -1 : a.value > b.value ? 1 : 0
          )
        );
        setupdateUser(true);
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
  };

  //to load part names in the droplist associated to a chosen model
  const loadListPartNamesByModel = (value) => {
    let result = [];

    partsCollection.map((element) => {
      if (element.model == value && element.category == partsData.category) {
        result.push(element.partName);
      }
    });

    result = [...new Set(result)];

    let partNameMap = [];
    result.map((obj) => {
      partNameMap.push({
        label: obj,
        value: obj,
      });
    });

    partNameMap.push({
      label: "Part Name",
      value: null,
      hidden: true,
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

    let result = [];
    partsCollection.map((element) => {
      if (element.category == value) {
        result.push(element.make);
      }
    });

    result = [...new Set(result)];

    let makeMap = [];
    result.map((obj) => {
      makeMap.push({
        label: obj,
        value: obj,
      });
    });

    makeMap.push({
      label: "Make",
      value: null,
      hidden: true,
    });
    setPartsMake(
      makeMap.sort((a, b) =>
        a.value < b.value ? -1 : a.value > b.value ? 1 : 0
      )
    );
  };
  //to get the cost of selected partname
  const getCostPart = (value) => {
    if (value) {
      let result = [];
      partsCollection.map((element) => {
        if (
          partsData.category == element.category &&
          partsData.model == element.model &&
          partsData.make == element.make &&
          element.partName == value
        ) {
          result.push(element.cost);
        }
      });

      setPartsData({ ...partsData, cost: result[0], partName: value });
    }
  };

  // load information of user, includind their vehicles
  const loadUserVehicles = (userEmail) => {
    GetUserVehicles(userEmail)
      .then((response) => {
        let user = [];
        user = response.data.users[0];

        setUserData(user);
      })
      .catch(onFailure);
  };

  //add part to the invoice, and update the total due
  const AddPart = ({ make, model, partName, partCost }) => {
    if (partCost !== "") {
      let total = parseInt(costInvoice.totalCost) + parseInt(partCost);
      let loaddata = [...listData]; // copying the old array
      let loadItems = [...listItems];

      let list = {
        title: "",
        data: [make + " " + model + " - " + partName + ": €" + partCost],
      };
      let totalprice = {
        title: "TOTAL DUE",
        data: ["€" + total, "Payment due on collection."],
      };

      let item = [
        "<li>" +
          make +
          " " +
          model +
          " - " +
          partName +
          ": €" +
          partCost +
          "</li>",
      ];
      loaddata.pop();
      loaddata.push(list);
      loaddata.push(totalprice);

      loadItems.push(item); //store items to be used to generate pdf file
      setCostInvoice({ ...costInvoice, totalCost: total });

      console.log(loadItems);
      setListItems(loadItems);
      setListData(loaddata);
    }
  };

  const loadListInformation = () => {
    let serviceCost = [];
    console.log(userData);

    partsCollection.map((element) => {
      if (
        element.category == "Services" &&
        element.partName == serviceData.serviceType
      ) {
        serviceCost.push(element.cost);
      }
    });
    setServiceData({ ...serviceData, costService: serviceCost });
    setCostInvoice({
      ...costInvoice,
      serviceCost: serviceCost,
      totalCost: serviceCost,
    });
    if (userData.name !== "") {
      let list;
      userData.vehicles.map((obj) => {
        if (obj.vin == serviceData.vin) {
          list = [
            {
              title: "User Information",
              data: [
                "Name: " + userData.name,
                "Phone: " + userData.phone,
                "Email: " + userData.email,
                "Vehicle Identification Number: " + serviceData.vin,
                "Vehicle: " +
                  obj.make +
                  " " +
                  obj.model +
                  " Year: " +
                  " " +
                  obj.year,
              ],
            },
            {
              title: "Service Type",
              data: [serviceData.serviceType + ": " + serviceCost],
            },
            {
              title: "Parts",
              data: [null],
            },
            {
              title: "TOTAL DUE",
              data: ["€" + serviceCost, "Payment due on collection."],
            },
          ];
        }
      });

      setListData(list);
    } else setupdateUser(true);
  };

  const loadUserService = () => {
    console.log(serviceData);
    let userService = navigation.state.params.CheckService;
    if (userService) {
      console.log(userService);

      loadUserVehicles(userService.email);

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

      setHelperData({ ...helperData, error: "" });
    } else setupdateUser(true);
  };

  useEffect(() => {
    loadUserService();
    if (updateUser) {
      loadListInformation();
      setupdateUser(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadPartsCollection();
  }, []);

  // Print Invoice
  const PrintClick = async () => {
    if (Platform.OS == "web") {
      if (confirm("Print Invoice?")) {
        ToPrint();
      }
    } else {
      Alert.alert(
        "Print Invoice to PDF",
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
          }            h1 {
              text-align: center;
          }
      </style>
  </head>
  <body>
      <h1>INVOICE</h1>
      <h2> User Information </h2>   
      <h4>Name: ${userData.name} </h4>
      <h4>Phone: ${userData.email} </h4>
      <h4>Vehicle Identification Number: ${serviceData.vin} </h4>
      </h4>
      <h3>Service Type</h2>
      <h4>${serviceData.serviceType}:  ${costInvoice.serviceCost} </h4>
      <h3>Parts</h2>
      <ul>
       ${listItems.length == 0 ? "" : listItems}
       </ul>
      <h2>TOTAL DUE</h2>
      <h4>€  ${costInvoice.totalCost} 
      <h3>Payment due on collection. </h3>
      
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
            "Invoice saved",
            "Invoice is located on " + uri,
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

  const ToPrint = () => {
    if (Platform.OS != "web") {
      createPDF(htmlforMobile);
    } else {
      const popwin = window.open("", "", "heigh=400", "width=400");
      popwin.document.write(htmlforMobile);
      popwin.document.close();
      popwin.print();
    }
  };

  return (
    <View style={[styles.container, { height: 500 }]}>
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
                    height: 310,
                    width: 320,

                    ...(Platform.OS !== "android" && { zIndex: 100 }),
                  },
                ]}
              >
                <SectionList
                  style={[{ backgroundColor: "#ffff" }]}
                  sections={listData}
                  renderItem={({ item }) => (
                    <Text
                      style={[
                        {
                          padding: 5,
                          fontSize: 14,
                          //  height: ,
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  )}
                  renderSectionHeader={({ section }) => (
                    <Text
                      style={[
                        {
                          paddingTop: 2,
                          paddingLeft: 10,
                          paddingRight: 10,
                          paddingBottom: 2,
                          fontSize: 16,
                          fontWeight: "bold",
                          backgroundColor: "rgba(247,247,247,1.0)",
                        },
                      ]}
                    >
                      {section.title}
                    </Text>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
              <View
                style={[
                  {
                    alignContent: "flex-start",
                    alignItems: "flex-start",
                    flexDirection: "row",
                    height: 225,
                    width: 200,

                    ...(Platform.OS !== "android" && { zIndex: 100 }),
                  },
                ]}
              >
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
                        controller={(instance) =>
                          (controllerDropCategory = instance)
                        }
                        onChangeList={(items, callback) => {
                          new Promise((resolve, reject) =>
                            resolve(setPartsCategory(items))
                          )
                            .then(() => callback())
                            .catch(() => {});
                        }}
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, category: item.value });
                          loadDropListMake(item.value);
                        }}
                        isVisible={dropList.isVisibleCategory}
                        onOpen={() => {
                          changeVisibility({ isVisibleCategory: true });
                          setPartsData({ ...partsData, cost: "" });
                          controllerDropModel.selectItem(null);
                          controllerDropMake.selectItem(null);
                        }}
                        onClose={() =>
                          setDropList({
                            isVisibleCategory: false,
                          })
                        }
                        containerStyle={[
                          {
                            height: 30,
                            width: 150,
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
                        controller={(instance) =>
                          (controllerDropMake = instance)
                        }
                        onChangeList={(items, callback) => {
                          new Promise((resolve, reject) =>
                            resolve(setPartsMake(items))
                          )
                            .then(() => callback())
                            .catch(() => {});
                        }}
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, make: item.value });
                          loadDropListModels(item.value);
                        }}
                        isVisible={dropList.isVisibleMake}
                        onOpen={() => {
                          changeVisibility({ isVisibleMake: true });
                          setPartsData({ ...partsData, cost: "" });
                        }}
                        onClose={() =>
                          setDropList({
                            isVisibleMake: false,
                          })
                        }
                        containerStyle={[
                          {
                            height: 30,
                            width: 150,
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
                        controller={(instance) =>
                          (controllerDropModel = instance)
                        }
                        onChangeList={(items, callback) => {
                          new Promise((resolve, reject) =>
                            resolve(setPartsModel(items))
                          )
                            .then(() => callback())
                            .catch(() => {});
                        }}
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, model: item.value });
                          loadListPartNamesByModel(item.value);
                        }}
                        isVisible={dropList.isVisibleModel}
                        onOpen={() => {
                          changeVisibility({ isVisibleModel: true });
                          setPartsData({ ...partsData, cost: "" });
                        }}
                        onClose={() =>
                          setDropList({
                            isVisibleModel: false,
                          })
                        }
                        containerStyle={[
                          {
                            height: 30,
                            width: 150,
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
                        controller={(instance) =>
                          (controllerDropPartsName = instance)
                        }
                        onChangeList={(items, callback) => {
                          new Promise((resolve, reject) =>
                            resolve(setPartsName(items))
                          )
                            .then(() => callback())
                            .catch(() => {});
                        }}
                        onChangeItem={(item) => {
                          setPartsData({ ...partsData, partName: item.value });
                          getCostPart(item.value);
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
                            width: 150,
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

                  <View
                    style={[
                      styles.viewStyle,
                      {
                        flexDirection: "row",
                        height: 80,
                        paddingTop: 10,
                        justifyContent: "space-between",
                        paddingLeft: 0,
                        width: 150,
                      },
                    ]}
                  >
                    <View>
                      <Userinput
                        style={[{ paddingLeft: 0, height: 50, width: 150 }]}
                        styleInput={[
                          styles.styleInput,
                          {
                            borderColor: "#ffff",
                            borderWidth: 2,
                            width: 150,
                            textAlign: "center",
                          },
                        ]}
                        styleHelper={{ height: 0, paddingTop: 0 }}
                        maxLength={16}
                        text="Cost €"
                        placeholder="Select above"
                        value={partsData.cost}
                        onChange={(e) =>
                          setPartsData({ ...partsData, cost: e })
                        }
                        editable={false}
                        focusable={false}
                      ></Userinput>

                      <BTN
                        style={styles.btn}
                        text={"Add part"}
                        onPress={() => {
                          AddPart({
                            make: partsData.make,
                            model: partsData.model,
                            partName: partsData.partName,
                            partCost: partsData.cost,
                          });
                        }}
                      ></BTN>
                    </View>
                  </View>
                </View>

                <View style={{ paddingLeft: 60, paddingTop: 50 }}>
                  <BTN
                    style={[
                      styles.btn,
                      listData.length > 0
                        ? { backgroundColor: "#3F51B5" }
                        : { backgroundColor: "gray" },
                    ]}
                    text={"Print"}
                    disabled={listData.length > 0 ? false : true}
                    onPress={() => {
                      PrintClick();
                    }}
                  ></BTN>
                </View>
              </View>
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
  bodyService: {
    justifyContent: "center",
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
    width: 100,

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
