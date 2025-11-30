
import React, { useState, useEffect } from 'react';
import { ARCHETYPES, QUESTIONS } from '../constants';
import { storageService } from '../services/storageService';
import { Organization, EmployeeData, UserProfile } from '../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Button } from './Button';
import { Upload, Users, AlertTriangle, Code, Copy, Check, Globe, Settings, Sliders, Eye, EyeOff, Palette, Moon, Sun, BookOpen, BrainCircuit, Plus, Trash2, LogOut, ArrowRight, Share2, Shield } from 'lucide-react';

interface OrgDashboardProps {
  currentOrg: Organization | null; // Null means master admin view
  currentUser: UserProfile | null;
  onLogout: () => void;
  onSwitchOrg: (org: Organization) => void;
}

export const OrgDashboard: React.FC<OrgDashboardProps> = ({ currentOrg, currentUser, onLogout, onSwitchOrg }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'embed' | 'personas'>('overview');
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  
  // Org Creation State
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCode, setNewOrgCode] = useState('');

  const [copied, setCopied] = useState(false);
  
  // Embed Config
  const [embedConfig, setEmbedConfig] = useState({
    skipLanding: false,
    skipProfile: false,
    limitQuestions: QUESTIONS.length,
    theme: 'light' as 'light' | 'dark',
    primaryColor: '#2563eb',
    showRoadmap: true,
    showCharts: true,
    showArchetype: true
  });

  // Load Data
  useEffect(() => {
    if (currentOrg) {
      // Load specific org data
      const data = storageService.getEmployees(currentOrg.code);
      setEmployees(data);
    } else if (currentUser?.role === 'ADMIN') {
      // Master Admin Mode: Load all organizations
      const orgs = storageService.getOrganizations();
      setAllOrgs(orgs);
    }
  }, [currentOrg, activeTab, currentUser]);

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName && newOrgCode) {
      const success = storageService.createOrganization(newOrgName, newOrgCode);
      if (success) {
        setAllOrgs(storageService.getOrganizations());
        setIsCreatingOrg(false);
        setNewOrgName('');
        setNewOrgCode('');
      } else {
        alert("Code bestaat al!");
      }
    }
  };

  const handleDeleteEmployee = (id: string) => {
    if(confirm("Weet u zeker dat u deze medewerker wilt verwijderen?")) {
      storageService.deleteEmployee(id);
      if (currentOrg) {
        setEmployees(storageService.getEmployees(currentOrg.code));
      }
    }
  };

  const scatterData = employees.map(emp => ({
    x: emp.kaiScore,
    y: emp.readinessScore,
    z: 1,
    name: emp.name,
    archetype: emp.archetype
  }));

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kai-platform.com';
  
  const generateEmbedUrl = () => {
    const params = new URLSearchParams();
    params.append('ref', 'embed');
    if (embedConfig.skipLanding) params.append('start', 'assessment');
    if (embedConfig.skipProfile) params.append('skip_profile', 'true');
    if (embedConfig.limitQuestions < QUESTIONS.length) params.append('limit', embedConfig.limitQuestions.toString());
    if (embedConfig.theme === 'dark') params.append('theme', 'dark');
    if (embedConfig.primaryColor !== '#2563eb') params.append('primary_color', embedConfig.primaryColor.replace('#', ''));
    if (!embedConfig.showRoadmap) params.append('hide_roadmap', 'true');
    if (!embedConfig.showCharts) params.append('hide_charts', 'true');
    if (!embedConfig.showArchetype) params.append('hide_archetype', 'true');
    return `${currentUrl}?${params.toString()}`;
  };

  const embedCode = `<iframe src="${generateEmbedUrl()}" width="100%" height="800" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" title="KAI Assessment"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- MASTER ADMIN VIEW (LIST OF ORGS) ---
  if (!currentOrg && currentUser?.role === 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Shield size={28} className="text-purple-600"/> Platform Beheer</h1>
          <Button variant="outline" onClick={onLogout} className="gap-2 text-red-600 hover:bg-red-50 border-red-200">
            <LogOut size={16} /> Uitloggen
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Organisaties</h2>
            <Button onClick={() => setIsCreatingOrg(true)} className="gap-2">
              <Plus size={18} /> Nieuwe Organisatie
            </Button>
          </div>

          {isCreatingOrg && (
            <form onSubmit={handleCreateOrg} className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Naam</label>
                   <input 
                     className="w-full px-3 py-2 border rounded-md" 
                     placeholder="Bijv. Philips"
                     value={newOrgName}
                     onChange={e => setNewOrgName(e.target.value)}
                     required
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Unieke Code</label>
                   <input 
                     className="w-full px-3 py-2 border rounded-md uppercase" 
                     placeholder="PHILIPS24"
                     value={newOrgCode}
                     onChange={e => setNewOrgCode(e.target.value.toUpperCase())}
                     required
                   />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Aanmaken</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingOrg(false)}>Annuleren</Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {allOrgs.map(org => {
               const empCount = storageService.getEmployees(org.code).length;
               return (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{org.name}</h3>
                    <div className="text-sm text-slate-500 flex gap-4 mt-1">
                      <span className="flex items-center gap-1"><Code size={12}/> Code: {org.code}</span>
                      <span className="flex items-center gap-1"><Users size={12}/> {empCount} gebruikers</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => onSwitchOrg(org)} className="gap-2">
                    Dashboard Openen <ArrowRight size={16}/>
                  </Button>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    );
  }

  // If no org selected and NOT admin (should not happen due to App logic, but safe guard)
  if (!currentOrg) return <div>Toegang geweigerd.</div>;

  // --- ORG DASHBOARD VIEW (ADMIN or MANAGER) ---
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{currentOrg.name} Dashboard</h1>
          <p className="text-slate-500">Code: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{currentOrg.code}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Overzicht</button>
           <button onClick={() => setActiveTab('personas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'personas' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><BookOpen size={16} /> Bibliotheek</button>
           <button onClick={() => setActiveTab('embed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'embed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Code size={16} /> Embed</button>
           
           {/* If Admin, allow going back to list */}
           {currentUser?.role === 'ADMIN' && (
              <button onClick={() => onSwitchOrg(null as any)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-2 border border-slate-200 ml-2">Terug naar Admin</button>
           )}

           <button onClick={onLogout} className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 ml-2 border border-red-100"><LogOut size={16} /> Log uit</button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
            {/* Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                      <span className="text-slate-500 font-medium text-sm">Totaal Deelnemers</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{employees.length}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={20} /></div>
                      <span className="text-slate-500 font-medium text-sm">Hoog Risico (Vervanging)</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {Math.round((employees.filter(e => e.exposureScore > 60 && e.kaiScore < 0).length / (employees.length || 1)) * 100)}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Hoge blootstelling, lage adaptiviteit</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
                      <span className="text-slate-500 font-medium text-sm">Klaar voor Pilots</span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                     {Math.round((employees.filter(e => e.readinessScore > 70 && e.kaiScore > 0).length / (employees.length || 1)) * 100)}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Innovators & Architecten</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Cognitive Diversity Heatmap</h3>
                {employees.length === 0 ? (
                    <div className="h-[400px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                        Nog geen data beschikbaar. Deel de assessment link.
                    </div>
                ) : (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <XAxis type="number" dataKey="x" name="Stijl" domain={[-12, 12]} tick={false} label={{ value: 'Adaptief <-> Innovatief', position: 'bottom', offset: 0 }} />
                            <YAxis type="number" dataKey="y" name="Readiness" domain={[0, 100]} tick={false} label={{ value: 'AI Readiness', angle: -90, position: 'insideLeft' }} />
                            <ZAxis type="number" dataKey="z" range={[60, 60]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <ReferenceLine x={0} stroke="#e2e8f0" />
                            <ReferenceLine y={50} stroke="#e2e8f0" />
                            <Scatter data={scatterData} fill="#3b82f6">
                                {scatterData.map((entry, index) => {
                                    let color = '#94a3b8';
                                    Object.values(ARCHETYPES).forEach(arch => {
                                        if(arch.name === entry.archetype) color = arch.color;
                                    });
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                })}
                            </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                )}
                </div>

                {/* List */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Gebruikers Beheer</h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[400px]">
                      {employees.length === 0 && <p className="text-sm text-slate-400 italic">Geen gebruikers gevonden.</p>}
                      {employees.map(emp => {
                          let color = '#94a3b8';
                          Object.values(ARCHETYPES).forEach(arch => {
                              if(arch.name === emp.archetype) color = arch.color;
                          });

                          return (
                              <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                                  <div>
                                      <div className="font-medium text-slate-900 text-sm">{emp.name}</div>
                                      <div className="text-xs text-slate-500">{emp.department} • <span style={{color}}>{emp.archetype}</span></div>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button title="Profiel Delen" className="p-1 hover:bg-white rounded text-blue-600" onClick={() => alert("Link gekopieerd (simulatie)")}>
                                          <Share2 size={14} />
                                      </button>
                                      <button title="Verwijderen" className="p-1 hover:bg-white rounded text-red-500" onClick={() => handleDeleteEmployee(emp.id)}>
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'personas' && (
        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Object.values(ARCHETYPES).map((arch, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="h-2 w-full" style={{ backgroundColor: arch.color }} />
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">{arch.name}</h3>
                            <div className="bg-slate-100 p-2 rounded-full">
                                <BrainCircuit size={16} style={{ color: arch.color }} />
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 flex-1">{arch.description}</p>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                                <span>Verander-moeilijkheid</span>
                                <span>{arch.transformationDifficulty}/10</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="h-2 rounded-full transition-all" style={{ width: `${arch.transformationDifficulty * 10}%`, backgroundColor: arch.transformationDifficulty > 7 ? '#ef4444' : arch.transformationDifficulty > 4 ? '#f59e0b' : '#10b981'}} />
                            </div>
                        </div>
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Management Tip</h4>
                                <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{arch.managementTips?.[0]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'embed' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Code size={20} className="text-purple-600" />
                        Embed Generator
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Configureer en plaats de assessment tool op uw eigen intranet.
                    </p>
                </div>
                <div className="hidden md:block">
                    <Settings className="text-slate-200 h-12 w-12" />
                </div>
            </div>
            <div className="p-6 flex flex-col lg:flex-row gap-8">
                {/* Configuration Panel */}
                <div className="w-full lg:w-1/3 space-y-8 border-r border-slate-100 pr-6">
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2"><Sliders size={16} /> Gedrag</h4>
                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-sm font-medium text-slate-700">Direct Starten (Widget)</span>
                            <input type="checkbox" checked={embedConfig.skipLanding} onChange={(e) => setEmbedConfig({...embedConfig, skipLanding: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600" />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-sm font-medium text-slate-700">Sla Profielvragen Over</span>
                            <input type="checkbox" checked={embedConfig.skipProfile} onChange={(e) => setEmbedConfig({...embedConfig, skipProfile: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600" />
                        </label>
                    </div>
                    {/* ... rest of embed controls can be expanded similarly ... */}
                </div>
                <div className="flex-1 flex flex-col gap-6">
                    <div className="relative group flex-1">
                        <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-slate-800 shadow-inner h-full min-h-[160px] whitespace-pre-wrap break-all flex items-center">{embedCode}</pre>
                    </div>
                    <div className="flex gap-3">
                        <Button variant={copied ? "secondary" : "primary"} onClick={handleCopyEmbed} className="flex-1 justify-center gap-2 transition-all">{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? 'Gekopieerd!' : 'Kopieer Embed Code'}</Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
