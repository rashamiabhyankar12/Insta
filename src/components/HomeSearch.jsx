import { View, TextInput } from "react-native";
import React from "react";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { Feather } from "@expo/vector-icons";

const HomeSearch = ({ value, onChangeText }) => {
  return (
    <View
      style={{
        backgroundColor: "#F2F3F2",
        height: responsiveHeight(6.5),
        borderRadius: 15, // Made slightly more rounded to match your UI pattern
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 10,
      }}
    >
      <Feather name="search" size={22} color="#181725" />
      <TextInput 
        style={{ flex: 1, fontSize: 15, color: "#181725" }} 
        placeholder="Search Store" 
        placeholderTextColor="#7C7C7C"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </View>
  );
};

export default HomeSearch;