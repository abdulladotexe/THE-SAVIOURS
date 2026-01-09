
import React, { useState, memo, useEffect, useMemo } from 'react';
import { PatientCase, Location } from '../types';
import { 
  Siren, Radio, Zap, TrafficCone, ShieldCheck, 
  ArrowLeft, Activity, Map as MapIcon, 
  Navigation, Route, X, Loader2,
  BrainCircuit, Network, ShieldAlert, Navigation2, Phone, MapPin, Globe,
  CheckCircle, RadioTower, ClipboardCheck
} from 'lucide-react';
import { GeminiService } from '../services/gemini';
import { playConfirmationSound } from '../utils/audio';

interface PolicePortalProps {
  userName: string;
  activeCases: PatientCase[];
  location: Location | null;
  onAssignOfficer: (id: string, officerName: string) => void;
  onBack: () => void;
  onHome: () => void;
}

const TacticalCommandMap = memo(({ lat, lng }: { lat: number, lng: number }) => {
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&t=m&output=embed`;
  return (
    <div className="w-full h-full relative group">
      <iframe title="Police Tactical" width="100%" height="100%" frameBorder="0" src={mapUrl} className="grayscale-[0.1] contrast-[1.05] invert-[0.03] rounded-[2.5rem]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/40 to-transparent" />
      <div className="absolute top-6 left-6 bg-blue-600 px-5 py-2.5 rounded-2xl z-20 flex items-center gap-3 shadow-2xl border border-white/20">
        <Navigation2 className="w-5 h-5 text-white animate-pulse" />
        <span className="text-[11px] font-black text-white uppercase tracking-widest italic">Signal Intercept Locked</span>
      </div>
    </div>
  );
});

const StrategyCard: React.FC<{ title: string, content: string, icon: React.ReactNode, variant: 'red' | 'blue', thinking?: boolean }> = ({ title, content, icon, variant, thinking }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={`rounded-[3rem] border-2 transition-all ${expanded ? 'bg-white dark:bg-slate-900 shadow-2xl' : 'bg-slate-50 dark:bg-slate-800/50 shadow-sm'} ${variant === 'red' ? 'border-red-500/20' : 'border-blue-500/20'}`}>
       <button onClick={() => setExpanded(!expanded)} className="w-full p-8 flex items-center justify-between text-left">
          <div className="flex items-center gap-5">
             <div className={`p-4 rounded-3xl ${variant === 'red' ? 'bg-red-600' : 'bg-blue-600'} text-white shadow-xl`}>
                {icon}
             </div>
             <div>
                <h5 className={`text-[12px] font-black uppercase tracking-[0.2em] ${variant === 'red' ? 'text-red-600' : 'text-blue-600'}`}>{title}</h5>
                {thinking && <p className="text-[9px] font-black text-purple-600 uppercase mt-1 animate-pulse flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Thinking Hub Active</p>}
             </div>
          </div>
       </button>
       {expanded && (
         <div className="px-10 pb-10 pt-2 animate-in slide-in-from-top-4 duration-500">
            <div className={`w-full h-1 mb-8 rounded-full ${variant === 'red' ? 'bg-red-500/10' : 'bg-blue-500/10'}`} />
            <div className="space-y-5">
              {content.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="flex gap-5 group">
                   <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${variant === 'red' ? 'bg-red-50' : 'bg-blue-500'} group-hover:scale-150 transition-transform`} />
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">{line.replace(/^(\*|-|\d\.)\s*/, '')}</p>
                </div>
              ))}
            </div>
         </div>
       )}
    </div>
  );
};

