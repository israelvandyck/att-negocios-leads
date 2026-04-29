import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum LeadStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
}

export interface Lead {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  rfc?: string;
  linesOfInterest?: number;
  employeeCount?: number;
  selectedPackage: string;
  status: LeadStatus;
  createdAt: any; // Firestore serverTimestamp
}

// Check connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();
