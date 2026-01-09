
export enum UserRole {
  PATIENT = 'PATIENT',
  POLICE = 'POLICE',
  HOSPITAL = 'HOSPITAL',
  NONE = 'NONE'
}

export type HospitalPreference = 'GOVERNMENT' | 'PRIVATE' | 'BOTH';

export enum EmergencyType {
  HEART = 'Cardiac Distress',
  ACCIDENT = 'MVA / Vascular Trauma',
  INJURY = 'Critical Physical Injury',
  EMERGENCY = 'Acute SOS Protocol',
  PREGNANCY = 'Obstetric Emergency',
  OTHERS = 'Atypical Distress'
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface PatientCase {
  id: string;
  patientName: string;
  phoneNumber: string;
  emergencyType: EmergencyType;
  location: Location;
  status: 'pending' | 'accepted' | 'dispatched' | 'completed' | 'canceled';
  hospitalName?: string;
  ambulanceDriver?: string;
  ambulanceDriverNumber?: string;
  officerName?: string;
  timestamp: number;
  hospitalPreference?: HospitalPreference;
}

export interface PoliceInfo {
  name: string;
  location: Location;
}
