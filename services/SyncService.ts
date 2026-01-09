import { PatientCase, EmergencyType, HospitalPreference } from '../types';

/**
 * TACTICAL UNIVERSAL SYNC SERVICE - V4 (Hardened)
 * Optimized to handle network instability and bypass CORS/URL length restrictions.
 */

const EMERGENCY_MAP: Record<string, number> = {
  [EmergencyType.HEART]: 0,
  [EmergencyType.ACCIDENT]: 1,
  [EmergencyType.INJURY]: 2,
  [EmergencyType.EMERGENCY]: 3,
  [EmergencyType.PREGNANCY]: 4,
  [EmergencyType.OTHERS]: 5
};

const STATUS_MAP: Record<string, number> = {
  'pending': 0,
  'accepted': 1,
  'dispatched': 2,
  'completed': 3,
  'canceled': 4
};

const PREF_MAP: Record<HospitalPreference, number> = {
  'GOVERNMENT': 0,
  'PRIVATE': 1,
  'BOTH': 2
};

const REV_EMERGENCY_MAP: Record<number, EmergencyType> = Object.fromEntries(
  Object.entries(EMERGENCY_MAP).map(([k, v]) => [v, k as EmergencyType])
);

const REV_STATUS_MAP: Record<number, PatientCase['status']> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k as PatientCase['status']])
);

const REV_PREF_MAP: Record<number, HospitalPreference> = Object.fromEntries(
  Object.entries(PREF_MAP).map(([k, v]) => [v, k as HospitalPreference])
);

export class SyncService {
  private static APP_TOKEN = 'SAVIOUR_GLOBAL_V1';
  private static PUBLIC_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';
  private static GLOBAL_NODE_ID = 'SAVIOUR_EMERGENCY_GRID';

  private static cachedCases: PatientCase[] = [];
  private static lastSuccessfulTimestamp: number = 0;

  private static pack(cases: PatientCase[]) {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    return cases
      .filter(c => (now - c.timestamp) < TWENTY_FOUR_HOURS || c.status === 'pending' || c.status === 'dispatched')
      .slice(0, 30) 
      .map(c => ({
        i: c.id,
        p: c.patientName.substring(0, 15),
        n: c.phoneNumber.replace(/\D/g, '').substring(0, 10),
        e: EMERGENCY_MAP[c.emergencyType] ?? 3,
        l: [
          parseFloat(c.location.lat.toFixed(5)), 
          parseFloat(c.location.lng.toFixed(5))
        ],
        s: STATUS_MAP[c.status] ?? 0,
        h: c.hospitalName?.substring(0, 15) || '',
        d: c.ambulanceDriver?.substring(0, 15) || '',
        dn: c.ambulanceDriverNumber?.replace(/\D/g, '') || '',
        o: c.officerName?.substring(0, 15) || '',
        t: Math.floor(c.timestamp / 1000),
        pr: c.hospitalPreference ? PREF_MAP[c.hospitalPreference] : 2
      }));
  }

  private static unpack(packed: any[]): PatientCase[] {
    if (!Array.isArray(packed)) return [];
    return packed.map(p => ({
      id: p.i,
      patientName: p.p,
      phoneNumber: p.n,
      emergencyType: REV_EMERGENCY_MAP[p.e] || EmergencyType.EMERGENCY,
      location: { lat: p.l[0], lng: p.l[1] },
      status: REV_STATUS_MAP[p.s] || 'pending',
      hospitalName: p.h || undefined,
      ambulanceDriver: p.d || undefined,
      ambulanceDriverNumber: p.dn || undefined,
      officerName: p.o || undefined,
      timestamp: p.t * 1000,
      hospitalPreference: REV_PREF_MAP[p.pr] || 'BOTH'
    }));
  }

  static async pushToGlobal(cases: PatientCase[]): Promise<void> {
    const packed = this.pack(cases);
    const payload = JSON.stringify({ p: packed, t: Date.now() });
    
    try {
      // Primary: POST request with text/plain to avoid preflight
      const response = await fetch(`${this.PUBLIC_BASE_URL}/UpdateValue/${this.APP_TOKEN}/${this.GLOBAL_NODE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload
      });

      if (!response.ok) throw new Error("POST Fail");
      
      this.cachedCases = cases;
      this.lastSuccessfulTimestamp = Date.now();
    } catch (e) {
      // Fallback: Attempt GET for smaller payloads
      try {
        const encoded = encodeURIComponent(payload);
        const url = `${this.PUBLIC_BASE_URL}/UpdateValue/${this.APP_TOKEN}/${this.GLOBAL_NODE_ID}/${encoded}`;
        await fetch(url, { mode: 'no-cors' }); 
      } catch (err) {
        console.error("Critical Grid Synchronization Failure", err);
      }
    }
  }

  static async pullFromGlobal(): Promise<{ cases: PatientCase[], timestamp: number }> {
    try {
      const response = await fetch(`${this.PUBLIC_BASE_URL}/GetValue/${this.APP_TOKEN}/${this.GLOBAL_NODE_ID}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error("Pull Fail");
      
      let rawData = await response.text();
      if (!rawData || rawData === 'null' || rawData === '""') {
        return { cases: this.cachedCases, timestamp: this.lastSuccessfulTimestamp };
      }

      if (rawData.startsWith('"') && rawData.endsWith('"')) {
        try { rawData = JSON.parse(rawData); } catch (e) {}
      }
        
      const parsed = JSON.parse(rawData);
      const unpacked = this.unpack(parsed.p || []);
      
      this.cachedCases = unpacked;
      this.lastSuccessfulTimestamp = parsed.t || Date.now();

      return { cases: unpacked, timestamp: this.lastSuccessfulTimestamp };
    } catch (e) {
      return { cases: this.cachedCases, timestamp: this.lastSuccessfulTimestamp };
    }
  }

  static async atomicUpdate(updatedCase: PatientCase): Promise<PatientCase[]> {
    try {
      const { cases } = await this.pullFromGlobal();
      const caseIndex = cases.findIndex(c => c.id === updatedCase.id);
      
      let mergedCases: PatientCase[];
      if (caseIndex > -1) {
        mergedCases = cases.map(c => c.id === updatedCase.id ? updatedCase : c);
      } else {
        mergedCases = [updatedCase, ...cases];
      }
      
      await this.pushToGlobal(mergedCases);
      return mergedCases;
    } catch (e) {
      return this.cachedCases.length > 0 ? this.cachedCases : [updatedCase];
    }
  }
}