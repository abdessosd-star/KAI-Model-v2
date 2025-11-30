
import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, EmbedSettings, Organization } from './types';
import { Assessment } from './components/Assessment';
import { Results } from './components/Results';
import { OrgDashboard } from './components/OrgDashboard';
import { Button } from './components/Button';
import { BrainCircuit, Building2, LogIn, PlayCircle, RotateCcw, X, Lock, Zap, LogOut } from 'lucide-react';
import { QUICK_SCAN_IDS } from './constants';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number | string>>({});
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [savedProgress, setSavedProgress] = useState<{step: number, answers: Record<string, number | string>} | null>(null);
  
  // Org Dashboard Context
  const [dashboardOrg, setDashboardOrg] = useState<Organization | null>(null);

  // Embed / Config State
  const [questionLimit, setQuestionLimit] = useState<number | undefined>(undefined);
  const [initialStepOverride, setInitialStepOverride] = useState<number>(0);
  const [embedSettings, setEmbedSettings] = useState<EmbedSettings>({});
  const [allowedQuestions, setAllowedQuestions] = useState<string[] | undefined>(undefined);

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // 1. Handle LocalStorage for Progress
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

    // 2. Handle LocalStorage for User Session (Persist Login/Signup)
    const savedSession = localStorage.getItem('kai_user_session');
    if (savedSession) {
        try {
            const user = JSON.parse(savedSession);
            setCurrentUser(user);
            
            // Route based on role
            if (user.role === 'ADMIN') {
                setView(ViewState.ORG_DASHBOARD);
                setDashboardOrg(null); // Master view
            } else if (user.role === 'MANAGER') {
                if (user.orgId) {
                    const org = storageService.getOrganizations().find(o => o.id === user.orgId);
                    if (org) {
                        setDashboardOrg(org);
                        setView(ViewState.ORG_DASHBOARD);
                    } else {
                        // Org no longer exists
                        handleLogout();
                    }
                }
            } else if (user.role === 'USER') {
                // Users stay on results or landing if no assessment done yet
                // Ideally we check if they have results, for now we assume session means results view 
                // IF we had answers persisted. Since we don't persist answers in session yet (only user profile),
                // we might need to be careful. For now, let's keep them on LANDING unless they just finished.
            }
        } catch (e) { console.error("Session parse error", e); }
    }

    // 3. Handle URL Params (Embed Configuration)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        
        // Handle start mode
        if (params.get('start') === 'assessment') {
            setView(ViewState.ASSESSMENT);
        }

        // Handle skip profile
        if (params.get('skip_profile') === 'true') {
            setInitialStepOverride(6); 
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
    setAllowedQuestions(undefined); // Full assessment
    localStorage.removeItem('kai_assessment_progress');
    setView(ViewState.ASSESSMENT);
  };

  const handleStartQuickScan = () => {
    setSavedProgress(null);
    setAllowedQuestions(QUICK_SCAN_IDS); // Quick scan
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
    const newUser: UserProfile = { name, email, role: 'USER' };
    setCurrentUser(newUser);
    localStorage.setItem('kai_user_session', JSON.stringify(newUser));
  };

  const handleOrgLoginClick = () => {
    setShowLoginModal(true);
    setLoginError('');
    setLoginCode('');
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCode === "1102") {
      // MASTER ADMIN
      const adminUser: UserProfile = { name: "Master Admin", email: "admin@platform.com", role: 'ADMIN' };
      setCurrentUser(adminUser);
      localStorage.setItem('kai_user_session', JSON.stringify(adminUser));
      
      setDashboardOrg(null); // Null means View All / Master view
      setView(ViewState.ORG_DASHBOARD);
      setShowLoginModal(false);
    } else {
      // CHECK ORG CODE -> MANAGER ROLE
      const org = storageService.getOrgByCode(loginCode.toUpperCase());
      if (org) {
        const managerUser: UserProfile = { name: `${org.name} Manager`, email: "manager@org.com", role: 'MANAGER', orgId: org.id };
        setCurrentUser(managerUser);
        localStorage.setItem('kai_user_session', JSON.stringify(managerUser));
        
        setDashboardOrg(org);
        setView(ViewState.ORG_DASHBOARD);
        setShowLoginModal(false);
      } else {
        setLoginError("Ongeldige toegangscode.");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kai_user_session');
    setDashboardOrg(null);
    setView(ViewState.LANDING);
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
            allowedQuestionIds={allowedQuestions}
          />
        );
      
      case ViewState.RESULTS:
        return (
          <Results 
            answers={assessmentAnswers} 
            currentUser={currentUser} 
            onSignup={handleSignup} 
            onLogout={handleLogout}
            embedSettings={embedSettings}
          />
        );
      
      case ViewState.ORG_DASHBOARD:
        return (
            <OrgDashboard 
                currentUser={currentUser}
                currentOrg={dashboardOrg} 
                onLogout={handleLogout}
                onSwitchOrg={(org) => setDashboardOrg(org)}
            />
        );

      case ViewState.LANDING:
      default:
        return (
          <div className="max-w-4xl mx-auto text-center space-y-12 py-8 md:py-12">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm font-medium border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                KAI-Model V1.0 Live
              </div>
              <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight px-4">
                Van Kennis naar <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligentie</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4">
                Ontdek uw AI-profiel en genereer automatisch een persoonlijk transformatieplan gebaseerd op cognitieve psychologie en taak-analyse.
              </p>
              
              <div className="flex flex-col items-center gap-4 pt-4 px-4">
                {savedProgress ? (
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                     <Button size="lg" variant="primary" onClick={handleResumeAssessment} className="shadow-xl shadow-blue-600/20 gap-2 w-full sm:w-auto">
                      <PlayCircle size={20} />
                      Hervatten
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleStartAssessment} className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 w-full sm:w-auto">
                      <RotateCcw size={18} />
                      Opnieuw
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button size="lg" variant="secondary" onClick={handleStartAssessment} className="shadow-xl shadow-blue-600/20 w-full sm:w-auto">
                        Start Volledige Assessment
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleStartQuickScan} className="gap-2 w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Zap size={18} className="text-amber-500" />
                        Quick Scan (11 Vragen)
                    </Button>
                  </div>
                )}

                <Button variant="ghost" onClick={handleOrgLoginClick} className="gap-2 text-slate-500 hover:text-slate-900 mt-2">
                  <Building2 size={18} />
                  Voor Organisaties
                </Button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-200 px-4">
              <div className="p-4 md:p-6 text-left space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold">1</div>
                <h3 className="font-bold text-lg text-slate-900">Taak Analyse</h3>
                <p className="text-slate-500 text-sm">Bepaal uw 'Exposure Score' op basis van dagelijkse taken en automatisering potentieel.</p>
              </div>
              <div className="p-4 md:p-6 text-left space-y-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 font-bold">2</div>
                <h3 className="font-bold text-lg text-slate-900">Cognitieve Stijl</h3>
                <p className="text-slate-500 text-sm">Ontdek of u een Adaptor of Innovator bent en hoe dit uw AI-adoptie beïnvloedt.</p>
              </div>
              <div className="p-4 md:p-6 text-left space-y-3">
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
          <div className="flex items-center gap-2 font-bold text-lg md:text-xl cursor-pointer" onClick={() => setView(ViewState.LANDING)}>
            <div className={`p-1.5 rounded-lg ${embedSettings.theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
              <BrainCircuit size={20} className="md:w-6 md:h-6" />
            </div>
            <span className={embedSettings.theme === 'dark' ? 'text-white' : 'text-slate-900'}>KAI-Model</span>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full border ${embedSettings.theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">{currentUser.name}</span>
                    <span className="sm:hidden">{currentUser.name.split(' ')[0]}</span>
                    <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold ml-1">{currentUser.role}</span>
                  </div>
                  {currentUser.role === 'USER' && (
                    <button onClick={handleLogout} className="text-slate-400 hover:text-slate-700" title="Uitloggen">
                        <LogOut size={18} />
                    </button>
                  )}
              </div>
            ) : (
              <button onClick={handleOrgLoginClick} className={`text-sm font-medium flex items-center gap-1 ${embedSettings.theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 p-0 md:p-8 ${embedSettings.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-sm ${embedSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
        <p>&copy; 2025 KAI-Model Platform.</p>
        <p className="mt-2 text-xs">Powered by Google Gemini 2.5</p>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up border border-white/20 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
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
                <input type="password" autoFocus className="w-full px-4 py-3 text-center text-xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="● ● ● ●" value={loginCode} onChange={e => setLoginCode(e.target.value)} />
                {loginError && <p className="text-red-500 text-xs text-center mt-2">{loginError}</p>}
              </div>
              <Button type="submit" variant="primary" className="w-full" size="lg">Verifiëren</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
