import { Feather, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import uuid from 'react-native-uuid';
import { authentication, database } from "./../../Firebaseconfig";

// Exact color palette matching the brand identity of grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Page background context
  ink: "#1F2B22",      // Dominant headers
  inkSoft: "#4B5A4C",  // Input labels & secondary text
  leaf: "#3F7A37",     // Main primary button action
  line: "#E4E0D2",     // Border frames
  cream: "#FFFDF8",    // Pure off-white container fill
};

const Signup = ({ navigation }) => {
  const [isVisbile, setisVisbile] = useState(true);
  const [userCrendetials, setuserCrendetials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { email, password, name } = userCrendetials;

  const uid = uuid.v4();
  
  const userAccount = () => {
    if (!name || !email || !password) {
      Alert.alert("Please fill out all credentials.");
      return;
    }

    createUserWithEmailAndPassword(authentication, email, password)
      .then(() => {
        navigation?.navigate('Login');
        setDoc(doc(database, "users", uid), {
          username: name,
          email: email,
          id: authentication.currentUser.uid
        });
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("That email address is already in use!");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert("That email address is invalid!");
        } else {
          Alert.alert(error.message);
        }
        console.error(error);
      });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.paper} style="dark" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Trademark Tilted Logo Section */}
        <View style={styles.logoWrapper}>
          <View style={styles.crateIconBadge}>
            <Image
              style={styles.logoIcon}
              source={require("../assets/mainIcon.png")}
            />
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.titleText}>Create Account</Text>
          <Text style={styles.subtitleText}>Enter your credentials to continue</Text>

          {/* Username Input Block */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputFieldRow}>
              <Feather name="user" size={18} color={GREEN_CRATE_COLORS.inkSoft} style={styles.inputIcon} />
              <TextInput
                maxLength={20}
                value={name}
                onChangeText={(val) => setuserCrendetials({ ...userCrendetials, name: val })}
                keyboardType="default"
                placeholder="Your username"
                placeholderTextColor="#A1A697"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Email Input Block */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputFieldRow}>
              <Feather name="mail" size={18} color={GREEN_CRATE_COLORS.inkSoft} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={(val) => setuserCrendetials({ ...userCrendetials, email: val })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="name@example.com"
                placeholderTextColor="#A1A697"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Password Input Block */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputFieldRow}>
              <Feather name="lock" size={18} color={GREEN_CRATE_COLORS.inkSoft} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={(val) => setuserCrendetials({ ...userCrendetials, password: val })}
                secureTextEntry={isVisbile}
                keyboardType="ascii-capable"
                autoCapitalize="none"
                placeholder="Minimum 6 characters"
                placeholderTextColor="#A1A697"
                style={styles.textInput}
              />
              <Ionicons
                onPress={() => setisVisbile(!isVisbile)}
                name={isVisbile ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={GREEN_CRATE_COLORS.inkSoft}
                style={styles.toggleVisibilityIcon}
              />
            </View>
          </View>

          {/* Terms text explicitly tuned down in opacity */}
          <Text style={styles.termsText}>
            By continuing you agree to our{" "}
            <Text style={{ fontWeight: "600", textDecorationLine: "underline" }}>Terms of Service</Text>{" "}
            and{" "}
            <Text style={{ fontWeight: "600", textDecorationLine: "underline" }}>Privacy Policy</Text>.
          </Text>

          {/* Main Action Submit Button */}
          <TouchableOpacity
            onPress={userAccount}
            activeOpacity={0.8}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Switch View Trigger */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation?.navigate("Login")}>
              <Text style={styles.loginLinkText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  crateIconBadge: {
    width: 60,
    height: 60,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-4deg" }],
  },
  logoIcon: {
    height: 32,
    width: 32,
    tintColor: "#FFFFFF",
    resizeMode: "contain",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleText: {
    color: GREEN_CRATE_COLORS.ink,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: "400",
    color: GREEN_CRATE_COLORS.inkSoft,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  inputGroup: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: GREEN_CRATE_COLORS.ink,
    height: "100%",
  },
  toggleVisibilityIcon: {
    paddingLeft: 10,
  },
  termsText: {
    fontSize: 12,
    color: GREEN_CRATE_COLORS.inkSoft,
    marginTop: 20,
    lineHeight: 18,
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    marginTop: 30,
    height: 54,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: GREEN_CRATE_COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footerLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  loginLinkText: {
    fontSize: 15,
    color: GREEN_CRATE_COLORS.leaf,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

export default Signup;