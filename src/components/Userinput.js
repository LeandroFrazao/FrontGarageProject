import React, { Component } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";

function Userinput({
  text,
  placeholder,
  style,
  onChange,
  helperText,
  styleHelper,
  styleLabel,
  keyboardtype,
  styleInput,
  maxLength,
  value,
  editable,
  focusable,
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, styleLabel]}>{text}</Text>
      <TextInput
        placeholder={placeholder} //"Type your email"
        style={[styles.inputStyle, styleInput]}
        styleLabel={{ height: 20, paddingTop: 0 }}
        maxLength={maxLength}
        onChangeText={onChange}
        keyboardType={keyboardtype}
        value={value}
        editable={editable}
        focusable={focusable}
      ></TextInput>
      <Text style={[styles.helper, styleHelper]}>{helperText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 12,
    textAlign: "left",
    color: "#000",
    opacity: 0.6,
    //  paddingTop: 16,
  },
  inputStyle: {
    borderBottomWidth: 1,
    borderColor: "#D9D5DC",
    color: "#000",
    fontSize: 16,
    alignSelf: "stretch",
    lineHeight: 16,
    paddingTop: 0,
    // flex: 1,
    paddingBottom: 8,
    width: 200,
  },
  helper: {
    fontSize: 12,
    textAlign: "left",
    color: "red",
    opacity: 0.6,
    paddingTop: 8,
  },
});

export default Userinput;
