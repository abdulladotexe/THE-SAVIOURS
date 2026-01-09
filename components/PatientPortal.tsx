import React, { useState, useEffect, memo } from 'react';
import { EmergencyType, Location, PatientCase, HospitalPreference } from '../types';
import { GeminiService } from '../services/gemini';
import EmergencyBot from './EmergencyBot';
import { 
  ArrowLeft,
  Loader2, Stethoscope, HeartPulse, AlertOctagon, ShieldAlert, MoreHorizontal,
  Triangle, ShieldX, X, Building2, Building, PlusSquare,
  Settings, CheckCircle2, Ambulance, Siren, Activity, Baby, Clock
} from 'lucide-react';

interface PatientPortalProps {
  userName: string;
  location: Location | null;
  activeCases: PatientCase[];
  onCreateCase: (type: EmergencyType, preference: HospitalPreference) => Promise<PatientCase>;
  onCancelCase: (id: string) => void;
  onRefreshLocation: () => void;
  onBack: () => void;
  onHome: () => void;
}

const TacticalMap = memo(({ lat, lng, isDispatched }: { lat: number, lng: number, isDispatched: boolean }) => {
  const safeLat = lat || 0;
  const safeLng = lng || 0;
  const mapUrl = `https://maps.google.com/maps?q=${safeLat},${safeLng}&z=${isDispatched ? 16 : 14}&t=m&output=embed`;
  
  return (
    <div className="w-full h-full relative overflow-hidden rounded-[2.2rem]">
      <iframe title="Map" width="100%" height="100%" frameBorder="0" src={mapUrl} className="grayscale-[0.4] invert-[0.05] contrast-[1.1]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/40 to-transparent" />
      
      {isDispatched && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30 -m-8 scale-150" />
            <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse opacity-20 -m-12 scale-125" />
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.6rem] shadow-[0_20px_60px_rgba(220,38,38,0.6)] border-4 border-red-600 relative z-10 flex items-center justify-center animate-bounce duration-[2000ms]">
              <Ambulance className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const PatientPortal: React.FC<PatientPortalProps> = ({ userName, location, activeCases, onCreateCase, onCancelCase, onBack, onHome }) => {
  const [currentCase, setCurrentCase] = useState<PatientCase | null>(null);
  const [hospitalPreference, setHospitalPreference] = useState<HospitalPreference>('BOTH');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [etaCountdown, setEtaCountdown] = useState(600);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const myActive = activeCases.find(c => c.patientName === userName && c.status !== 'completed' && c.status !== 'canceled');
    if (myActive) {
      setCurrentCase(myActive);
      if (!aiAdvice) fetchInstantAdvice(myActive.emergencyType);
    } else {
      setCurrentCase(null);
      setAiAdvice('');
      setShowAbortConfirm(false);
    }
  }, [activeCases, userName, aiAdvice]);

  useEffect(() => {
    let interval: number | undefined;
    if (currentCase?.status === 'dispatched') {
      interval = window.setInterval(() => {
        setEtaCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setEtaCountdown(600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentCase?.status]);

  const fetchInstantAdvice = async (type: EmergencyType) => {
    setIsAiLoading(true);
    try {
      const advice = await GeminiService.getQuickAdvice('Patient', `Emergency: ${type}. Location is remote. Patient name: ${userName}`);
      setAiAdvice(advice);
    } catch (e) {
      setAiAdvice("Stay calm. Professional help is en-route.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEmergency = async (type: EmergencyType) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newCase = await onCreateCase(type, hospitalPreference);
      setCurrentCase(newCase);
      fetchInstantAdvice(type);
    } catch (err) {
      console.error("Emergency Broadcast Failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAbortMission = () => {
    if (currentCase) {
      onCancelCase(currentCase.id);
      setShowAbortConfirm(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const NavHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <button 
        onClick={currentCase ? () => setCurrentCase(null) : onBack}
        className="group flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> BACK
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div className="max-w-5xl mx-auto space-y-12 py-8">
        <NavHeader />

        {currentCase ? (
          <div className="max-w-4xl mx-auto space-y-6 relative">
            {showAbortConfirm && (
              <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-slate-900 border-2 border-red-600/50 w-full max-w-md rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.3)]">
                  <div className="bg-red-600 p-8 flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-2xl"><ShieldX className="w-8 h-8" /></div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">System Alert</h3>
                    </div>
                    <button onClick={() => setShowAbortConfirm(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-10 space-y-8">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/10 rounded-full border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Triangle className="w-3 h-3 fill-red-500" /> Critical Warning
                      </div>
                      <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">ABORT SOS MISSION?</h4>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                        This signal will be decommissioned globally.
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <button onClick={handleAbortMission} className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-[2.5rem] font-black text-xl uppercase italic shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4">Confirm Abort</button>
                      <button onClick={() => setShowAbortConfirm(false)} className="w-full py-4 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all">Maintain Signal</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 rounded-[3rem] p-1 border-t-8 border-red-600 shadow-2xl">
              <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-8">
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">Active Mission Identification</p>
                      <div className="inline-flex items-center gap-6 bg-white/5 border border-white/10 px-8 py-4 rounded-[2rem] shadow-2xl">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 -m-2" />
                          <div className="w-4 h-4 bg-red-600 rounded-full" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
                          {currentCase.id}
                        </h2>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-black text-red-600 uppercase italic tracking-tighter leading-none">{currentCase.emergencyType}</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-3">Priority SOS Protocol • Grid Intercept Locked</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <button onClick={() => setShowAbortConfirm(true)} className="w-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)]">Abort Rescue</button>
                    <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Status</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{currentCase.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="aspect-square bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 shadow-inner">
                    <TacticalMap lat={currentCase.location.lat} lng={currentCase.location.lng} isDispatched={currentCase.status === 'dispatched'} />
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/40"><Stethoscope className="w-6 h-6 text-white" /></div>
                        <div>
                          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest italic">AI Triage Advice</h4>
                        </div>
                      </div>
                      {isAiLoading ? (
                        <div className="flex items-center gap-3 animate-pulse"><Loader2 className="w-4 h-4 text-emerald-500 animate-spin" /><span className="text-[10px] font-black text-slate-400 uppercase">Fetching First-Aid...</span></div>
                      ) : (
                        <div className="space-y-4">
                          {aiAdvice.split('\n').map((line, i) => line && (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                              <p className="text-xs font-bold text-slate-300 leading-relaxed italic">{line.replace(/^\d\.\s*|^\*\s*/, '')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-full relative overflow-hidden group">
                       <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform">
                          <Siren className="w-40 h-40" />
                       </div>
                       <div className="flex justify-between items-start relative z-10">
                         <div>
                           <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-3 h-3 text-red-200" />
                              <span className="text-[10px] font-black text-red-200 uppercase tracking-[0.3em] italic">Ambulance ETA</span>
                           </div>
                           <span className={`text-6xl font-black italic tracking-tighter leading-none ${currentCase.status === 'dispatched' ? 'animate-pulse' : ''}`}>
                             {currentCase.status === 'dispatched' ? formatTime(etaCountdown) : 'UPLINKING'}
                           </span>
                           {currentCase.status === 'dispatched' && (
                             <p className="text-[10px] font-black text-red-100 uppercase mt-4 tracking-widest opacity-80">Unit is clearing grid routes</p>
                           )}
                         </div>
                         <Activity className="w-10 h-10 text-white/30 animate-pulse" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">GRID <span className="text-red-600">SOS</span></h1>
              <p className="text-slate-400 font-black text-xs uppercase tracking-[0.6em]">Initialize Life-Link Protocol</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><Settings className="w-6 h-6" /></div>
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter dark:text-white">Mission Parameters</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Target Facility Type</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'GOVERNMENT' as HospitalPreference, label: 'Gov Hospital', icon: <Building2 className="w-6 h-6" />, desc: 'Public Medical Center' },
                  { id: 'PRIVATE' as HospitalPreference, label: 'Private Clinic', icon: <Building className="w-6 h-6" />, desc: 'High-Care Specialist' },
                  { id: 'BOTH' as HospitalPreference, label: 'I Prefer Both', icon: <PlusSquare className="w-6 h-6" />, desc: 'Fastest Intercept' }
                ].map((pref) => (
                  <button
                    key={pref.id}
                    disabled={isSubmitting}
                    onClick={() => setHospitalPreference(pref.id)}
                    className={`p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all border-4 relative overflow-hidden ${
                      hospitalPreference === pref.id 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${hospitalPreference === pref.id ? 'bg-white/20' : 'bg-white dark:bg-slate-700 shadow-sm'}`}>
                      {pref.icon}
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-black uppercase italic tracking-tighter">{pref.label}</span>
                    </div>
                    {hospitalPreference === pref.id && (
                      <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
              {[
                { type: EmergencyType.HEART, icon: <HeartPulse className="w-10 h-10" />, label: 'Cardiac Distress', color: 'bg-red-600' },
                { type: EmergencyType.ACCIDENT, icon: <AlertOctagon className="w-10 h-10" />, label: 'MVA / Vascular Trauma', color: 'bg-blue-600' },
                { type: EmergencyType.PREGNANCY, icon: <Baby className="w-10 h-10" />, label: 'Obstetric Crisis', color: 'bg-pink-600' },
                { type: EmergencyType.INJURY, icon: <Stethoscope className="w-10 h-10" />, label: 'Critical Injury', color: 'bg-emerald-600' },
                { type: EmergencyType.EMERGENCY, icon: <ShieldAlert className="w-10 h-10" />, label: 'Acute SOS Protocol', color: 'bg-orange-600' },
                { type: EmergencyType.OTHERS, icon: <MoreHorizontal className="w-10 h-10" />, label: 'Atypical Distress', color: 'bg-slate-700' }
              ].map((opt) => (
                <button 
                  key={opt.type} 
                  disabled={isSubmitting}
                  onClick={() => handleEmergency(opt.type)} 
                  className={`${opt.color} group relative rounded-[3rem] p-12 text-white flex flex-col items-center gap-6 transition-all hover:-translate-y-4 hover:shadow-2xl overflow-hidden shadow-xl disabled:opacity-50`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-8 bg-white/20 rounded-[2.5rem] border border-white/20">
                    {isSubmitting ? <Loader2 className="w-10 h-10 animate-spin" /> : opt.icon}
                  </div>
                  <span className="text-lg font-black uppercase italic tracking-tighter text-center leading-tight">
                    {isSubmitting ? 'Transmitting...' : opt.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <EmergencyBot userName={userName} />
    </div>
  );
};

export default PatientPortal;
