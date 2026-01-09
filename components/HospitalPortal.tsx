
import React, { useState } from 'react';
import { PatientCase, Location } from '../types';
import { 
  Hospital as HospitalIcon, Ambulance, Phone, 
  Siren, Zap, ShieldCheck, X, Loader2, ClipboardList, 
  Activity, CheckCircle2, Navigation, Radio, Building2, Building, PlusSquare,
  Globe, AlertTriangle, ArrowLeft, PhoneCall, RadioTower, Network, MapPin
} from 'lucide-react';
import { playConfirmationSound } from '../utils/audio';

interface HospitalPortalProps {
  hospitalName: string;
  hospitalType: string; 
  driverName: string;
  driverPhone: string;
  activeCases: PatientCase[];
  onUpdateCase: (id: string, status: PatientCase['status'], hospital?: string, driver?: string, driverNumber?: string) => void;
  hospitalLocation: Location | null;
  onBack: () => void;
  onHome: () => void;
}

const MAX_RADIUS_KM = 50; 

const HospitalPortal: React.FC<HospitalPortalProps> = ({ 
  hospitalName, 
  hospitalType,
  driverName, 
  driverPhone, 
  activeCases, 
  onUpdateCase, 
  hospitalLocation, 
  onBack, 
  onHome 
}) => {
  const [dispatchingCaseId, setDispatchingCaseId] = useState<string | null>(null);
  const [showDispatchSuccess, setShowDispatchSuccess] = useState<PatientCase | null>(null);

  // Filter pending cases based on hospital type preference
  const pendingTriage = activeCases.filter(c => 
    c.status === 'pending' && 
    (c.hospitalPreference === 'BOTH' || c.hospitalPreference === hospitalType)
  );

  const activeMissions = activeCases.filter(c => 
    (c.status === 'dispatched' || c.status === 'accepted') && c.hospitalName === hospitalName
  );

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleDispatch = async (item: PatientCase) => {
    playConfirmationSound();
    setDispatchingCaseId(item.id);
    await new Promise(resolve => setTimeout(resolve, 2500));
    onUpdateCase(item.id, 'dispatched', hospitalName, driverName, driverPhone);
    setDispatchingCaseId(null);
    setShowDispatchSuccess(item);
    
    setTimeout(() => {
      setShowDispatchSuccess(null);
      const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${hospitalLocation?.lat},${hospitalLocation?.lng}&destination=${item.location.lat},${item.location.lng}&travelmode=driving`;
      window.open(mapsLink, '_blank');
    }, 4000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative">
      {showDispatchSuccess && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-emerald-600/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
          <div className="max-w-xl w-full text-center space-y-12 p-12 bg-slate-950 rounded-[5rem] shadow-[0_0_150px_rgba(16,185,129,0.4)] border-4 border-white/20 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500/20 rounded-full animate-ping" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/40 rounded-full animate-[ping_3s_linear_infinite]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-emerald-600 p-12 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.6)] mb-8 animate-bounce">
                <Ambulance className="w-24 h-24 text-white" />
              </div>
              <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">UNIT DISPATCHED</h2>
              <div className="flex items-center gap-3 mt-4 text-emerald-400 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
                <Network className="w-4 h-4" /> Global Grid Synchronized
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-4 relative z-10">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Target</span>
                  <span className="text-white">{showDispatchSuccess.patientName}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Case ID</span>
                  <span className="text-emerald-400 font-black italic tracking-wider">{showDispatchSuccess.id}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Location</span>
                  <span className="text-white flex items-center gap-2"><MapPin className="w-3 h-3" /> {showDispatchSuccess.location.lat.toFixed(4)}, {showDispatchSuccess.location.lng.toFixed(4)}</span>
               </div>
            </div>

            <div className="relative z-10">
              <p className="text-emerald-500 font-black text-sm uppercase tracking-[0.4em] italic">NAVIGATING TO INTERCEPT...</p>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-emerald-500 w-0 animate-[loading_4s_linear_forwards]" />
              </div>
            </div>
            <style>{`@keyframes loading { from { width: 0%; } to { width: 100%; } }`}</style>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full font-black text-[10px] uppercase border-2 border-slate-900 dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105 active:scale-95">
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-[10px] border-emerald-600">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><HospitalIcon className="w-64 h-64" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-2 block">{hospitalType} NODE ACTIVE</span>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{hospitalName}</h2>
            <div className="flex items-center gap-4 mt-5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Active Dispatcher: {driverName}</p>
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 text-center backdrop-blur-md">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Grid Range</p>
            <p className="text-4xl font-black italic">{MAX_RADIUS_KM} KM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600/10 rounded-2xl"><Siren className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-3xl font-black uppercase italic text-slate-900 dark:text-white">Cloud SOS Feed</h3>
            </div>
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black animate-pulse shadow-lg">{pendingTriage.length} NEW</span>
          </div>

          <div className="space-y-6">
            {pendingTriage.length === 0 ? (
              <div className="py-32 bg-white dark:bg-slate-900/40 rounded-[3.5rem] text-center border-4 border-dashed border-slate-100 dark:border-slate-800">
                <Radio className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Scanning Grid Frequencies...</p>
              </div>
            ) : (
              pendingTriage.map(item => {
                const distance = hospitalLocation ? calculateDistance(hospitalLocation.lat, hospitalLocation.lng, item.location.lat, item.location.lng) : Infinity;
                
                return (
                  <div key={item.id} className={`bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border-2 transition-all flex flex-col gap-8 group border-emerald-500/20 hover:border-red-600`}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-5">
                        <div className="p-4 bg-red-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform"><Activity className="w-8 h-8" /></div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="bg-red-600/10 text-red-600 px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase italic">{item.id}</span>
                            <p className="text-red-600 font-black text-[12px] uppercase italic">{item.emergencyType}</p>
                          </div>
                          <h4 className="text-3xl font-black uppercase text-slate-900 dark:text-white leading-none">{item.patientName}</h4>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Matched Preference</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Distance</p>
                        <p className="text-2xl font-black italic text-slate-900 dark:text-white">{distance.toFixed(1)} KM</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Phone className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Mobile</p>
                          <p className="text-lg font-black dark:text-white tabular-nums">{item.phoneNumber}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open(`tel:${item.phoneNumber}`)}
                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                      >
                        <PhoneCall className="w-4 h-4" /> Call Patient
                      </button>
                    </div>

                    <button 
                      onClick={() => handleDispatch(item)}
                      disabled={!!dispatchingCaseId}
                      className="w-full py-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-[2rem] font-black text-lg italic uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 transition-all"
                    >
                      {dispatchingCaseId === item.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Ambulance className="w-6 h-6" />}
                      {dispatchingCaseId === item.id ? 'UPLINKING DISPATCH...' : 'ACCEPT & DISPATCH'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600/10 rounded-2xl"><ClipboardList className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-3xl font-black uppercase italic text-slate-900 dark:text-white">Active Grid</h3>
            </div>
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg">{activeMissions.length} LIVE</span>
          </div>

          <div className="space-y-6">
            {activeMissions.length === 0 ? (
              <div className="py-32 bg-white dark:bg-slate-900/40 rounded-[3.5rem] text-center border-4 border-dashed border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-16 h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">Node Status: Idle</p>
              </div>
            ) : (
              activeMissions.map(item => (
                <div key={item.id} className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl border-l-[15px] border-emerald-500 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 scale-125"><Zap className="w-32 h-32" /></div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h4 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{item.patientName}</h4>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="bg-emerald-600 text-[9px] font-black uppercase italic tracking-widest px-3 py-1 rounded-full">LIVE SIGNAL</span>
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] tabular-nums">ID: {item.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => window.open(`tel:${item.phoneNumber}`)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all"><Phone className="w-6 h-6 text-white" /></button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`, '_blank')} className="flex-1 py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all flex items-center justify-center gap-3"><Navigation className="w-4 h-4" /> NAVIGATION</button>
                    <button onClick={() => onUpdateCase(item.id, 'completed')} className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl">COMPLETE GRID MISSION</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalPortal;
