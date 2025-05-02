import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandler = async () => {
    try {
      const response = await axios.post(
        "http://192.168.29.191:5000/api/users/login",
        {
          email,
          password,
        }
      );
      alert("try block");
      const token = response.data.token;
      const userId = response.data._id; // Get user ID from response
      await AsyncStorage.setItem("token", token); // save token locally
      await AsyncStorage.setItem('userId', userId); // Save userId
      // console.log("response", response);

      navigation.replace("LiveLocation"); // go to live location screen
    } catch (error) {
      // console.log("error", error);

      Alert.alert(
        "Login failed",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to TrackTogether</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={loginHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingVertical: 8,
  },
});
