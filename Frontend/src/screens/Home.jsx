import { useEffect, useRef } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import PromptBox from "../components/PromptBox";
import Reminders from "../components/Reminders";

export default function Home() {
  const bottomOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      (e) => {
        Animated.timing(bottomOffset, {
          toValue: e.endCoordinates.height,
          duration: 180,
          useNativeDriver: false,
        }).start();
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => {
        Animated.timing(bottomOffset, {
          toValue: -1,
          duration: 180,
          useNativeDriver: false,
        }).start();
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const { user } = useSelector((state) => state.user);
  const today = new Date();

  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay(); // week starts Mon
    d.setDate(d.getDate() + diff + i);

    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      isToday: d.toDateString() === new Date().toDateString(),
    };
  });

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.infoContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginTop: 60,
              }}
            >
              <View style={{ flexDirection: "column", gap: 8 }}>
                <Text style={styles.title}>
                  Welcome ,{user.email.charAt(0).toUpperCase() + user.email.slice(1).split("@")[0]}
                </Text>
                <Text style={styles.subtitle}>{user.email}</Text>
              </View>
              <View style={styles.profile}>
                <Text style={styles.profileText}>
                  {user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.weekContainer}>
              {week.map((item, idx) => (
                <View
                  key={idx}
                  style={[styles.dayItem, item.isToday && styles.activeDay]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      item.isToday && styles.activeDayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateText,
                      item.isToday && styles.activeDayText,
                    ]}
                  >
                    {item.date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Reminders />
        </View>
        {/* PromptBox absolute at bottom */}
        <Animated.View
          style={[styles.promptWrapper, { bottom: bottomOffset }]}
        >
          <PromptBox />
        </Animated.View>
      </SafeAreaView>
    </>
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
  },
  infoContainer: {
    position: "absolute",
    top: -60,
    height: 250,
    width: "100%",
    gap: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0A8C6D",
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    zIndex: 1,
  },
  weekContainer: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    width: "100%",
  },
  dayItem: {
    width: 44,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  activeDay: {
    backgroundColor: "#FFFFFF",
  },

  dayText: {
    color: "#f2f2f2",
    fontSize: 12,
  },

  dateText: {
    color: "#f2f2f2",
    fontSize: 16,
    fontWeight: "600",
  },

  activeDayText: {
    color: "#0A8C6D",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f2f2f2",
  },
  subtitle: {
    fontSize: 14,
    color: "#f4f4f4",
  },
  profile: {
    width: 70,
    height: 70,
    backgroundColor: "#f2f2f2",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 24,
    color: "#0A8C6D",
    fontWeight: "bold",
  },
  promptWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
  },
});
