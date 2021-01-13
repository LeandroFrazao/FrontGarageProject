import React from "react";

import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";

import Userinput from "../components/Userinput";
import BTN from "../components/BTN";

import {
  GetParts,
  AddParts,
  DeletePart,
  UpdatePart,
} from "../services/APIConnect";
import DropList from "../components/DropList";
import { NavigationEvents } from "react-navigation";

export default function PartsScreen({ navigation }) {
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

  const [helperData, setHelperData] = useState({
    category: "",
    make: "",
    model: "",
    cost: "",
    partName: "",
  });
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
          partName2: "Part registered already!",
        });
      } else if (error.response.data.Security) {
        console.log(error.response.data.Security);
      }
    }
  };

  // function to load parts from databe, and then get a list of unique makes to an array.
  const loadPartsCollection = () => {
    // get all parts
    GetParts()
      .then((response) => {
        //  console.log(response.data.parts);
        console.log(response);
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
        models.map((obj) => {
          modelMap.push({
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
        partNames.map((obj) => {
          partNameMap.push({
            label: obj,
            value: obj,
          });
        });
        setPartsCollection((partsCollection) => partsCollection.concat(parts));
        setPartsMake(makesMap);
        setPartsModel(modelMap);
        setPartsCategory(categoryMap);
        setPartsName(partNameMap);
        console.log(makesMap, modelMap, categoryMap, partNameMap);
      })
      .catch(onFailure);
  };

  // To load data on screen
  useEffect(() => {
    loadPartsCollection();
    //loadVehicle();
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
    getValidation.category = validateData({ prop: category, item: "category" });
    getValidation.model = validateData({ prop: model, item: "model" });
    getValidation.cost = validateData({ prop: cost, item: "cost" });
    getValidation.partName = validateData({ prop: partName, item: "partName" });
    getValidation.make = validateData({ prop: make, item: "make" });

    setHelperData({
      category: getValidation.category,
      model: getValidation.model,
      cost: getValidation.cost,
      partName: getValidation.partName,
      make: getValidation.make,
    });
    console.log(getValidation);
    // let email = navigation.state.params.vehicle.email;
    console.log(navigation.state.params);
    if (
      getValidation.category == "" &&
      getValidation.model == "" &&
      getValidation.cost == "" &&
      getValidation.partName == "" &&
      getValidation.make == ""
    ) {
      // setPartsCollection([partsCollection.push(partsData)]);
      AddParts({ category, cost, model, make, partName })
        .then((response) => {
          console.log(response);
          setPartsCollection([]);

          loadPartsCollection();
        })
        .catch(onFailure);
    }
  }

  const UpdatePart = async ({ slug }) => {
    setBtnOption({ add: true, update: false });
    /* await UpdatePart({ slug })
      .then((result) => {
        console.log(result);
        setBtnOption({ add: true, update: false });
        setPartsCollection([]);

        loadPartsCollection();
      })
      .catch(onFailure); */
  };

  const EditClick = async (index) => {
    console.log(partsCollection[index]);
    setBtnOption({ add: false, update: true });
    setHelperData({ ...helperData, partName2: "" });
    setPartsData({
      category: partsCollection[index].category,
      make: partsCollection[index].make,
      model: partsCollection[index].model,
      cost: partsCollection[index].cost,
      partName: partsCollection[index].partName,
    });
  };
  const deletePart = async ({ slug }) => {
    console.log(slug + " deleted");

    await DeletePart({ slug: slug })
      .then((result) => {
        setPartsCollection(
          partsCollection.filter((element) => element.slug !== slug)
        );
        console.log(result);
      })
      .catch(onFailure);
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
          console.log("will Focus");
          // let vehicle = navigation.state.params.vehicle;
          //  setVehicleMake([{ label: vehicle.make, value: vehicle.make }]);
          // loadParts();
        }}
      />

      <View style={styles.bodyLogin}>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              // borderColor: "yellow",
              // borderWidth: 2,
              zIndex: 20,
            },
          ]}
        >
          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 10 }]}
            styleInput={{ width: 100 }}
            maxLength={10}
            text="Category"
            placeholder="Category"
            value={partsData.category}
            onChange={(e) => setPartsData({ ...partsData, category: e })}
            keyboardtype={"default"}
            helperText={helperData.category} //to show errors
          ></Userinput>

          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 10 }]}
            styleInput={{ width: 100 }}
            maxLength={10}
            text="Make"
            placeholder="Make"
            value={partsData.make}
            onChange={(e) => setPartsData({ ...partsData, make: e })}
            keyboardtype={"default"}
            helperText={helperData.make} //to show errors
          ></Userinput>

          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 0 }]}
            styleInput={{ width: 100 }}
            maxLength={10}
            text="Model"
            placeholder="Model"
            value={partsData.model}
            onChange={(e) => setPartsData({ ...partsData, model: e })}
            keyboardtype={"default"}
            helperText={helperData.model} //to show errors
          ></Userinput>
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",

              zIndex: 19,
            },
          ]}
        >
          <DropList
            label=""
            //helperText={helperData.category}
            items={partsCategory}
            containerStyle={[styles.styleDropdown]}
            style={[styles.dropListStyle, { paddingRight: 10 }]}
            placeholder="Categoy"
            onChangeItem={(item) => {
              setPartsData({ ...partsData, category: item.value });
            }}
            isVisible={dropList.isVisibleCategory}
            onOpen={() => changeVisibility({ isVisibleCategory: true })}
            onClose={() =>
              setDropList({
                isVisibleCategory: false,
              })
            }
          />
          <DropList
            label=""
            //helperText={helperData.category}
            items={partsMake}
            style={[styles.dropListStyle, { paddingRight: 10 }]}
            containerStyle={[styles.styleDropdown]}
            placeholder="Make"
            onChangeItem={(item) => {
              setPartsData({ ...partsData, make: item.value });
            }}
            isVisible={dropList.isVisibleMake}
            onOpen={() => changeVisibility({ isVisibleMake: true })}
            onClose={() =>
              setDropList({
                isVisibleMake: false,
              })
            }
          />
          <DropList
            label=""
            //helperText={helperData.category}
            items={partsModel}
            style={[styles.dropListStyle, { paddingRight: 10 }]}
            containerStyle={[styles.styleDropdown]}
            placeholder="Model"
            onChangeItem={(item) => {
              setPartsData({ ...partsData, model: item.value });
            }}
            isVisible={dropList.isVisibleModel}
            onOpen={() => changeVisibility({ isVisibleModel: true })}
            onClose={() =>
              setDropList({
                isVisibleModel: false,
              })
            }
          />
        </View>

        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              zIndex: 18,
              paddingTop: 50,
            },
          ]}
        >
          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 30 }]}
            styleInput={{ width: 100 }}
            maxLength={10}
            text="Part Name"
            placeholder="Part Name"
            value={partsData.partName}
            onChange={(e) => setPartsData({ ...partsData, partName: e })}
            keyboardtype={"default"}
            helperText={helperData.partName} //to show errors
          ></Userinput>
          <Userinput
            style={[styles.styleTextBox1, { paddingRight: 0 }]}
            styleInput={{ width: 100 }}
            maxLength={10}
            text="Cost"
            placeholder="Cost"
            value={partsData.cost}
            onChange={(e) => setPartsData({ ...partsData, cost: e })}
            keyboardtype={"decimal-pad"}
            helperText={helperData.cost} //to show errors
          ></Userinput>
        </View>
        <View
          style={[
            styles.viewStyle,
            {
              flexDirection: "row",
              zIndex: 8,
            },
          ]}
        >
          <DropList
            label=""
            helperText={helperData.partName2}
            items={partsName}
            style={[styles.dropListStyle, { paddingRight: 120 }]}
            containerStyle={[styles.styleDropdown]}
            helperStyle={styles.helperStyle}
            placeholder="Part name"
            onChangeItem={(item) => {
              setPartsData({ ...partsData, partName: item.value });
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

        <BTN
          style={styles.btn}
          text={btnOption.add == true ? "Add new Part" : "Update Part"}
          onPress={() => {
            btnOption.add
              ? AddClick({
                  category: partsData.category,
                  make: partsData.make,
                  model: partsData.model,
                  cost: partsData.cost,
                  partName: partsData.partName,
                })
              : UpdatePart({ slug: partsData.slug });
          }}
        ></BTN>
      </View>
      <View style={styles.boxParts}>
        <View style={styles.headerParts}>
          <Text style={styles.headerTitle}>Parts:</Text>
          <Text style={styles.count}>{partsCollection.length} items</Text>
        </View>
        <View>
          {partsCollection.slug == "" ? (
            <Text>""</Text>
          ) : (
            partsCollection &&
            partsCollection.map((element, index) => {
              let color = index % 2 == 0 ? "#E8F7FF" : "#E6E6E6";
              return (
                <View
                  key={index}
                  style={(styles.blockParts, { backgroundColor: color })}
                >
                  <View style={{ flexDirection: "row" }}>
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
                          EditClick(index);
                        }}
                      ></BTN>

                      <BTN
                        style={styles.smallBtn}
                        styleCaption={styles.smallBtnText}
                        text="Del"
                        onPress={() => {
                          DelClick({ slug: element.slug });
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyLogin: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    //   marginTop: -80,
  },
  boxTitle: {
    backgroundColor: "#E6E6E6",
    width: "100%",
    height: 96,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 30,
    textAlign: "center",
  },
  styleTextBox1: {
    height: 35,

    //width: 275,
    marginTop: 5,
    //  marginLeft: 43,
  },
  styleTextBox2: {
    height: 20,
    // width: 275,
    marginTop: 5,
    //  marginLeft: 43,
  },
  btn: {
    height: 36,
    width: 120,
    marginTop: 70,
  },
  styleDropdown: {
    width: 110,
    height: 25,
    paddingTop: 0,
  },

  dropListStyle: {
    height: 20,
    fontSize: 12,
    //paddingTop: -50,
    // borderColor: "red",
    //borderWidth: 2,
    //  height: 100,
  },

  viewStyle: {
    paddingTop: 20,
    //height: 100,
    //fontSize: 12,
    // marginTop: 5,
    // textAlign: "left",
    // paddingTop: 10,
  },
  helperStyle: {
    fontSize: 12,
    textAlign: "right",
    color: "red",
    opacity: 0.6,
    paddingLeft: 60,
    paddingTop: 60,
    position: "absolute",

    // paddingBottom: 20,
  },

  boxParts: {
    marginTop: 10,
    backgroundColor: "#E6E6E6",
    width: "100%",
  },
  headerParts: {
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

  blockParts: {
    fontFamily: "Roboto",
    color: "rgba(31,31,78,1)",
    fontSize: 12,
    width: "100%",

    marginTop: 10,
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
});
