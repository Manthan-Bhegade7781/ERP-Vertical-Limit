import React, { useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Status = "Scheduled" | "Completed" | "Cancelled";

type Entry = {
  id: string;
  subject: string;
  day: string;
  time: string;
  faculty: string;
  std: string;
  room: string;
  branch: string;
  status: Status;
};

const initialData: Entry[] = [
  { id: "TT001", subject: "Physics", day: "Monday", time: "09:00 AM – 10:00 AM", faculty: "Rahul Sharma", std: "JEE 12th", room: "Room 101", branch: "Pune Branch", status: "Scheduled" },
  { id: "TT002", subject: "Mathematics", day: "Monday", time: "10:15 AM – 11:15 AM", faculty: "Priya Patil", std: "JEE 12th", room: "Room 102", branch: "Pune Branch", status: "Scheduled" },
  { id: "TT003", subject: "Chemistry", day: "Tuesday", time: "09:00 AM – 10:00 AM", faculty: "Amit Joshi", std: "NEET 12th", room: "Room 103", branch: "Mumbai Branch", status: "Completed" },
  { id: "TT004", subject: "Biology", day: "Wednesday", time: "10:15 AM – 11:15 AM", faculty: "Sneha Kulkarni", std: "NEET 12th", room: "Room 104", branch: "Nashik Branch", status: "Scheduled" },
  { id: "TT005", subject: "English", day: "Thursday", time: "11:30 AM – 12:30 PM", faculty: "Neha Deshmukh", std: "JEE 11th", room: "Room 105", branch: "Pune Branch", status: "Scheduled" },
  { id: "TT006", subject: "Physics", day: "Friday", time: "01:00 PM – 02:00 PM", faculty: "Rahul Sharma", std: "JEE 11th", room: "Room 106", branch: "Mumbai Branch", status: "Cancelled" },
];

const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

const statusStyle: Record<Status, { bg: string; text: string }> = {
  Scheduled: { bg: "#E7F8F0", text: "#13A968" },
  Completed: { bg: "#EAF2FF", text: "#2675E8" },
  Cancelled: { bg: "#FFE9ED", text: "#E84D61" },
};

export default function TimetablePage() {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [faculty, setFaculty] = useState("");
  const [std, setStd] = useState("");
  const [room, setRoom] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState<Status>("Scheduled");

  const openAdd = () => router.push("/(admin)/add-timetable" as never);

  const openEdit = (item: Entry) => {
    setSelected(item);
    setSubject(item.subject); setDay(item.day); setTime(item.time);
    setFaculty(item.faculty); setStd(item.std); setRoom(item.room);
    setBranch(item.branch); setStatus(item.status);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!selected || !subject.trim() || !day || !time.trim() || !faculty.trim() || !std.trim() || !room.trim() || !branch.trim()) {
      Alert.alert("Required Fields", "Please fill all timetable details.");
      return;
    }
    const updated = { ...selected, subject: subject.trim(), day, time: time.trim(), faculty: faculty.trim(), std: std.trim(), room: room.trim(), branch: branch.trim(), status };
    setData(current => current.map(x => x.id === updated.id ? updated : x));
    setEditVisible(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(item =>
      (!q || item.id.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q) || item.faculty.toLowerCase().includes(q) || item.branch.toLowerCase().includes(q)) &&
      (dayFilter === "All" || item.day === dayFilter)
    );
  }, [data, search, dayFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.8}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Timetable</Text>
          </View>
          <TouchableOpacity style={styles.plus} onPress={openAdd} activeOpacity={0.85}>
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Timetable</Text>
          <Text style={styles.subtitle}>Manage the timetable for your assigned branch</Text>

          <View style={styles.searchCard}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={21} color="#8491A6" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Search timetable..." placeholderTextColor="#A0A9B8" style={styles.searchInput} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
            {days.map(item => (
              <TouchableOpacity key={item} style={[styles.dayButton, dayFilter === item && styles.dayActive]} onPress={() => setDayFilter(item)}>
                <Text style={[styles.dayText, dayFilter === item && styles.dayTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filtered.map(item => {
            const colors = statusStyle[item.status];
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.identity}>
                    <View style={styles.iconBox}>
                      <MaterialCommunityIcons name="calendar-clock" size={25} color="#7040D5" />
                    </View>
                    <View style={styles.titleBox}>
                      <Text style={styles.subject}>{item.subject}</Text>
                      <Text style={styles.id}>{item.id} • {item.day}</Text>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.grid}>
                  <View style={styles.detail}><Text style={styles.label}>Day</Text><Text style={styles.value}>{item.day}</Text></View>
                  <View style={styles.detail}><Text style={styles.label}>Time</Text><Text style={styles.value}>{item.time}</Text></View>
                  <View style={styles.detail}><Text style={styles.label}>Faculty</Text><Text style={styles.value}>{item.faculty}</Text></View>
                  <View style={styles.detail}><Text style={styles.label}>STD</Text><Text style={styles.value}>{item.std}</Text></View>
                  <View style={styles.detail}><Text style={styles.label}>Room</Text><Text style={styles.value}>{item.room}</Text></View>
                  <View style={styles.detail}><Text style={styles.label}>Branch</Text><Text style={styles.value}>{item.branch}</Text></View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="pencil-outline" size={17} color="#FFFFFF" />
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewButton} onPress={() => { setSelected(item); setViewVisible(true); }} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="eye-outline" size={18} color="#7040D5" />
                    <Text style={styles.viewText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {filtered.length === 0 && (
            <View style={styles.empty}><MaterialCommunityIcons name="calendar-remove-outline" size={38} color="#A1A9B7" /><Text style={styles.emptyTitle}>No timetable records found</Text></View>
          )}
        </ScrollView>

        <Modal visible={viewVisible} transparent animationType="fade" onRequestClose={() => setViewVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <View><Text style={styles.modalTitle}>Timetable Details</Text><Text style={styles.modalSub}>{selected?.id}</Text></View>
                <TouchableOpacity style={styles.close} onPress={() => setViewVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity>
              </View>
              {selected && <><Text style={styles.modalSubject}>{selected.subject}</Text><Text style={styles.modalSub}>{selected.day} • {selected.time}</Text><View style={styles.modalGrid}>{[["Faculty", selected.faculty],["STD", selected.std],["Room", selected.room],["Branch", selected.branch],["Status", selected.status]].map(([l,v]) => <View style={styles.modalDetail} key={l}><Text style={styles.label}>{l}</Text><Text style={styles.value}>{v}</Text></View>)}</View><TouchableOpacity style={styles.modalEdit} onPress={() => { setViewVisible(false); openEdit(selected); }}><MaterialCommunityIcons name="pencil-outline" size={18} color="#FFFFFF" /><Text style={styles.modalEditText}>Edit Timetable</Text></TouchableOpacity></>}
            </View>
          </View>
        </Modal>

        <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.editModal}>
              <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Edit Timetable</Text><Text style={styles.modalSub}>Update timetable information</Text></View><TouchableOpacity style={styles.close} onPress={() => setEditVisible(false)}><MaterialCommunityIcons name="close" size={20} color="#66768A" /></TouchableOpacity></View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  ["Subject", subject, setSubject], ["Day", day, setDay], ["Time", time, setTime],
                  ["Faculty", faculty, setFaculty], ["STD", std, setStd], ["Room", room, setRoom], ["Branch", branch, setBranch],
                ].map(([label, value, setter]) => <View key={label as string}><Text style={styles.inputLabel}>{label as string}</Text><TextInput value={value as string} onChangeText={setter as (v: string) => void} style={styles.input} placeholder={`Enter ${(label as string).toLowerCase()}`} placeholderTextColor="#A0A9B8" /></View>)}
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.options}>{(["Scheduled","Completed","Cancelled"] as Status[]).map(s => <TouchableOpacity key={s} style={[styles.option, status === s && styles.optionActive]} onPress={() => setStatus(s)}><Text style={[styles.optionText, status === s && styles.optionTextActive]}>{s}</Text></TouchableOpacity>)}</View>
                <View style={styles.modalActions}><TouchableOpacity style={styles.cancel} onPress={() => setEditVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.save} onPress={saveEdit}><Text style={styles.saveText}>Save Changes</Text></TouchableOpacity></View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#F7F8FC"}, container:{flex:1,backgroundColor:"#F7F8FC"},
  header:{minHeight:68,backgroundColor:"#7040D5",paddingHorizontal:16,paddingVertical:12,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  headerLeft:{flex:1,flexDirection:"row",alignItems:"center"}, back:{width:44,height:44,borderRadius:12,backgroundColor:"rgba(255,255,255,0.15)",alignItems:"center",justifyContent:"center",marginRight:10},
  headerTitle:{fontFamily:"PoppinsSemiBold",fontSize:22,color:"#FFF"}, plus:{width:50,height:50,borderRadius:13,backgroundColor:"#FFF",alignItems:"center",justifyContent:"center"}, plusText:{fontSize:30,color:"#7040D5",fontFamily:"PoppinsRegular",lineHeight:32,marginTop:-2},
  content:{paddingHorizontal:16,paddingTop:14,paddingBottom:22}, pageTitle:{fontFamily:"PoppinsSemiBold",fontSize:19,color:"#172033"}, subtitle:{fontFamily:"PoppinsRegular",fontSize:10,color:"#7C879A",marginTop:2,marginBottom:14},
  searchCard:{backgroundColor:"#FFF",borderRadius:14,padding:12,borderWidth:1,borderColor:"#E8EAF0",marginBottom:16}, searchBox:{height:46,borderWidth:1,borderColor:"#E3E6ED",borderRadius:11,paddingHorizontal:12,flexDirection:"row",alignItems:"center"}, searchInput:{flex:1,fontFamily:"PoppinsRegular",fontSize:11,color:"#263047",marginLeft:9},
  dayRow:{paddingBottom:10}, dayButton:{height:38,paddingHorizontal:13,borderRadius:9,backgroundColor:"#FFF",borderWidth:1,borderColor:"#E3E6ED",alignItems:"center",justifyContent:"center",marginRight:7},dayActive:{backgroundColor:"#7040D5",borderColor:"#7040D5"},dayText:{fontFamily:"PoppinsSemiBold",fontSize:10,color:"#788397"},dayTextActive:{color:"#FFF"},
  card:{backgroundColor:"#FFF",borderRadius:14,padding:13,borderWidth:1,borderColor:"#ECEEF4",marginBottom:9,elevation:2},cardTop:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},identity:{flex:1,flexDirection:"row",alignItems:"center"},iconBox:{width:44,height:44,borderRadius:11,backgroundColor:"#F0E8FF",alignItems:"center",justifyContent:"center",marginRight:9},titleBox:{flex:1},subject:{fontFamily:"PoppinsSemiBold",fontSize:13,color:"#202A3D"},id:{fontFamily:"PoppinsRegular",fontSize:9.5,color:"#8D98AA",marginTop:2},badge:{paddingHorizontal:10,paddingVertical:7,borderRadius:8,marginLeft:10},badgeText:{fontFamily:"PoppinsSemiBold",fontSize:9.5},
  divider:{height:1,backgroundColor:"#EEF0F4",marginTop:11,marginBottom:10},grid:{flexDirection:"row",flexWrap:"wrap"},detail:{width:"50%",marginBottom:9},label:{fontFamily:"PoppinsRegular",fontSize:9.5,color:"#8290A5",marginBottom:3},value:{fontFamily:"PoppinsRegular",fontSize:11.5,color:"#263047"},
  actions:{flexDirection:"row",marginTop:1,gap:7},editButton:{flex:1,height:34,borderRadius:8,backgroundColor:"#7040D5",flexDirection:"row",alignItems:"center",justifyContent:"center",marginRight:0},editText:{fontFamily:"PoppinsSemiBold",fontSize:10,color:"#FFF",marginLeft:6},viewButton:{flex:1,height:34,borderRadius:8,backgroundColor:"#FFF",borderWidth:1,borderColor:"#7040D5",flexDirection:"row",alignItems:"center",justifyContent:"center",marginLeft:0},viewText:{fontFamily:"PoppinsSemiBold",fontSize:10,color:"#7040D5",marginLeft:6},
  empty:{backgroundColor:"#FFF",borderRadius:14,padding:32,alignItems:"center"},emptyTitle:{fontFamily:"PoppinsSemiBold",fontSize:14,color:"#202A3D",marginTop:10},
  overlay:{flex:1,backgroundColor:"rgba(15,20,32,0.48)",justifyContent:"center",padding:20},modal:{maxHeight:"80%",backgroundColor:"#FFF",borderRadius:16,padding:16},editModal:{maxHeight:"90%",backgroundColor:"#FFF",borderRadius:16,padding:16},modalHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12},modalTitle:{fontFamily:"PoppinsSemiBold",fontSize:17,color:"#202A3D"},modalSub:{fontFamily:"PoppinsRegular",fontSize:10,color:"#8B96A8",marginTop:2},close:{width:36,height:36,borderRadius:10,backgroundColor:"#F5F6FA",alignItems:"center",justifyContent:"center"},modalSubject:{fontFamily:"PoppinsSemiBold",fontSize:15,color:"#202A3D",marginBottom:4},modalGrid:{flexDirection:"row",flexWrap:"wrap",marginTop:12},modalDetail:{width:"50%",paddingVertical:9},modalEdit:{height:40,borderRadius:9,backgroundColor:"#7040D5",flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:15},modalEditText:{fontFamily:"PoppinsSemiBold",fontSize:11,color:"#FFF",marginLeft:7},
  inputLabel:{fontFamily:"PoppinsSemiBold",fontSize:10,color:"#58657A",marginBottom:6,marginTop:5},input:{minHeight:42,borderWidth:1,borderColor:"#E1E4EB",borderRadius:10,paddingHorizontal:12,fontFamily:"PoppinsRegular",fontSize:11,color:"#263047",marginBottom:10},options:{flexDirection:"row",flexWrap:"wrap",marginBottom:12},option:{paddingHorizontal:12,paddingVertical:7,borderRadius:9,backgroundColor:"#F7F8FC",borderWidth:1,borderColor:"#E5E7EE",marginRight:8,marginBottom:8},optionActive:{backgroundColor:"#F0E8FF",borderColor:"#7040D5"},optionText:{fontFamily:"PoppinsSemiBold",fontSize:9.5,color:"#788397"},optionTextActive:{color:"#7040D5"},modalActions:{flexDirection:"row",justifyContent:"flex-end",paddingTop:6},cancel:{minHeight:40,paddingHorizontal:18,borderRadius:10,borderWidth:1,borderColor:"#DDDDE5",alignItems:"center",justifyContent:"center",marginRight:9},cancelText:{fontFamily:"PoppinsSemiBold",fontSize:10.5,color:"#687388"},save:{minHeight:40,paddingHorizontal:18,borderRadius:10,backgroundColor:"#7040D5",alignItems:"center",justifyContent:"center"},saveText:{fontFamily:"PoppinsSemiBold",fontSize:10.5,color:"#FFF"},
});