const PolicePortal: React.FC<PolicePortalProps> = ({ userName, activeCases, location, onAssignOfficer, onBack, onHome }) => {
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategy, setStrategy] = useState('');
  const [traffic, setStrategyTraffic] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [showAcceptedSplash, setShowAcceptedSplash] = useState(false);

  // Filter: Police only see cases where an ambulance has been dispatched
  const availableDispatches = useMemo(() => 
    activeCases.filter(c => c.status === 'dispatched'), 
    [activeCases]
  );

  const myMissions = useMemo(() => 
    activeCases.filter(c => c.status === 'accepted' && c.officerName === userName),
    [activeCases, userName]
  );

  const analyzeTactical = async (item: PatientCase) => {
    setSelectedCase(item);
    setIsAnalyzing(true);
    try {
      const [strat, traf] = await Promise.all([
        GeminiService.getComplexStrategy(`MISSION: ${item.emergencyType} for ${item.patientName}. Location: ${item.location.lat}, ${item.location.lng}. Destination: ${item.hospitalName || "Regional Hospital"}. Provide a high-reasoning police tactical clearance protocol.`),
        GeminiService.getTrafficAnalysis(item.location, item.hospitalName || "trauma center")
      ]);
      setStrategy(strat);
      setStrategyTraffic(traf.text);
    } catch (e) {
      setStrategy("Manual intercept required. Neural link intermittent.");
      setStrategyTraffic("Regional traffic sensors offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommand = (item: PatientCase) => {
    playConfirmationSound();
    setIsAccepting(true);
    // Visual animation sequence
    setTimeout(() => {
      onAssignOfficer(item.id, userName);
      setIsAccepting(false);
      setShowAcceptedSplash(true);
      setTimeout(() => setShowAcceptedSplash(false), 3000);
      analyzeTactical(item);
    }, 1500);
  };

  const NavHeader = () => (
    <div className="flex items-center justify-between mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <button 
        onClick={selectedCase ? () => setSelectedCase(null) : onBack}
        className="group flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white px-8 py-4 rounded-full font-black text-[12px] uppercase tracking-[0.3em] shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105"
      >
        <ArrowLeft className="w-5 h-5" /> BACK
      </button>
      <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-600/20 px-6 py-3 rounded-full">
         <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Unit {userName} - Universal Grid Linked</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <NavHeader />

      {showAcceptedSplash && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-blue-600/90 backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
           <div className="text-center space-y-8 p-12 bg-white dark:bg-slate-950 rounded-[5rem] shadow-[0_0_150px_rgba(37,99,235,0.8)] border-4 border-white/20">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 -m-12" />
                <div className="bg-blue-600 p-12 rounded-full shadow-2xl relative z-10">
                   <ShieldCheck className="w-24 h-24 text-white" />
                </div>
              </div>
              <div className="space-y-4">
                 <h2 className="text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">MISSION ASSUMED</h2>
                 <p className="text-blue-600 font-black text-xl uppercase tracking-[0.5em] animate-pulse italic">CLEARING AMBULANCE ROUTE NOW</p>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          {/* AVAILABLE DISPATCHES */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <Siren className="w-6 h-6 text-blue-600 animate-pulse" />
                <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">Live Dispatches</h3>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black">{availableDispatches.length}</span>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-3 custom-scrollbar">
              {availableDispatches.length === 0 ? (
                <div className="py-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center flex flex-col items-center justify-center gap-4 opacity-40">
                  <RadioTower className="w-12 h-12 text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic leading-tight">Waiting for Hospital<br/>Dispatch Signals...</p>
                </div>
              ) : availableDispatches.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => analyzeTactical(item)} 
                  className={`w-full text-left bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 transition-all relative overflow-hidden flex flex-col gap-4 group ${selectedCase?.id === item.id ? 'border-blue-600 shadow-2xl scale-[0.98]' : 'border-transparent shadow-md hover:border-blue-600/30'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase italic tracking-widest">DISPATCHED</span>
                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">{item.id}</span>
                  </div>
                  <div>
                     <h4 className="text-2xl font-black uppercase text-slate-900 dark:text-white italic">{item.patientName}</h4>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.emergencyType}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* MY MISSION TRACKER */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">Active Grid</h3>
              </div>
              <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black">{myMissions.length}</span>
            </div>

            <div className="space-y-4">
              {myMissions.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => analyzeTactical(item)} 
                  className={`w-full text-left bg-slate-900 p-8 rounded-[3rem] border-l-[12px] border-emerald-500 shadow-2xl transition-all relative overflow-hidden flex flex-col gap-3 group ${selectedCase?.id === item.id ? 'ring-4 ring-emerald-500/30 scale-[0.98]' : 'hover:bg-slate-800'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-emerald-500 uppercase italic tracking-[0.3em]">MISSION_ACTIVE</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="text-2xl font-black uppercase text-white italic">{item.patientName}</h4>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tabular-nums">ID: {item.id}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COMMAND Hub */}
        <div className="lg:col-span-8">
          {selectedCase ? (
            <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-3xl overflow-hidden border dark:border-slate-800 flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
              <div className="bg-blue-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150"><Network className="w-48 h-48" /></div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black uppercase italic tracking-tighter flex items-center gap-5 leading-none">Command Briefing</h3>
                  <p className="text-blue-100 text-[12px] font-black uppercase mt-3 tracking-[0.4em] italic opacity-80">Grid Signal ID: {selectedCase.id}</p>
                </div>
              </div>
              
              <div className="flex-1 p-12 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-5">
                      <div className="p-4 bg-blue-600 rounded-2xl text-white"><MapPin className="w-6 h-6" /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Coordinates</p>
                         <p className="text-lg font-black dark:text-white tabular-nums">{selectedCase.location.lat.toFixed(5)}, {selectedCase.location.lng.toFixed(5)}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="p-4 bg-emerald-600 rounded-2xl text-white"><Phone className="w-6 h-6" /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal Contact</p>
                         <p className="text-lg font-black dark:text-white tabular-nums">{selectedCase.phoneNumber}</p>
                      </div>
                   </div>
                </div>

                <div className="aspect-video bg-slate-950 rounded-[4rem] relative overflow-hidden shadow-3xl border-8 border-slate-900/50 group">
                   <TacticalCommandMap lat={selectedCase.location.lat} lng={selectedCase.location.lng} />
                   {(isAnalyzing || isAccepting) && (
                     <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center gap-10 z-50">
                        <div className="p-12 bg-blue-600 rounded-full shadow-[0_0_100px_rgba(37,99,235,0.6)] animate-pulse">
                           {isAccepting ? <RadioTower className="w-24 h-24 text-white animate-bounce" /> : <BrainCircuit className="w-24 h-24 text-white" />}
                        </div>
                        <div className="text-center">
                           <h4 className="text-white font-black text-2xl uppercase italic tracking-widest mb-4">
                              {isAccepting ? "ESTABLISHING UNIT LINK..." : "Neural Analysis Active"}
                           </h4>
                           <p className="text-blue-400 font-bold uppercase text-[11px] tracking-[0.8em] animate-pulse">
                              {isAccepting ? "Synchronizing Tactical Clearance Vectors" : "Calculating High-Reasoning Clearance Protocol..."}
                           </p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {!isAnalyzing && !isAccepting && (
                     <>
                        <StrategyCard 
                          title="Traffic Clearance Protocol"
                          variant="red"
                          icon={<TrafficCone className="w-7 h-7" />}
                          content={traffic || "Syncing regional sensors..."}
                        />
                        <StrategyCard 
                          title="Tactical Route Analysis"
                          variant="blue"
                          thinking={true}
                          icon={<Route className="w-7 h-7" />}
                          content={strategy || "Processing grid vectors..."}
                        />
                     </>
                   )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pb-6">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps?q=${selectedCase.location.lat},${selectedCase.location.lng}`, '_blank')}
                    className="flex-1 py-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-5 transition-all shadow-xl"
                  >
                    <Navigation className="w-8 h-8 text-blue-600" /> GPS Link
                  </button>
                  {selectedCase.officerName !== userName && selectedCase.status === 'dispatched' && (
                    <button 
                      onClick={() => handleCommand(selectedCase)}
                      disabled={isAccepting}
                      className="flex-1 py-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-5 transition-all shadow-2xl active:scale-95 group"
                    >
                      {isAccepting ? <Loader2 className="w-8 h-8 animate-spin" /> : <ShieldCheck className="w-8 h-8 group-hover:scale-110 transition-transform" />}
                      {isAccepting ? "UPLINKING..." : "Assume Command"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[700px] bg-white dark:bg-slate-900 rounded-[5rem] border-8 border-dashed border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center text-center p-20 group transition-all duration-700">
              <div className="bg-slate-50 dark:bg-slate-800 p-20 rounded-full mb-12 shadow-inner group-hover:scale-110 transition-transform duration-700">
                 <Siren className="w-48 h-48 text-slate-100 dark:text-slate-800 group-hover:text-blue-600/20 transition-colors" />
              </div>
              <h3 className="text-5xl font-black text-slate-200 dark:text-slate-800 uppercase italic tracking-tighter leading-none mb-6">Tactical Node Idle</h3>
              <p className="text-[12px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-[0.8em] animate-pulse italic">Scanning Cloud Grid for Mission Pulses...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicePortal;
