import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { addReminder } from "../store/actions/reminderActions";
import { buildDateFromDayTime } from "../utils/date";
import { Ionicons } from "@expo/vector-icons";

export default function AddReminder({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  
  const [reminderText, setReminderText] = useState("");
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [selectedTag, setSelectedTag] = useState("General");

  const dayRef = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const tags = ["Work", "Personal", "Health", "Shopping", "Study", "General"];
  
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  useEffect(() => {
    setTimeout(() => {
      dayRef.current?.scrollTo({ y: day * 40, animated: false });
      hourRef.current?.scrollTo({ y: 9 * 40, animated: false });
      minuteRef.current?.scrollTo({ y: 0, animated: false });
    }, 50);
  }, []);

  const handleSave = () => {
    if (!reminderText.trim()) return;

    let h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;

    const formattedHour = h.toString().padStart(2, "0");

    const date = buildDateFromDayTime({
      day: fullDays[day],
      time: `${formattedHour}:${minute} ${suffix}`,
    });

    if (date) {
      dispatch(addReminder({ 
        reminder: reminderText, 
        date, 
        userId: user.id,
        tag: selectedTag
      }));
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New reminder</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButtonContainer}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bell Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={80} color="#0A8C6D" />
        </View>

        {/* Reminder Input */}
        <View style={styles.section}>
          <Text style={styles.label}>What do you want to be reminded about?</Text>
          <TextInput
            style={styles.input}
            placeholder="Team meeting, Take medicine, etc."
            placeholderTextColor="#666"
            value={reminderText}
            onChangeText={setReminderText}
            multiline
          />
        </View>

        {/* Tag Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTag === tag && styles.tagChipActive
                ]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTag === tag && styles.tagTextActive
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day and Time Pickers */}
        <View style={styles.section}>
          <Text style={styles.label}>When?</Text>
          
          <View style={styles.pickersRow}>
            {/* Day Picker */}
            <View style={styles.pillPickerday}>
              <View style={styles.wheelContainerDay}>
                <ScrollView
                  ref={dayRef}
                  snapToInterval={40}
                  decelerationRate="fast"
                  showsVerticalScrollIndicator={false}
                  onScroll={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.y / 40);
                    setDay(i);
                  }}
                  scrollEventThrottle={16}
                >
                  {fullDays.map((d, index) => (
                    <View
                      key={index}
                      style={[
                        styles.timeItem,
                        day === index && styles.activeTimeItem,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          day === index && styles.activeTimeText,
                        ]}
                      >
                        {d}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Time Picker */}
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
          </View>

          <Text style={styles.selectedTimeText}>
            {fullDays[day]} at {hour}:{minute}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Reminder</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 12,
    fontWeight: "500",
  },
  input: {
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    width: "100%",
    minHeight: 80,
    maxHeight: 120,
    fontSize: 15,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
  },
  tagChipActive: {
    backgroundColor: "#0A8C6D",
    borderColor: "#0A8C6D",
  },
  tagText: {
    color: "#a0a0a0",
    fontSize: 14,
    fontWeight: "500",
  },
  tagTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  pickersRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  pillPickerday: {
    width: 120,
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
  wheelContainerDay: {
    height: 40,
    width: 110,
    overflow: "hidden",
  },
  wheelContainer: {
    height: 40,
    width: 40,
    overflow: "hidden",
  },
  timeItem: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTimeItem: {
    backgroundColor: "transparent",
  },
  timeText: {
    fontSize: 16,
    color: "#666",
  },
  activeTimeText: {
    color: "#0A8C6D",
    fontWeight: "bold",
    fontSize: 18,
  },
  colon: {
    color: "#0A8C6D",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  selectedTimeText: {
    marginTop: 16,
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#0A8C6D",
    borderRadius: 30,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
