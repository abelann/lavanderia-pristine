import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const googleServices = require('../google-services.json');
const androidClient = googleServices.client[0];
const projectId = googleServices.project_info.project_id;

const firebaseConfig = {
  apiKey: androidClient.api_key[0].current_key,
  appId: androidClient.client_info.mobilesdk_app_id,
  authDomain: `${projectId}.firebaseapp.com`,
  messagingSenderId: googleServices.project_info.project_number,
  projectId,
  storageBucket: googleServices.project_info.storage_bucket,
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error.code !== 'auth/already-initialized') throw error;
  auth = getAuth(firebaseApp);
}

const database = getFirestore(firebaseApp);

export { auth, database };