import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const courses = [
  ['JEE Advanced', '682 Students', 'book-open-variant'],
  ['NEET Foundation', '512 Students', 'flask-outline'],
  ['Class 10th (CBSE)', '436 Students', 'school-outline'],
  ['Class 12th (Science)', '398 Students', 'book-education-outline'],
  ['Foundation (Class 8-9)', '284 Students', 'notebook-outline'],
] as const;

export default function TopCourses() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Top Courses
        </Text>

        <TouchableOpacity>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {courses.map(
        ([name, students, icon]) => (
          <View
            key={name}
            style={styles.row}
          >
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={icon}
                size={17}
                color="#7040D6"
              />
            </View>

            <Text
              style={styles.courseName}
              numberOfLines={1}
            >
              {name}
            </Text>

            <Text style={styles.students}>
              {students}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 10,
    padding: 17,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  title: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#182131',
  },

  viewAll: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#1666DB',
  },

  row: {
    minHeight: 43,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  courseName: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#253044',
  },

  students: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#1666DB',
  },
});