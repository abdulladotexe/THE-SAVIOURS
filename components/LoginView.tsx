
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import Logo from './Logo';
import { 
  User, ShieldCheck, Hospital as HospitalIcon, 
  ChevronRight, ArrowLeft, Radio, Phone, Globe, 
  Zap, Activity, ShieldAlert, Wifi, Cpu, Lock,
  Home as HomeIcon, AlertTriangle, X, Terminal, Target,
  Building2, Building, Siren, Cloud, Key, ExternalLink, BadgeCheck, Upload
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: UserRole, name: string, extra?: string, secondaryExtra?: string, hospitalType?: string, license?: string) => void;
  isGcpLinked: boolean;
  onLinkGcp: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, isGcpLinked, onLinkGcp }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.NONE);
  const [name, setName] = useState('');
  const [extra, setExtra] = useState(''); 
  const [secondaryExtra, setSecondaryExtra] = useState(''); 
  const [hospitalType, setHospitalType] = useState<string>(''); 
  const [license, setLicense] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [step, setStep] = useState(1);
  const [tickerText, setTickerText] = useState("UPLINK STANDBY...");
  const [error, setError] = useState<string | null>(null);
  const [readiness, setReadiness] = useState(0);

  useEffect(() => {
    const messages = [
      "GPS CONSTELLATION LOCKED",
      "BROADCAST MODULES READY",
      "TRAFFIC NETWORK SYNCED",
      "EMERGENCY PROTOCOLS LOADED",
      "SATELLITE LINK ESTABLISHED",
      "GOOGLE CLOUD SYNCED"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTickerText(messages[i % messages.length]);
      i++;
    }, 3000);

    const readyInterval = setInterval(() => {
      setReadiness(prev => (prev >= 100 ? 100 : prev + Math.floor(Math.random() * 12) + 1));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(readyInterval);
    };
  }, []);

  const validateInputs = () => {
    if (!name.trim()) return "IDENTIFICATION REQUIRED";
    
    if (selectedRole === UserRole.PATIENT) {
      if (!extra.trim()) return "CONTACT PHONE REQUIRED";
      if (extra.length !== 10) return "VALID 10-DIGIT PHONE REQUIRED";
    }

    if (selectedRole === UserRole.POLICE) {
      if (!license.trim()) return "BADGE NUMBER REQUIRED";
    }

    if (selectedRole === UserRole.HOSPITAL) {
      if (!hospitalType) return "CLASSIFICATION REQUIRED";
      if (!license.trim()) return "LICENSE ID REQUIRED";
      if (!extra.trim()) return "DRIVER NAME REQUIRED";
      if (!secondaryExtra.trim()) return "DRIVER CONTACT REQUIRED";
      if (secondaryExtra.length !== 10) return "VALID 10-DIGIT DRIVER PHONE REQUIRED";
    }

    if (!termsAccepted) return "MUST AGREE TO TERMS & CONDITIONS";
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      return;
    }
    onLogin(selectedRole, name.trim(), extra.trim(), secondaryExtra.trim(), hospitalType, license.trim());
  };

  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    const numericValue = val.replace(/\D/g, '').substring(0, 10);
    setter(numericValue);
    setError(null);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        localStorage.setItem('the_saviour_custom_logo', result);
        window.dispatchEvent(new Event('logo-updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" 
          style={{ backgroundImage: 'linear-gradient(#f00 1px, transparent 1px), linear-gradient(90deg, #f00 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
        />
        <div className="absolute top-[15%] left-[10%] animate-pulse flex items-center gap-2 opacity-30">
          <Target className="w-5 h-5 text-red-600" />
          <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">SATELLITE_UPLINK_09: ACTIVE</span>
        </div>
        <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600/30 animate-[scanner_6s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes scanner { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes emergency-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .emergency-header { animation: emergency-pulse 2s infinite; }
      `}</style>

      <div className="w-full max-w-6xl relative z-10">
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col items-center">
            {/* SYSTEM STATUS BAR */}
            <div className="w-full max-w-xs mb-12 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">System Link Status</span>
                <span className="text-[14px] font-black text-slate-900 dark:text-white tabular-nums">{readiness}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-[2px] border border-slate-300 dark:border-slate-700">
                <div className="h-full bg-red-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${readiness}%` }} />
              </div>
            </div>

            <div className="text-center mb-16 relative flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl">
                 <Siren className="w-4 h-4 animate-pulse" /> Emergency Hub
              </div>
              <h1 className="text-8xl md:text-[11rem] font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none select-none">
                THE <span className="text-red-600 emergency-header">SAVIOUR</span>
              </h1>
              <div className="mt-4 space-y-2">
                <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-black max-w-2xl mx-auto leading-tight uppercase tracking-tight italic">
                  Critical Mission Coordination Grid
                </p>
                <div className="flex items-center justify-center gap-3 font-black text-[11px] text-red-600 uppercase tracking-[0.5em] animate-pulse">
                  <Activity className="w-4 h-4" /> {tickerText}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl">
              {[
                { 
                  role: UserRole.PATIENT, 
                  icon: <User className="w-12 h-12" />, 
                  label: "Citizens", 
                  desc: "Broadcast SOS",
                  accent: "from-red-600 to-red-800",
                  iconBg: "bg-red-50 dark:bg-red-950 text-red-600"
                },
                { 
                  role: UserRole.POLICE, 
                  icon: <ShieldCheck className="w-12 h-12" />, 
                  label: "Traffic Police", 
                  desc: "Clear Grid Routes",
                  accent: "from-blue-600 to-blue-800",
                  iconBg: "bg-blue-50 dark:bg-blue-950 text-blue-600"
                },
                { 
                  role: UserRole.HOSPITAL, 
                  icon: <HospitalIcon className="w-12 h-12" />, 
                  label: "Medical Portal", 
                  desc: "Dispatch Units",
                  accent: "from-emerald-600 to-emerald-800",
                  iconBg: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                }
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => { setSelectedRole(item.role); setStep(2); setName(''); setExtra(''); setSecondaryExtra(''); setHospitalType(''); setLicense(''); setTermsAccepted(false); setError(null); }}
                  className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-500 hover:-translate-y-3 active:scale-95 flex flex-col items-center text-center gap-8 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className={`relative z-10 p-6 rounded-3xl ${item.iconBg} group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                    {item.icon}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white group-hover:text-white transition-colors">{item.label}</h3>
                    <p className="text-[12px] text-slate-400 dark:text-slate-300 group-hover:text-white/80 font-black uppercase tracking-widest transition-colors">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500">
            <button onClick={() => setStep(1)} className="mb-10 group flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
              <ArrowLeft className="w-4 h-4" /> BACK
            </button>

            <div className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-12 rounded-[4rem] shadow-3xl border-2 border-slate-100 dark:border-slate-800 relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 right-0 h-4 ${
                selectedRole === UserRole.PATIENT ? 'bg-red-600' : 
                selectedRole === UserRole.POLICE ? 'bg-blue-600' : 'bg-emerald-600'
              }`} />

              <div className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Protocol Initialization</span>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mt-2">AUTHENTICATE OPERATIVE</h2>
                {error && <p className="text-red-600 text-[11px] font-black uppercase tracking-widest mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">!! {error} !!</p>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity / Facility Name</label>
                  <input
                    type="text" required autoFocus value={name} 
                    onChange={(e) => { setName(e.target.value); setError(null); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white px-8 py-6 rounded-[2rem] border-2 border-transparent focus:border-red-600 outline-none transition-all font-black text-xl italic"
                    placeholder="ENTER IDENT..."
                  />
                </div>

                {(selectedRole === UserRole.POLICE || selectedRole === UserRole.HOSPITAL) && (
                  <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      {selectedRole === UserRole.POLICE ? 'Badge / License Number' : 'Facility License ID'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={license}
                        onChange={(e) => { setLicense(e.target.value); setError(null); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white px-8 py-6 rounded-[2rem] border-2 border-transparent focus:border-red-600 outline-none transition-all font-black text-xl italic pl-14"
                        placeholder={selectedRole === UserRole.POLICE ? "BADGE NO..." : "LICENSE ID..."}
                      />
                      <BadgeCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                )}

                {selectedRole === UserRole.HOSPITAL && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['GOVERNMENT', 'PRIVATE'].map((type) => (
                        <button
                          key={type} type="button" onClick={() => { setHospitalType(type); setError(null); }}
                          className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-4 font-black text-[10px] uppercase transition-all ${
                            hospitalType === type ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg scale-[1.05]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'
                          }`}
                        >
                          {type === 'GOVERNMENT' ? <Building2 className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedRole === UserRole.PATIENT || selectedRole === UserRole.HOSPITAL) && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      {selectedRole === UserRole.HOSPITAL ? 'Ambulance Driver Name' : 'Contact Mobile (10-Digits)'}
                    </label>
                    <input
                      type={selectedRole === UserRole.PATIENT ? "tel" : "text"} 
                      required 
                      value={extra}
                      maxLength={selectedRole === UserRole.PATIENT ? 10 : 100}
                      onChange={(e) => {
                        if (selectedRole === UserRole.PATIENT) {
                          handlePhoneChange(e.target.value, setExtra);
                        } else {
                          setExtra(e.target.value);
                          setError(null);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white px-8 py-6 rounded-[2rem] border-2 border-transparent focus:border-red-600 outline-none transition-all font-black text-xl italic"
                      placeholder={selectedRole === UserRole.HOSPITAL ? "DRIVER NAME..." : "10-DIGIT MOBILE..."}
                    />
                  </div>
                )}

                {selectedRole === UserRole.HOSPITAL && (
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Driver Contact (10-Digits)</label>
                      <input
                        type="tel" required value={secondaryExtra} maxLength={10}
                        onChange={(e) => handlePhoneChange(e.target.value, setSecondaryExtra)}
                        className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white px-8 py-6 rounded-[2rem] border-2 border-transparent focus:border-red-600 outline-none transition-all font-black text-xl italic"
                        placeholder="MOBILE..."
                      />
                    </div>
                )}

                <div className="flex items-start gap-4 py-2 px-2">
                  <input 
                    type="checkbox" 
                    id="terms-check" 
                    checked={termsAccepted}
                    onChange={(e) => { setTermsAccepted(e.target.checked); setError(null); }}
                    className={`mt-1 w-5 h-5 appearance-none border-2 rounded-lg cursor-pointer transition-all ${
                       termsAccepted 
                       ? 'bg-red-600 border-red-600' 
                       : 'bg-transparent border-slate-300 dark:border-slate-600 hover:border-red-600'
                    } relative flex items-center justify-center after:content-['✓'] after:text-white after:font-bold after:text-xs after:absolute after:inset-0 after:flex after:items-center after:justify-center after:opacity-0 checked:after:opacity-100`}
                  />
                  <label htmlFor="terms-check" className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none">
                    By proceeding, you agree to our Terms and Conditions.
                  </label>
                </div>

                <button
                  type="submit"
                  className={`w-full py-7 rounded-[3rem] text-white font-black text-2xl shadow-3xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-5 italic uppercase tracking-tighter ${
                    selectedRole === UserRole.PATIENT ? 'bg-red-600 shadow-red-900/40' : 
                    selectedRole === UserRole.POLICE ? 'bg-blue-600 shadow-blue-900/40' : 'bg-emerald-600 shadow-emerald-900/40'
                  }`}
                >
                  ACTIVATE MISSION SIGNAL
                  <ChevronRight className="w-8 h-8" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;
    