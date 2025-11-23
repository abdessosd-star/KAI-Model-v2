
import React, { useState } from 'react';
import { MOCK_EMPLOYEES, ARCHETYPES, QUESTIONS } from '../constants';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Button } from './Button';
import { Upload, Users, AlertTriangle, Code, Copy, Check, Globe, Settings, Sliders, Eye, EyeOff, Palette, Moon, Sun } from 'lucide-react';

export const OrgDashboard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  // Embed Configuration State
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

  const scatterData = MOCK_EMPLOYEES.map(emp => ({
    x: emp.kaiScore,
    y: emp.readinessScore,
    z: 1,
    name: emp.name,
    archetype: emp.archetype
  }));

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

    return `?${params.toString()}`;
  };

  const embedCode = `<iframe 
  src="${generateEmbedUrl()}" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" 
  title="KAI Assessment">
</iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organisatie Dashboard</h1>
          <p className="text-slate-500">Beheer assessments en analyseer team-dynamiek.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Upload size={16} />
            Import CSV
          </Button>
          <Button variant="primary" className="gap-2">
             Genereer Invite Code
          </Button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
             <span className="text-slate-500 font-medium text-sm">Totaal Deelnemers</span>
           </div>
           <div className="text-3xl font-bold text-slate-900">{MOCK_EMPLOYEES.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={20} /></div>
             <span className="text-slate-500 font-medium text-sm">Hoog Risico (Vervanging)</span>
           </div>
           <div className="text-3xl font-bold text-slate-900">28%</div>
           <div className="text-xs text-slate-400 mt-1">Hoge blootstelling, lage adaptiviteit</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
             <span className="text-slate-500 font-medium text-sm">Klaar voor Pilots</span>
           </div>
           <div className="text-3xl font-bold text-slate-900">42%</div>
           <div className="text-xs text-slate-400 mt-1">AI-Architecten & Bewakers</div>
        </div>
      </div>

      {/* Embed Generator Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                
                {/* Behavior Options */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Sliders size={16} /> Gedrag
                    </h4>
                    
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-medium text-slate-700">Direct Starten (Widget)</span>
                        <input 
                            type="checkbox" 
                            checked={embedConfig.skipLanding}
                            onChange={(e) => setEmbedConfig({...embedConfig, skipLanding: e.target.checked})}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                        />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-medium text-slate-700">Sla Profielvragen Over</span>
                        <input 
                            type="checkbox" 
                            checked={embedConfig.skipProfile}
                            onChange={(e) => setEmbedConfig({...embedConfig, skipProfile: e.target.checked})}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                        />
                    </label>

                    <div className="pt-2">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Aantal Vragen</span>
                            <span className="text-sm font-bold text-blue-600">{embedConfig.limitQuestions} / {QUESTIONS.length}</span>
                        </div>
                        <input 
                            type="range" 
                            min="5" 
                            max={QUESTIONS.length} 
                            value={embedConfig.limitQuestions}
                            onChange={(e) => setEmbedConfig({...embedConfig, limitQuestions: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                {/* Branding & Theme */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Palette size={16} /> Huisstijl
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setEmbedConfig({...embedConfig, theme: 'light'})}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${embedConfig.theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                        >
                            <Sun size={20} />
                            <span className="text-xs font-bold">Light Mode</span>
                        </button>
                        <button 
                            onClick={() => setEmbedConfig({...embedConfig, theme: 'dark'})}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${embedConfig.theme === 'dark' ? 'border-blue-600 bg-slate-800 text-white' : 'border-slate-200 text-slate-500'}`}
                        >
                            <Moon size={20} />
                            <span className="text-xs font-bold">Dark Mode</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Primaire Kleur</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500">{embedConfig.primaryColor}</span>
                            <input 
                                type="color"
                                value={embedConfig.primaryColor}
                                onChange={(e) => setEmbedConfig({...embedConfig, primaryColor: e.target.value})}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Visibility Options */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Eye size={16} /> Zichtbaarheid Resultaten
                    </h4>
                    
                    <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={embedConfig.showArchetype}
                            onChange={(e) => setEmbedConfig({...embedConfig, showArchetype: e.target.checked})}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600"
                        />
                        Toon Archetype Profiel
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={embedConfig.showCharts}
                            onChange={(e) => setEmbedConfig({...embedConfig, showCharts: e.target.checked})}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600"
                        />
                        Toon Grafieken & Data
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={embedConfig.showRoadmap}
                            onChange={(e) => setEmbedConfig({...embedConfig, showRoadmap: e.target.checked})}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600"
                        />
                        Toon Roadmap (Blur Wall)
                    </label>
                </div>
             </div>

             {/* Code Preview Panel */}
             <div className="flex-1 flex flex-col gap-6">
                <div className="relative group flex-1">
                    <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-slate-800 shadow-inner h-full min-h-[160px] whitespace-pre-wrap break-all flex items-center">
                        {embedCode}
                    </pre>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded">HTML</span>
                    </div>
                </div>
                
                <div className="flex gap-3">
                     <Button 
                        variant={copied ? "secondary" : "primary"} 
                        onClick={handleCopyEmbed} 
                        className="flex-1 justify-center gap-2 transition-all"
                     >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Gekopieerd!' : 'Kopieer Embed Code'}
                     </Button>
                     <Button variant="outline" onClick={() => window.open(generateEmbedUrl(), '_blank')} className="gap-2">
                        <Globe size={18} />
                        Test Preview
                     </Button>
                </div>
                
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex items-start gap-3">
                    <div className="mt-0.5"><Code size={16} /></div>
                    <p>
                        Tip: Gebruik de URL parameters in de gegenereerde code om specifieke secties te verbergen of kleuren aan te passen.
                    </p>
                </div>
             </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Cognitive Diversity Heatmap</h3>
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
                        // Map archetype name to color
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
        </div>

        {/* List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recente Activiteit</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {MOCK_EMPLOYEES.map(emp => {
                let color = '#94a3b8';
                Object.values(ARCHETYPES).forEach(arch => {
                    if(arch.name === emp.archetype) color = arch.color;
                });

                return (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                            <div className="font-medium text-slate-900 text-sm">{emp.name}</div>
                            <div className="text-xs text-slate-500">{emp.department}</div>
                        </div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} title={emp.archetype} />
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
