import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addReminder } from "../store/actions/reminderActions";
import { buildDateFromDayTime } from "../utils/date";
import CustomDialog from "./CustomDialog";

export default function PromptBox() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [text, setText] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  ////////////////////////////////////////////////////////////////////////////
  // DAY SELECTOR
  ////////////////////////////////////////////////////////////////////////////

  const fullDays = {
    Su: "Sunday",
    Mo: "Monday",
    Tu: "Tuesday",
    We: "Wednesday",
    Th: "Thursday",
    Fr: "Friday",
    Sa: "Saturday",
  };

  const getNext7Days = () => {
    const daysShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const result = [];
    const todayIndex = new Date().getDay();

    for (let i = 0; i < 7; i++) {
      result.push(daysShort[(todayIndex + i) % 7]);
    }
    return result;
  };

  const days = getNext7Days();

  ////////////////////////////////////////////////////////////////////////////
  // TIME DATA
  ////////////////////////////////////////////////////////////////////////////

  const hours = [...Array(24).keys()].map((h) => h.toString().padStart(2, "0"));
  const minutes = [...Array(60).keys()].map((m) =>
    m.toString().padStart(2, "0")
  );

  ////////////////////////////////////////////////////////////////////////////
  // DEFAULT CURRENT TIME
  ////////////////////////////////////////////////////////////////////////////

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, "0");
  const currentMinute = now.getMinutes().toString().padStart(2, "0");

  ////////////////////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////////////////////

  const [day, setDay] = useState(days[0]);
  const [hour, setHour] = useState(currentHour);
  const [minute, setMinute] = useState(currentMinute);

  ////////////////////////////////////////////////////////////////////////////
  // SCROLL REFS
  ////////////////////////////////////////////////////////////////////////////

  const dayRef = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  ////////////////////////////////////////////////////////////////////////////
  // AUTO SCROLL ON MOUNT
  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    setTimeout(() => {
      dayRef.current?.scrollTo({ y: 0, animated: false });

      hourRef.current?.scrollTo({
        y: hours.indexOf(currentHour) * 40,
        animated: false,
      });

      minuteRef.current?.scrollTo({
        y: minutes.indexOf(currentMinute) * 40,
        animated: false,
      });
    }, 50);
  }, []);

  ////////////////////////////////////////////////////////////////////////////
  // SEND BUTTON (FIXED)
  ////////////////////////////////////////////////////////////////////////////

  const send = () => {
    if (!text.trim()) return;

    let h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;

    const formattedHour = h.toString().padStart(2, "0");

    // ✅ VALIDATE TIME BEFORE BUILDING DATE
    // Create a temporary date to check if it's in the past/current
    const now = new Date();
    const tempDate = new Date();
    
    // Calculate the day difference
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    
    const targetDay = dayMap[fullDays[day]];
    const currentDay = now.getDay();
    const dayDiff = (targetDay - currentDay + 7) % 7;
    
    tempDate.setDate(tempDate.getDate() + dayDiff);
    
    // Set the hours and minutes
    let validationHours = parseInt(hour, 10);
    const validationMinutes = parseInt(minute, 10);
    
    tempDate.setHours(validationHours, validationMinutes, 0, 0);
    
    // Check if this time is in the past or too close to now
    const timeDiff = tempDate.getTime() - now.getTime();
    
    // If the time difference is less than 1 minute (60000 ms), show error
    if (timeDiff < 60000) {
      setDialogMessage(
        timeDiff < 0 
          ? "You cannot create a reminder for a past time. Please select a future time."
          : "You cannot create a reminder for the current time. Please select a time at least 1 minute in the future."
      );
      setDialogVisible(true);
      return;
    }

    // ✅ BUILD DATE OBJECT (NOT STRING)
    const date = buildDateFromDayTime({
      day: fullDays[day],
      time: `${formattedHour}:${minute} ${suffix}`,
    });

    if (!date) {
      console.error("Invalid date generated");
      return;
    }

    dispatch(addReminder({ reminder: text, date, userId: user.id }));
    setText("");
  };

  ////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.promptBoxContainer}>
      <View style={styles.rightControls}>
        {/* DAY PICKER */}
        <View style={styles.pillPickerday}>
          <View style={styles.wheelContainerDay}>
            <ScrollView
              ref={dayRef}
              snapToInterval={40}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                const i = Math.round(e.nativeEvent.contentOffset.y / 40);
                setDay(days[i] || days[0]);
              }}
              scrollEventThrottle={16}
            >
              {days.map((d) => (
                <View
                  key={d}
                  style={[
                    styles.timeItemDay,
                    day === d && styles.activeTimeItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      day === d && styles.activeTimeText,
                    ]}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* TIME PICKER */}
        <View style={styles.pillPicker}>
          <View style={styles.wheelContainer}>
            <ScrollView
              ref={hourRef}
              snapToInterval={40}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                const i = Math.round(e.nativeEvent.contentOffset.y / 40);
                setHour(hours[i] || "00");
              }}
              scrollEventThrottle={16}
            >
              {hours.map((h) => (
                <View
                  key={h}
                  style={[styles.timeItem, hour === h && styles.activeTimeItem]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      hour === h && styles.activeTimeText,
                    ]}
                  >
                    {h}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.colon}>:</Text>

          <View style={styles.wheelContainer}>
            <ScrollView
              ref={minuteRef}
              snapToInterval={40}
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                const i = Math.round(e.nativeEvent.contentOffset.y / 40);
                setMinute(minutes[i] || "00");
              }}
              scrollEventThrottle={16}
            >
              {minutes.map((m) => (
                <View
                  key={m}
                  style={[
                    styles.timeItem,
                    minute === m && styles.activeTimeItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      minute === m && styles.activeTimeText,
                    ]}
                  >
                    {m}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Feather name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Send a message..."
        placeholderTextColor="#777"
        value={text}
        onChangeText={setText}
        multiline={true}
        style={styles.promptInput}
      />

      <CustomDialog
        visible={dialogVisible}
        title="Invalid Time"
        message={dialogMessage}
        onConfirm={() => setDialogVisible(false)}
        onCancel={() => setDialogVisible(false)}
        confirmText="Got it"
        showCancel={false}
      />
    </View>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  promptBoxContainer: {
    paddingVertical: 30,
    backgroundColor: "#111",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 15,
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },

  promptInput: {
    color: "#fff",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    width: "100%",
    minHeight: 50,
    maxHeight: 100,
    fontSize: 15,
  },

  rightControls: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 10,
    // marginTop: 10,
  },

  pillPicker: {
    width: 110,
    height: 50,
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  pillPickerday: {
    width: 50,
    height: 50,
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },

  ////////////////////////////////////////////////////////////////////////////
  // DAY WHEEL
  ////////////////////////////////////////////////////////////////////////////
  wheelContainerDay: {
    height: 40,
    width: 40,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  timeItemDay: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  ////////////////////////////////////////////////////////////////////////////
  // TIME WHEELS
  ////////////////////////////////////////////////////////////////////////////
  wheelContainer: {
    height: 40,
    width: 40,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  timeItem: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  activeTimeItem: {
    backgroundColor: "#0A8C6D44",
    borderRadius: 20,
  },

  timeText: {
    color: "#777",
    fontSize: 14,
  },

  activeTimeText: {
    color: "#0A8C6D",
    fontWeight: "700",
  },

  colon: {
    color: "#999",
    fontSize: 16,
    marginHorizontal: 4,
    marginTop: -2,
  },

  sendBtn: {
    padding: 10,
    backgroundColor: "#0A8C6D",
    borderRadius: 20,
  },
});