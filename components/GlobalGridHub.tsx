
import React, { useState, useEffect, useMemo } from 'react';
import { PatientCase, Location } from '../types';
import { GeminiService } from '../services/gemini';
import { 
  ShieldAlert, Activity, Map as MapIcon, Siren, 
  Terminal, Globe, Zap, Clock, Users, Database,
  Search, Filter, BrainCircuit, RefreshCw, Loader2,
  Ambulance, ShieldCheck, ChevronRight, LayoutDashboard,
  Server, Network, Radio
} from 'lucide-react';

interface GlobalGridHubProps {
  userName: string;
  activeCases: PatientCase[];
  onRefresh: () => void;
}

const GlobalGridHub: React.FC<GlobalGridHubProps> = ({ userName, activeCases, onRefresh }) => {
  const [strategicBriefing, setStrategicBriefing] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'dispatched'>('all');

  const stats = useMemo(() => {
    return {
      total: activeCases.length,
      active: activeCases.filter(c => c.status !== 'completed' && c.status !== 'canceled').length,
      dispatched: activeCases.filter(c => c.status === 'dispatched').length,
      pending: activeCases.filter(c => c.status === 'pending').length
    };
  }, [activeCases]);

  const filteredCases = useMemo(() => {
    if (filter === 'all') return activeCases;
    return activeCases.filter(c => c.status === filter);
  }, [activeCases, filter]);

  useEffect(() => {
    const fetchBriefing = async () => {
      if (activeCases.length === 0) {
        setStrategicBriefing("Universal Grid Signal Idle. No active mission detected.");
        return;
      }
      setIsAiLoading(true);
      try {
        const activeDescription = activeCases
          .filter(c => c.status !== 'completed' && c.status !== 'canceled')
          .map(c => `${c.emergencyType} for ${c.patientName} (Status: ${c.status})`)
          .join(', ');
        
        // Deep Thinking used for complex strategy
        const briefing = await GeminiService.getComplexStrategy(`UNIVERSAL NETWORK OVERVIEW: ${activeDescription}. Provide a detailed 3-sentence high-level tactical summary of the current global load and identify the single highest priority mission. Explain why it is priority using medical triage logic.`);
        setStrategicBriefing(briefing);
      } catch (e) {
        setStrategicBriefing("Neural Uplink Error. Manual reconnaissance required.");
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchBriefing();
  }, [activeCases.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* HEADER TACTICAL HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'GLOBAL NODES', val: stats.total, icon: <Network className="w-5 h-5" />, color: 'bg-blue-600' },
          { label: 'ACTIVE SOS', val: stats.active, icon: <ShieldAlert className="w-5 h-5" />, color: 'bg-red-600' },
          { label: 'IN-FLIGHT', val: stats.dispatched, icon: <Ambulance className="w-5 h-5" />, color: 'bg-emerald-600' },
          { label: 'PENDING', val: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'bg-orange-600' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              <h4 className="text-3xl font-black text-white mt-1 italic">{s.val}</h4>
            </div>
            <div className={`${s.color} p-3 rounded-2xl text-white shadow-lg`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AI STRATEGIC OVERLAY */}
        <div className="lg:col-span-12">
          <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-purple-500/20 rounded-[3rem] p-8 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform">
               <BrainCircuit className="w-40 h-40" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-purple-600 rounded-2xl shadow-xl shadow-purple-900/40">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic">Strategic Overseer</h3>
                <p className="text-[8px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3 fill-purple-400" /> Thinking Protocol Active (32,768 Budget)
                </p>
              </div>
            </div>
            {isAiLoading ? (
               <div className="flex items-center gap-3 animate-pulse">
                 <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                 <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Synthesizing Global Signal Matrix...</span>
               </div>
            ) : (
              <div className="border-l-4 border-purple-600 pl-6 py-2">
                <p className="text-lg font-bold text-slate-200 leading-relaxed italic">
                  "{strategicBriefing}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MISSION LOG */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <Terminal className="w-6 h-6" />
              <h3 className="text-2xl font-black uppercase italic">Global Mission Feed</h3>
            </div>
            <div className="flex gap-2">
               {['all', 'pending', 'dispatched'].map(f => (
                 <button 
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCases.length === 0 ? (
               <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100 dark:border-slate-800">
                  <Database className="w-16 h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">No Missions in Cache</p>
               </div>
            ) : filteredCases.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500 transition-all">
                <div className="flex items-center gap-6 flex-1">
                  <div className={`p-5 rounded-2xl ${
                    item.status === 'pending' ? 'bg-red-600' : 
                    item.status === 'dispatched' ? 'bg-emerald-600' : 'bg-slate-600'
                  } text-white shadow-lg`}>
                    {item.status === 'dispatched' ? <Ambulance className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                       <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">{item.patientName}</h4>
                       <span className="text-[9px] font-black text-slate-400 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded-md uppercase tracking-widest">ID: {item.id}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{item.emergencyType}</p>
                    <div className="flex items-center gap-4 mt-3">
                       <div className="flex items-center gap-1 text-slate-400">
                         <Clock className="w-3 h-3" />
                         <span className="text-[9px] font-black">{new Date(item.timestamp).toLocaleTimeString()}</span>
                       </div>
                       {item.officerName && (
                         <div className="flex items-center gap-1 text-blue-500">
                           <ShieldCheck className="w-3 h-3" />
                           <span className="text-[9px] font-black">POLICE: {item.officerName}</span>
                         </div>
                       )}
                       {item.hospitalName && (
                         <div className="flex items-center gap-1 text-emerald-500">
                           <Activity className="w-3 h-3" />
                           <span className="text-[9px] font-black">HQ: {item.hospitalName}</span>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${
                     item.status === 'pending' ? 'bg-red-600/10 text-red-600 border border-red-600/20' : 
                     item.status === 'dispatched' ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20' : 'bg-slate-100 text-slate-500'
                   }`}>
                     {item.status}
                   </span>
                   <button 
                    onClick={() => window.open(`https://maps.google.com/maps?q=${item.location.lat},${item.location.lng}`, '_blank')}
                    className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                   >
                     Live GPS Link <ChevronRight className="w-3 h-3" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white px-4">
            <Server className="w-6 h-6 text-emerald-500" />
            <h3 className="text-2xl font-black uppercase italic">Universal Hub</h3>
          </div>
          <div className="bg-slate-950 rounded-[3rem] p-8 space-y-8 shadow-inner border border-white/5">
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sync Health</span>
                  <span className="text-xs font-black text-emerald-500">OPTIMAL</span>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%] shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Telemetry</h5>
              <div className="space-y-3">
                 {[
                   { k: 'NETWORK', v: 'SAVIOUR-GLOBAL' },
                   { k: 'ENCRYPTION', v: 'AES-256-GRID' },
                   { k: 'REDUNDANCY', v: 'ACTIVE' },
                   { k: 'AI NODES', v: 'GEMINI-PRO-3' }
                 ].map((d, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-slate-600 uppercase">{d.k}</span>
                     <span className="text-slate-300 font-black tracking-widest">{d.v}</span>
                   </div>
                 ))}
              </div>
            </div>

            <button 
              onClick={onRefresh}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Resync Universal State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalGridHub;
