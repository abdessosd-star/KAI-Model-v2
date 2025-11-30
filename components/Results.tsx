
import React, { useEffect, useState, useRef } from 'react';
import { ARCHETYPES, QUESTIONS } from '../constants';
import { generateRoadmap } from '../services/geminiService';
import { submitToSheet } from '../services/sheetService';
import { storageService } from '../services/storageService';
import { Button } from './Button';
import { ChatAssistant } from './ChatAssistant';
import { Lock, Download, RefreshCw, Sparkles, Check, User, Briefcase, BarChart3, ShieldAlert, Activity, Lightbulb, BrainCircuit, LogOut } from 'lucide-react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell,
  ReferenceLine, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { UserProfile, QuestionType, EmbedSettings } from '../types';

interface ResultsProps {
  answers: Record<string, number | string>;
  currentUser: UserProfile | null;
  onSignup: (name: string, email: string) => void;
  onLogout?: () => void;
  embedSettings?: EmbedSettings;
}

export const Results: React.FC<ResultsProps> = ({ answers, currentUser, onSignup, onLogout, embedSettings = {} as EmbedSettings }) => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoSubmitted = useRef(false);
  
  // Theme helpers
  const isDark = embedSettings.theme === 'dark';
  const primaryColor = embedSettings.primaryColor || '#2563eb'; // Default Blue
  
  // Pre-fill name and email if available from assessment
  const initialName = (answers['prof_name'] as string) || '';
  const initialEmail = (answers['prof_email'] as string) || '';
  const initialOrgCode = (answers['prof_org_code'] as string) || '';
  
  const [formData, setFormData] = useState({ name: initialName, email: initialEmail });

  // --- Scoring Logic ---
  
  const getCategorySum = (category: string) => {
    const relevantQuestions = QUESTIONS.filter(q => q.category === category && q.type !== 'TEXT' && q.type !== 'SELECT');
    let sum = 0;
    relevantQuestions.forEach(q => {
      const val = answers[q.id] as number || 0;
      sum += val;
    });
    return sum;
  };

  // 1. Cognitive Style (KAI Proxy)
  const styleQuestions = QUESTIONS.filter(q => q.category === 'style');
  const maxPossibleStyle = styleQuestions.length * 2; 
  const rawStyleScore = getCategorySum('style');
  const styleScore = maxPossibleStyle > 0 ? (rawStyleScore / maxPossibleStyle) * 10 : 0; // -10 to +10

  // Breakdown Style for Radar
  let adaptorPoints = 0;
  let innovatorPoints = 0;
  styleQuestions.forEach(q => {
    const val = answers[q.id] as number || 0;
    if (val < 0) adaptorPoints += Math.abs(val);
    if (val > 0) innovatorPoints += val;
  });
  const maxPointsPerSide = styleQuestions.length * 2; 
  const processScore = Math.min(100, Math.round((adaptorPoints / maxPointsPerSide) * 100 * 1.5)); 
  const innovationScore = Math.min(100, Math.round((innovatorPoints / maxPointsPerSide) * 100 * 1.5));

  // 2. Readiness Score (0-100)
  const readinessQuestions = QUESTIONS.filter(q => q.category === 'readiness' || q.category === 'sentiment');
  let totalReadinessPoints = 0;
  let maxReadinessPoints = 0;

  readinessQuestions.forEach(q => {
    const val = answers[q.id] as number || 0;
    if (q.id === 'sent_anxiety' || q.id === 'sent_pressure') {
      totalReadinessPoints += (6 - val) * 20; 
      maxReadinessPoints += 100;
    } else if (q.type === QuestionType.SCALE) {
      totalReadinessPoints += (val - 1) * 25; 
      maxReadinessPoints += 100;
    } else if (q.type === QuestionType.SELECT || q.type === QuestionType.SLIDER) {
      totalReadinessPoints += val;
      maxReadinessPoints += 100;
    }
  });

  const readinessScore = maxReadinessPoints > 0 ? (totalReadinessPoints / maxReadinessPoints) * 100 : 50;

  // 3. Exposure Score
  const exposureQuestions = QUESTIONS.filter(q => q.category === 'exposure');
  let totalExposurePoints = 0;
  let maxExposurePoints = 0;
  
  exposureQuestions.forEach(q => {
     const val = answers[q.id] as number || 0;
     if (q.id === 'exp_physical' || q.id === 'exp_human' || q.id === 'exp_decision') {
        totalExposurePoints += (6 - (val as number)) * 25;
     } else if (q.type === QuestionType.SLIDER) {
        totalExposurePoints += val;
     } else {
        totalExposurePoints += ((val as number) - 1) * 25;
     }
     maxExposurePoints += q.type === QuestionType.SLIDER ? 100 : 100;
  });
  const exposureScore = maxExposurePoints > 0 ? Math.round((totalExposurePoints / maxExposurePoints) * 100) : 50;

  // 4. Sentiment & Anxiety
  const sentimentScore = answers['sent_excitement'] 
    ? ((answers['sent_excitement'] as number) - 1) * 25 
    : 50;
    
  const anxietyRaw = answers['sent_anxiety'] as number || 3; // 1-5 scale

  // --- DETERMINE 10-PERSONA ARCHETYPE ---
  let archetypeKey = 'PRACTICAL_TRADITIONALIST'; // Default fallback
  if (anxietyRaw >= 4 && readinessScore < 50) {
    archetypeKey = 'RESISTANT_SKEPTIC';
  } else {
    if (styleScore > 3) {
      if (readinessScore >= 80) archetypeKey = 'VISIONARY_ARCHITECT';
      else if (readinessScore >= 50) archetypeKey = 'STRATEGIC_INTEGRATOR';
      else archetypeKey = 'CREATIVE_EXPERIMENTER';
    } else if (styleScore < -3) {
      if (readinessScore >= 80) archetypeKey = 'SYSTEM_GUARDIAN';
      else if (readinessScore >= 50) archetypeKey = 'PROCESS_OPTIMIZER';
      else archetypeKey = 'PRACTICAL_TRADITIONALIST';
    } else {
      if (readinessScore >= 75) archetypeKey = 'PRAGMATIC_BRIDGE';
      else if (readinessScore >= 40) archetypeKey = 'COLLABORATIVE_PIVOT';
      else archetypeKey = 'HESITANT_OBSERVER';
    }
  }
  
  const archetype = ARCHETYPES[archetypeKey];

  // Extract Context
  const roleName = answers['prof_role'] as string || 'Professional';
  const department = answers['prof_dept'] as string || 'Algemeen';
  const industry = answers['prof_industry'] as string || 'Onbekend';
  const experience = answers['prof_exp'] as string || 'Medior';
  const orgSize = answers['prof_org_size'] as string || 'MKB';
  const userName = answers['prof_name'] as string || 'U';

  const saveDataLocallyAndRemotely = async (name: string, email: string) => {
    // 1. Google Sheet (Marketing Lead)
    const sheetData = {
        name: name,
        email: email,
        role: roleName,
        archetype: archetype.name,
        readinessScore: Math.round(readinessScore),
        exposureScore: Math.round(exposureScore),
        styleScore: styleScore.toFixed(1)
    };
    await submitToSheet(sheetData);

    // 2. Storage Service (App Backend)
    // Save even if no code (can be updated later or treated as public)
    storageService.addEmployee({
        orgCode: initialOrgCode.toUpperCase() || 'PUBLIC',
        name: name,
        email: email,
        department: department,
        kaiScore: parseFloat(styleScore.toFixed(1)),
        readinessScore: Math.round(readinessScore),
        exposureScore: Math.round(exposureScore),
        archetype: archetype.name
    });
  };

  useEffect(() => {
    if (initialEmail && initialName && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        saveDataLocallyAndRemotely(initialName, initialEmail).then(() => {
             console.log("Data saved");
        });
        onSignup(initialName, initialEmail);
    }
  }, [initialEmail, initialName, onSignup]);

  useEffect(() => {
    if (currentUser && !roadmap && !embedSettings.hideRoadmap) {
      setLoadingRoadmap(true);
      const contextData = {
        role: roleName, department, industry, experience, orgSize,
        archetype: archetype.name, anxiety: anxietyRaw,
        readiness: Math.round(readinessScore),
        style: styleScore > 0 ? "Innovatief" : "Adaptief"
      };
      
      generateRoadmap(contextData).then(data => {
          setRoadmap(data);
          setLoadingRoadmap(false);
      });
    }
  }, [currentUser, archetype, roadmap, embedSettings.hideRoadmap]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.name && formData.email) {
        setIsSubmitting(true);
        await saveDataLocallyAndRemotely(formData.name, formData.email);
        onSignup(formData.name, formData.email);
        setShowSignupModal(false);
        setIsSubmitting(false);
    }
  };

  const scatterData = [{ x: styleScore, y: readinessScore, z: 1 }];
  const radarData = [
    { subject: 'Innovatiekracht', A: innovationScore, fullMark: 100 },
    { subject: 'Proces Discipline', A: processScore, fullMark: 100 },
    { subject: 'AI Skills', A: readinessScore, fullMark: 100 },
    { subject: 'Automatisering Risico', A: exposureScore, fullMark: 100 },
    { subject: 'Veranderbereidheid', A: sentimentScore, fullMark: 100 },
  ];

  const chatContext = {
    userName, role: roleName, department, industry, orgSize, archetype: archetype.name,
    archetypeDescription: archetype.description, readinessScore: Math.round(readinessScore),
    styleScore: styleScore.toFixed(1), exposureScore: exposureScore, roadmap: roadmap
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-24 px-4`}>
      {/* Header Section */}
      {!embedSettings.hideArchetype && (
        <div className={`rounded-2xl shadow-sm border p-6 md:p-10 relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full -mr-20 -mt-20 blur-3xl opacity-30" style={{ backgroundColor: primaryColor }} />
            
            {/* Logout Button for User Role */}
            {currentUser?.role === 'USER' && onLogout && (
               <div className="absolute top-4 right-4 z-20">
                   <Button variant="ghost" size="sm" onClick={onLogout} className={`gap-2 ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
                       <LogOut size={16} /> Uitloggen
                   </Button>
               </div>
            )}

            <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{industry}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{department}</span>
                </div>
                <h1 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}, u bent een <span style={{ color: archetype.color }}>{archetype.name}</span></h1>
                <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{archetype.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                    {archetype.strengths.slice(0,3).map((strength, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium border border-green-200"><Check size={12} /> {strength}</span>
                    ))}
                </div>
            </div>
            {/* Mini Stats Card */}
            <div className={`rounded-xl p-6 border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI Readiness Index</span>
                        <span className={`text-2xl font-bold ${readinessScore > 60 ? 'text-green-500' : 'text-amber-500'}`}>{Math.round(readinessScore)}/100</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div className="h-full transition-all duration-1000" style={{ width: `${readinessScore}%`, backgroundColor: isDark ? '#fff' : '#0f172a' }}></div>
                    </div>
                    <div className={`pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Cognitieve Stijl</span>
                            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{styleScore > 2 ? 'Innovator' : styleScore < -2 ? 'Adaptor' : 'Bridge'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Risico Profiel</span>
                            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{exposureScore > 60 ? 'Hoog' : 'Laag'}</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
      )}

      {/* Analytics Grid */}
      {!embedSettings.hideCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`rounded-2xl shadow-sm border p-6 flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Activity size={20} style={{ color: primaryColor }} /> 5-Dimensie Profiel</h3>
                </div>
                <div className="h-[250px] md:h-[300px] w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name={userName} dataKey="A" stroke={archetype.color} fill={archetype.color} fillOpacity={0.5} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDark ? '#1e293b' : '#fff' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="space-y-8">
                <div className={`rounded-2xl shadow-sm border p-6 flex flex-col h-[250px] md:h-[300px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><BarChart3 size={20} className="text-slate-400" /> Matrix Positie</h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <XAxis type="number" dataKey="x" domain={[-11, 11]} tick={false} stroke={isDark ? "#475569" : "#ccc"} />
                            <YAxis type="number" dataKey="y" domain={[0, 100]} tick={false} stroke={isDark ? "#475569" : "#ccc"} />
                            <ZAxis type="number" dataKey="z" range={[150, 150]} />
                            <ReferenceLine x={0} stroke={isDark ? "#475569" : "#94a3b8"} strokeWidth={2} />
                            <ReferenceLine y={60} stroke={isDark ? "#475569" : "#94a3b8"} strokeWidth={2} />
                            <Scatter data={scatterData} fill={archetype.color}>
                                {scatterData.map((entry, index) => <Cell key={`cell-${index}`} fill={archetype.color} />)}
                            </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                        <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded border" style={{ borderColor: archetype.color, color: archetype.color, backgroundColor: archetype.color + '10' }}>{archetype.name}</div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Detailed Explanation Section */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Briefcase size={18} className="text-slate-400" /> Impact op uw Rol</h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Met een automateringsscore van <strong>{exposureScore}%</strong> bevat uw functie {exposureScore > 50 ? 'veel' : 'weinig'} repetitieve elementen.</p>
         </div>
         <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Lightbulb size={18} className="text-slate-400" /> Uw Kracht</h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Als <strong>{styleScore > 0 ? "Innovator" : "Adaptor"}</strong> ligt uw kracht in het {styleScore > 0 ? "doorbreken van bestaande patronen." : "optimaliseren van bestaande processen."}</p>
         </div>
         <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Activity size={18} className="text-slate-400" /> Volgende Stap</h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Uw veranderbereidheid score van <strong>{sentimentScore}%</strong> suggereert dat u {sentimentScore > 50 ? "staat te springen om te beginnen." : "behoefte heeft aan duidelijkheid en veiligheid."}</p>
         </div>
      </div>

      {/* Roadmap Section */}
      {!embedSettings.hideRoadmap && (
      <div className={`relative min-h-[400px] pt-8 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {!currentUser ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pt-20">
             <div className={`backdrop-blur-md border p-8 rounded-2xl shadow-2xl max-w-lg w-full ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-white/20'}`}>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><Lock size={24} /></div>
               <h3 className={`text-xl md:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ontgrendel uw Actieplan</h3>
               <p className={`mb-6 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Gemini AI heeft een strategie van <strong>30-60-90 dagen</strong> gegenereerd.</p>
               <Button size="lg" variant="secondary" className="w-full shadow-xl" onClick={() => setShowSignupModal(true)}>Bekijk Volledig Rapport</Button>
             </div>
          </div>
        ) : null}

        <div className={`transition-all duration-700 ${!currentUser ? 'filter blur-md opacity-40 select-none scale-[0.98]' : 'opacity-100 scale-100'}`}>
           <div className={`rounded-2xl shadow-sm border p-6 md:p-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <div>
                 <h3 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Sparkles className="text-amber-400 fill-amber-400" /> Uw Persoonlijke Roadmap</h3>
                 <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Powered by Gemini 2.5</p>
                 <p className={`text-xs mt-2 italic max-w-2xl ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>"{archetype.generalActionPlan}"</p>
               </div>
               <Button variant="outline" onClick={() => alert('Download gestart')} className="gap-2 w-full md:w-auto"><Download size={16} /> Download PPTX</Button>
             </div>

             {loadingRoadmap ? (
               <div className="flex flex-col items-center justify-center py-20 space-y-4">
                 <RefreshCw className="animate-spin text-blue-600" size={32} />
                 <p className="text-slate-500 animate-pulse">Gemini analyseert uw profiel...</p>
               </div>
             ) : (
               <div className="grid md:grid-cols-3 gap-6">
                 {['day30', 'day60', 'day90'].map((key, idx) => (
                   <div key={key} className={`rounded-xl p-6 border transition-shadow ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-slate-50 border-slate-100 hover:shadow-md'}`}>
                     <div className="flex items-center justify-between mb-3">
                        <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{idx === 0 ? 'Maand 1' : idx === 1 ? 'Maand 2' : 'Maand 3'}</div>
                        <div className="text-slate-400 font-bold text-4xl opacity-20">{idx === 0 ? '30' : idx === 1 ? '60' : '90'}</div>
                     </div>
                     <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{roadmap ? roadmap[key]?.focus : "Laden..."}</h4>
                     <ul className="space-y-4">
                       {roadmap && roadmap[key]?.actions.map((action: string, i: number) => (
                         <li key={i} className={`flex items-start gap-3 text-sm group ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                           <div className={`mt-0.5 p-0.5 rounded-full transition-colors shrink-0 ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'}`}><Check size={12} /></div>
                           <span className="leading-relaxed">{action}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
      )}
      <ChatAssistant contextData={chatContext} />
      
      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-white/20'}`}>
            <div className="mb-6 text-center">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Rapport Opslaan</h3>
            </div>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Naam</label>
                <input type="text" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-600 text-white focus:ring-blue-500' : 'border-slate-300 focus:ring-blue-600'}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">E-mailadres</label>
                <input type="email" required className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-600 text-white focus:ring-blue-500' : 'border-slate-300 focus:ring-blue-600'}`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="pt-4">
                <Button type="submit" variant="secondary" className="w-full" size="lg" style={{ backgroundColor: primaryColor }} disabled={isSubmitting}>{isSubmitting ? 'Versturen...' : 'Toon Mijn Resultaten'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
