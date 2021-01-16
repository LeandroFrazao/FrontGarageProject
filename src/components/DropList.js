import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
//let controller;

function DropList({
  placeholder,
  items,
  onChangeItem,
  defaultValue,
  style,
  dropDownStyle,
  containerStyle,
  helperStyle,
  label,
  styleLabel,
  helperText,
  onOpen,
  onClose,
  isVisible,
  controller,
  zIndex,
}) {
  return (
    <View style={[styles.container, { position: "relative" }]}>
      <Text style={[styles.label, styleLabel]}>{label} </Text>

      <DropDownPicker
        items={items}
        placeholder={placeholder}
        onChangeItem={onChangeItem}
        defaultValue={defaultValue}
        containerStyle={[
          {
            height: 40,
            width: 130,
          },
        ]}
        style={[styles.pickerStyle, { backgroundColor: "#fafafa" }]}
        itemStyle={{
          justifyContent: "flex-start",
        }}
        labelStyle={{
          fontSize: 14,
          textAlign: "left",
          color: "blue",
        }}
        zIndex={zIndex}
        controller={controller}
        dropDownStyle={[
          dropDownStyle,
          { marginTop: 2, backgroundColor: "#fafafa" },
        ]}
        isVisible={isVisible}
        onOpen={onOpen}
        onClose={onClose}
      />
      <Text style={[styles.helper, helperStyle]}>{helperText}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    //   backgroundColor: "transparent",
  },
  label: {
    fontSize: 12,
    textAlign: "left",
    color: "#000",
    opacity: 0.6,
    paddingTop: 16,
    width: 100,
  },
  helper: {
    fontSize: 12,
    textAlign: "left",
    color: "red",
    opacity: 0.6,
    paddingTop: 8,
  },
});
export default DropList;
