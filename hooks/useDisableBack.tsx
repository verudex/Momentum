import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

export const useDisableBack = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backAction = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, []);
};