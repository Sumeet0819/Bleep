import { Feather } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { asyncLoginUser } from "../store/actions/userActions";
import { loaduser } from "../store/reducers/userSlice";

export default function LoginScreen() {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    dispatch(asyncLoginUser(data));
  };

  const skip = () => {
    dispatch(loaduser({ id: "guest", email: "guest" }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>

        {/* EMAIL */}
        <View style={styles.inputWrapper}>
          <Feather name="mail" size={18} color="#777" />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#777"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        {/* PASSWORD */}
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#777" />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* LOGIN */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.linkText}>Create an account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={skip}>
          <Text style={styles.linkText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1A1A1A",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 55,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  loginBtn: {
    width: "100%",
    height: 55,
    backgroundColor: "#0A8C6D",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  linkText: {
    color: "#0A8C6D",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  error: {
    alignSelf: "flex-start",
    color: "#ff6b6b",
    fontSize: 13,
    marginLeft: 10,
  },
});
