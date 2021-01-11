import React, { Component } from "react";
import { StyleSheet, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

function DropList({ placeholder, items, onChangeItem, zIndex, defaultValue }) {
  return (
    <DropDownPicker
      items={items}
      placeholder={placeholder}
      onChangeItem={onChangeItem}
      defaultValue={defaultValue}
      containerStyle={{ height: 40, width: 130 }}
      style={{ backgroundColor: "#fafafa" }}
      itemStyle={{
        justifyContent: "flex-start",
      }}
      dropDownStyle={{ backgroundColor: "#fafafa" }}
      zIndex={zIndex}
    />
  );
}

export default DropList;
