import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave';
type Student = { id: string; name: string; status: AttendanceStatus };

const batches = ['8th Standard','9th Standard','10th Standard','11th Science','12th Science','JEE Batch','NEET Batch','MHT-CET Batch'];
const subjects = ['Physics','Mathematics','Chemistry','Biology'];
const statusOptions: AttendanceStatus[] = ['Present','Absent','Late','Leave'];
const initialStudents: Student[] = [
  { id: '1', name: 'Rahul Sharma', status: 'Present' },
  { id: '2', name: 'Priya Singh', status: 'Present' },
  { id: '3', name: 'Amit Kumar', status: 'Present' },
  { id: '4', name: 'Neha Joshi', status: 'Present' },
  { id: '5', name: 'Sneha Kulkarni', status: 'Present' },
];

export default function MarkAttendancePage() {
  const [date, setDate] = useState('05 Sep 2026');
  const [batch, setBatch] = useState('12th Science');
  const [subject, setSubject] = useState('Physics');
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setStudents(current => current.map(s => s.id === id ? { ...s, status } : s));
  };

  const saveAttendance = () => {
    if (!date.trim() || !batch || !subject) {
      Alert.alert('Required Fields', 'Please fill Date, Batch and Subject.');
      return;
    }
    Alert.alert('Attendance Saved', 'Attendance has been marked successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Mark Attendance</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Mark Attendance</Text>
        <Text style={styles.pageSubtitle}>Select the class details and mark attendance for each student.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attendance Details</Text>
          <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="calendar-outline" size={18} color="#7040D5" />
            <TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="05 Sep 2026" placeholderTextColor="#A2AABB" />
          </View>

          <Text style={styles.label}>Batch <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
            {batches.map(item => <Option key={item} label={item} selected={batch === item} onPress={() => setBatch(item)} />)}
          </ScrollView>

          <Text style={styles.label}>Subject <Text style={styles.required}>*</Text></Text>
          <View style={styles.wrap}>
            {subjects.map(item => <Option key={item} label={item} selected={subject === item} onPress={() => setSubject(item)} />)}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Attendance</Text>
          <Text style={styles.helper}>Tap a status for each student.</Text>
          {students.map(student => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.avatar}><MaterialCommunityIcons name="account-outline" size={17} color="#7040D5" /></View>
                <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
              </View>
              <View style={styles.statusWrap}>
                {statusOptions.map(status => (
                  <TouchableOpacity key={status} style={[styles.statusButton, student.status === status && styles.statusActive]} onPress={() => updateStatus(student.id, status)} activeOpacity={0.8}>
                    {student.status === status && <MaterialCommunityIcons name="check" size={13} color="#7040D5" />}
                    <Text style={[styles.statusText, student.status === status && styles.statusTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} activeOpacity={0.8}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveAttendance} activeOpacity={0.85}>
            <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveText}>Save Attendance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <TouchableOpacity style={[styles.option, selected && styles.optionActive]} onPress={onPress} activeOpacity={0.8}>
    {selected && <MaterialCommunityIcons name="check-circle" size={14} color="#7040D5" />}
    <Text style={[styles.optionText, selected && styles.optionTextActive]} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:'#F7F8FC'},
  header:{minHeight:64,backgroundColor:'#7040D5',flexDirection:'row',alignItems:'center',paddingHorizontal:14,gap:10},
  backButton:{width:40,height:40,borderRadius:12,backgroundColor:'rgba(255,255,255,0.14)',alignItems:'center',justifyContent:'center'},
  headerTitle:{flex:1,minWidth:0,fontFamily:'PoppinsSemiBold',fontSize:20,color:'#FFFFFF'},
  container:{flex:1},
  content:{padding:16,paddingTop:28,paddingBottom:30},
  pageTitle:{fontFamily:'PoppinsBold',fontSize:20,color:'#172033'},
  pageSubtitle:{fontFamily:'PoppinsRegular',fontSize:11,lineHeight:18,color:'#7B8496',marginTop:5,marginBottom:16},
  card:{backgroundColor:'#FFFFFF',borderRadius:18,borderWidth:1,borderColor:'#E7E8ED',padding:16,marginBottom:14},
  sectionTitle:{fontFamily:'PoppinsSemiBold',fontSize:16,color:'#172033'},
  helper:{fontFamily:'PoppinsRegular',fontSize:10,color:'#8A93A4',marginTop:3,marginBottom:4},
  label:{fontFamily:'PoppinsMedium',fontSize:11,color:'#59657A',marginTop:13,marginBottom:5},
  required:{color:'#D84B63'},
  inputWrapper:{minHeight:52,borderRadius:10,borderWidth:1,borderColor:'#E0E3EA',backgroundColor:'#FFFFFF',flexDirection:'row',alignItems:'center',paddingHorizontal:11},
  input:{flex:1,minWidth:0,minHeight:50,marginLeft:8,paddingVertical:0,color:'#172033',fontFamily:'PoppinsRegular',fontSize:10},
  options:{gap:7,paddingBottom:2},
  wrap:{flexDirection:'row',flexWrap:'wrap',gap:7},
  option:{minHeight:40,maxWidth:'100%',paddingHorizontal:10,borderRadius:9,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2E5EC',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:4},
  optionActive:{backgroundColor:'#F1EAFF',borderColor:'#7040D5'},
  optionText:{fontFamily:'PoppinsMedium',fontSize:10,color:'#687386'},
  optionTextActive:{fontFamily:'PoppinsSemiBold',color:'#7040D5'},
  studentCard:{borderWidth:1,borderColor:'#E7E9EF',borderRadius:12,padding:10,marginTop:8},
  studentHeader:{flexDirection:'row',alignItems:'center',minWidth:0,marginBottom:8},
  avatar:{width:31,height:31,borderRadius:10,backgroundColor:'#F1EAFF',alignItems:'center',justifyContent:'center',marginRight:8},
  studentName:{flex:1,minWidth:0,fontFamily:'PoppinsMedium',fontSize:10,color:'#172033'},
  statusWrap:{flexDirection:'row',flexWrap:'wrap',gap:5},
  statusButton:{minHeight:32,paddingHorizontal:8,borderRadius:8,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E0E3EA',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:3},
  statusActive:{backgroundColor:'#F1EAFF',borderColor:'#7040D5'},
  statusText:{fontFamily:'PoppinsMedium',fontSize:9,color:'#687386'},
  statusTextActive:{fontFamily:'PoppinsSemiBold',color:'#7040D5'},
  actions:{flexDirection:'row',gap:8,marginTop:2},
  cancelButton:{flex:1,minHeight:48,borderRadius:11,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E0E3EA',alignItems:'center',justifyContent:'center'},
  cancelText:{fontFamily:'PoppinsSemiBold',fontSize:10,color:'#687386'},
  saveButton:{flex:1.4,minHeight:48,borderRadius:11,backgroundColor:'#7040D5',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},
  saveText:{fontFamily:'PoppinsSemiBold',fontSize:10,color:'#FFFFFF'},
});
