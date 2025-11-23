
import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, EmbedSettings } from './types';
import { Assessment } from './components/Assessment';
import { Results } from './components/Results';
import { OrgDashboard } from './components/OrgDashboard';
import { Button } from './components/Button';
import { BrainCircuit, Building2, LogIn, PlayCircle, RotateCcw, X, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number | string>>({});
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [savedProgress, setSavedProgress] = useState<{step: number, answers: Record<string, number | string>} | null>(null);
  
  // Embed / Config State
  const [questionLimit, setQuestionLimit] = useState<number | undefined>(undefined);
  const [initialStepOverride, setInitialStepOverride] = useState<number>(0);
  const [embedSettings, setEmbedSettings] = useState<EmbedSettings>({});

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // 1. Handle LocalStorage
    const saved = localStorage.getItem('kai_assessment_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.answers) {
          setSavedProgress(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }

    // 2. Handle URL Params (Embed Configuration)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        
        // Handle start mode
        if (params.get('start') === 'assessment') {
            setView(ViewState.ASSESSMENT);
        }

        // Handle skip profile
        if (params.get('skip_profile') === 'true') {
            setInitialStepOverride(6); // Assuming profile questions are 0-5
            setView(ViewState.ASSESSMENT);
        }

        // Handle question limit
        const limitParam = params.get('limit');
        if (limitParam) {
            const limit = parseInt(limitParam, 10);
            if (!isNaN(limit) && limit > 0) {
                setQuestionLimit(limit);
            }
        }

        // Handle Embed Settings
        const settings: EmbedSettings = {};
        if (params.get('theme')) settings.theme = params.get('theme') as 'light' | 'dark';
        if (params.get('primary_color')) settings.primaryColor = '#' + params.get('primary_color');
        if (params.get('hide_roadmap') === 'true') settings.hideRoadmap = true;
        if (params.get('hide_charts') === 'true') settings.hideCharts = true;
        if (params.get('hide_archetype') === 'true') settings.hideArchetype = true;
        setEmbedSettings(settings);
    }
  }, []);

  const handleStartAssessment = () => {
    setSavedProgress(null); 
    localStorage.removeItem('kai_assessment_progress');
    setView(ViewState.ASSESSMENT);
  };

  const handleResumeAssessment = () => {
    if (savedProgress) {
      setView(ViewState.ASSESSMENT);
    }
  };

  const handleAssessmentComplete = (answers: Record<string, number | string>) => {
    setAssessmentAnswers(answers);
    setView(ViewState.RESULTS);
  };

  const handleSaveAndExit = () => {
    setView(ViewState.LANDING);
    const saved = localStorage.getItem('kai_assessment_progress');
    if (saved) {
       setSavedProgress(JSON.parse(saved));
    }
  };

  const handleSignup = (name: string, email: string) => {
    setCurrentUser({ name, email, role: 'USER' });
  };

  const handleOrgLoginClick = () => {
    setShowLoginModal(true);
    setLoginError('');
    setLoginCode('');
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCode === "1102") {
      setCurrentUser({ name: "Manager", email: "manager@corp.com", role: 'ADMIN' });
      setView(ViewState.ORG_DASHBOARD);
      setShowLoginModal(false);
    } else {
      setLoginError("Ongeldige toegangscode.");
    }
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.ASSESSMENT:
        return (
          <Assessment 
            onComplete={handleAssessmentComplete} 
            onSaveAndExit={handleSaveAndExit}
            initialAnswers={savedProgress?.answers}
            initialStep={initialStepOverride > 0 ? initialStepOverride : savedProgress?.step}
            questionLimit={questionLimit}
          />
        );
      
      case ViewState.RESULTS:
        return (
          <Results 
            answers={assessmentAnswers} 
            currentUser={currentUser} 
            onSignup={handleSignup} 
            embedSettings={embedSettings}
          />
        );
      
      case ViewState.ORG_DASHBOARD:
        return <OrgDashboard />;

      case ViewState.LANDING:
      default:
        return (
          <div className="max-w-4xl mx-auto text-center space-y-12 py-12">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                KAI-Model V1.0 Live
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Van Kennis naar <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligentie</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Ontdek uw AI-profiel en genereer automatisch een persoonlijk transformatieplan gebaseerd op cognitieve psychologie en taak-analyse.
              </p>
              
              <div className="flex flex-col items-center gap-4 pt-4">
                {savedProgress ? (
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                     <Button size="lg" variant="primary" onClick={handleResumeAssessment} className="shadow-xl shadow-blue-600/20 gap-2">
                      <PlayCircle size={20} />
                      Hervatten (Vraag {savedProgress.step + 1})
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleStartAssessment} className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50">
                      <RotateCcw size={18} />
                      Opnieuw Beginnen
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" variant="secondary" onClick={handleStartAssessment} className="shadow-xl shadow-blue-600/20 w-full sm:w-auto">
                    Start Gratis Assessment
                  </Button>
                )}

                <Button variant="ghost" onClick={handleOrgLoginClick} className="gap-2 text-slate-500 hover:text-slate-900 mt-2">
                  <Building2 size={18} />
                  Voor Organisaties
                </Button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-200">
              <div className="p-6 text-left space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold">1</div>
                <h3 className="font-bold text-lg text-slate-900">Taak Analyse</h3>
                <p className="text-slate-500 text-sm">Bepaal uw 'Exposure Score' op basis van dagelijkse taken en automatisering potentieel.</p>
              </div>
              <div className="p-6 text-left space-y-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold">2</div>
                <h3 className="font-bold text-lg text-slate-900">Cognitieve Stijl</h3>
                <p className="text-slate-500 text-sm">Ontdek of u een Adaptor of Innovator bent en hoe dit uw AI-adoptie beïnvloedt.</p>
              </div>
              <div className="p-6 text-left space-y-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold">3</div>
                <h3 className="font-bold text-lg text-slate-900">Gemini Roadmap</h3>
                <p className="text-slate-500 text-sm">Ontvang een op maat gemaakt 30-60-90 dagen plan gegenereerd door Google Gemini.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${embedSettings.theme === 'dark' ? 'dark' : ''}`}>
      {/* Navbar */}
      <header className={`border-b sticky top-0 z-50 ${embedSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => setView(ViewState.LANDING)}
          >
            <div className={`p-1.5 rounded-lg ${embedSettings.theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
              <BrainCircuit size={24} />
            </div>
            <span className={embedSettings.theme === 'dark' ? 'text-white' : 'text-slate-900'}>KAI-Model</span>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${embedSettings.theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 {currentUser.name}
              </div>
            ) : (
              <button 
                onClick={handleOrgLoginClick} 
                className={`text-sm font-medium flex items-center gap-1 ${embedSettings.theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 ${embedSettings.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-sm ${embedSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
        <p>&copy; 2025 KAI-Model Platform. All rights reserved.</p>
        <p className="mt-2 text-xs">Powered by Google Gemini 2.5 & React</p>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up border border-white/20 relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Organisatie Login</h3>
                <p className="text-slate-500 text-sm">Voer uw toegangscode in.</p>
            </div>
            
            <form onSubmit={submitLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full px-4 py-3 text-center text-xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="● ● ● ●"
                  value={loginCode}
                  onChange={e => setLoginCode(e.target.value)}
                />
                {loginError && <p className="text-red-500 text-xs text-center mt-2">{loginError}</p>}
              </div>
              <Button type="submit" variant="primary" className="w-full" size="lg">
                Verifiëren
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
