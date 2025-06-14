import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import React, { useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


type UnitType = 'Metric' | 'Imperial';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('Metric');

  const appVersion = '0.0.1';


  const handleUnitChange = (unit: UnitType) => {
    setSelectedUnit(unit);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Appearance Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="moon" size={24} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
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

      {/* Notifications Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="notifications" size={24} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Enable Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={notificationsEnabled ? "#BB86FC" : "#f5f5f5"}
            trackColor={{ false: "#767577", true: "#3700B3" }}
          />
        </View>
      </View>

      {/* Account Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="lock" size={24} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="delete" size={24} color="#FF3B30" />
            <Text style={[styles.settingText, { color: '#FF3B30' }]}>Delete Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
        </TouchableOpacity>
      </View>

      {/* Units Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Units</Text>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleUnitChange('Metric')}
        >
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Metric (km, °C)</Text>
          {selectedUnit === 'Metric' && (
            <Ionicons name="checkmark" size={20} color="#34C759"/>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => handleUnitChange('Imperial')}
        >
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Imperial (miles, °F)</Text>
          {selectedUnit === 'Imperial' && (
            <Ionicons name="checkmark" size={20} color="#34C759"/>
          )}
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="bug" size={24} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
            <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Report a Bug</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.iconTextContainer}>
            <Ionicons name="information-circle" size={24} color={isDarkMode ? "#BB86FC" : "#6200EE"} />
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
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
  },
  darkHeader: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  darkText: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkSettingItem: {
    borderBottomColor: '#333',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#000',
  },
  versionText: {
    fontSize: 16,
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