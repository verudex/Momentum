import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from "expo-router";
import { getDoc } from 'firebase/firestore';
import { app } from '../../utils/firebaseConfig';

type UnitType = 'metric' | 'imperial';

const Settings = () => {
  const router = useRouter();
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWorkoutHistory, setShowWorkoutHistory] = useState(true);
  const [showDietHistory, setShowDietHistory] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('metric');

  const appVersion = '1.0';

  useEffect(() => {
    const fetchUserSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(firestore, 'userData', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.unitPreference === 'imperial' || data.unitPreference === 'metric') {
            setSelectedUnit(data.unitPreference);
          }
          if (typeof data.showWorkoutHistory === 'boolean') {
            setShowWorkoutHistory(data.showWorkoutHistory);
          }
          if (typeof data.showDietHistory === 'boolean') {
            setShowDietHistory(data.showDietHistory);
          }
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      }
    };

    fetchUserSettings();
  }, []);

  const handleUnitChange = async (unit: UnitType) => {
    setSelectedUnit(unit);

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(firestore, 'userData', user.uid);
      await setDoc(userRef, { unitPreference: unit }, { merge: true });
      console.log("Unit preference updated:", unit);
    } catch (error) {
      console.error("Error updating unit preference:", error);
    }
  };

  const updateVisibility = async (field: 'showWorkoutHistory' | 'showDietHistory', value: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(firestore, 'userData', user.uid);
      await setDoc(userRef, { [field]: value }, { merge: true });
      console.log(`${field} updated to`, value);
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Appearance Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="moon" size={hp(2.5)} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            thumbColor={isDarkMode ? "#BB86FC" : "#f5f5f5"}
            trackColor={{ false: "#767577", true: "#3700B3" }}
          />
        </View>
      </View>

      {/* Friends Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Friends</Text>

        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="barbell" size={hp(2.5)} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Show Workout History</Text>
          </View>
          <Switch
            value={showWorkoutHistory}
            onValueChange={(val) => {
              setShowWorkoutHistory(val);
              updateVisibility('showWorkoutHistory', val);
            }}
            thumbColor={showWorkoutHistory ? "#BB86FC" : "#f5f5f5"}
            trackColor={{ false: "#767577", true: "#3700B3" }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="nutrition-sharp" size={hp(2.5)} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Show Diet History</Text>
          </View>
          <Switch
            value={showDietHistory}
            onValueChange={(val) => {
              setShowDietHistory(val);
              updateVisibility('showDietHistory', val);
            }}
            thumbColor={showDietHistory ? "#BB86FC" : "#f5f5f5"}
            trackColor={{ false: "#767577", true: "#3700B3" }}
          />
        </View>
      </View>

      {/* Units Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Units</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleUnitChange('metric')}
        >
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Metric (kg)</Text>
          {selectedUnit === 'metric' && (
            <Ionicons name="checkmark" size={hp(2.2)} color="#34C759"/>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleUnitChange('imperial')}
        >
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Imperial (lbs)</Text>
          {selectedUnit === 'imperial' && (
            <Ionicons name="checkmark" size={hp(2.2)} color="#34C759"/>
          )}
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Account</Text>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => router.push("/(popups)/changeUsername")}
        >
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="person" size={hp(2.5)} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Change Username</Text>
          </View>
          <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => router.push("/(popups)/changePassword")}
        >
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="lock" size={hp(2.5)} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF"/>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="delete" size={hp(2.5)} color="#FF3B30" />
            <Text style={[styles.settingText, { color: '#FF3B30' }]}>Delete Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF"/>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Support</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="information-circle" size={hp(2.5)} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>App Version</Text>
          </View>
          <Text style={[styles.versionText, isDarkMode && styles.darkText]}>{appVersion}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: wp(4),
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    fontSize: hp(4),
    fontWeight: 'bold',
    marginBottom: hp(3),
    color: '#000',
  },
  darkHeader: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    marginBottom: hp(2),
    paddingVertical: hp(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
  },
  sectionTitle: {
    fontSize: hp(2.1),
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  darkText: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  darkSettingItem: {
    borderBottomColor: '#333',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: hp(2),
    marginLeft: wp(4),
    color: '#000',
  },
  versionText: {
    fontSize: hp(2),
    color: '#666',
  },
});

export default Settings;

//Dark mode
//Turn of Notifications
//ChangePassword
// Delete account
// report a bug
//Change units
// App Version (e.g., "Version 2.4.1")