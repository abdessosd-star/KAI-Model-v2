
import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '../constants';
import { Question, QuestionType } from '../types';
import { Button } from './Button';
import { ArrowRight, CheckCircle2, ArrowLeft, Save } from 'lucide-react';
import { storageService } from '../services/storageService';

interface AssessmentProps {
  onComplete: (answers: Record<string, number | string>) => void;
  onSaveAndExit: () => void;
  initialAnswers?: Record<string, number | string>;
  initialStep?: number;
  questionLimit?: number;
  allowedQuestionIds?: string[];
}

export const Assessment: React.FC<AssessmentProps> = ({ 
  onComplete, 
  onSaveAndExit, 
  initialAnswers = {}, 
  initialStep = 0,
  questionLimit,
  allowedQuestionIds
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Record<string, number | string>>(initialAnswers);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter questions based on allowed list (Quick Scan) if provided
  const activeQuestions = allowedQuestionIds 
    ? QUESTIONS.filter(q => allowedQuestionIds.includes(q.id))
    : QUESTIONS;

  // Calculate effective total questions based on limit
  const totalQuestions = questionLimit ? Math.min(questionLimit, activeQuestions.length) : activeQuestions.length;
  const currentQuestion = activeQuestions[currentStep];

  // Safe check to prevent out of bounds if limit changed or url param is wrong
  useEffect(() => {
    if ((currentStep >= totalQuestions && totalQuestions > 0) || !currentQuestion) {
        // If we go out of bounds (e.g. quick scan has fewer questions), complete early
        // But only if we actually have some questions
        if (totalQuestions > 0) {
            onComplete(answers);
        }
    }
  }, [currentStep, totalQuestions, currentQuestion, onComplete, answers]);

  const progress = ((currentStep + 1) / totalQuestions) * 100;

  // Auto-focus text inputs
  useEffect(() => {
    if (currentQuestion?.type === QuestionType.TEXT && inputRef.current) {
      inputRef.current.focus();
    }
    // Scroll to top on step change
    window.scrollTo(0, 0);
  }, [currentStep, currentQuestion?.type]);

  if (!currentQuestion) return null;

  const handleAnswer = (value: number | string) => {
    // If it's the org code, auto-uppercase it
    if (currentQuestion.id === 'prof_org_code' && typeof value === 'string') {
        value = value.toUpperCase();
    }
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    // Validation for Org Code
    if (currentQuestion.id === 'prof_org_code') {
        const code = answers['prof_org_code'] as string;
        // Only validate if user actually entered something (it's optional in the text, but if entered must be valid)
        if (code && code.trim() !== '') {
            const org = storageService.getOrgByCode(code.toUpperCase());
            if (!org) {
                alert("Deze organisatiecode is niet gevonden in het systeem. Controleer de code of laat het veld leeg als u geen code heeft.");
                return;
            }
        }
    }

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Clear storage when finished to prevent resuming a completed session
      localStorage.removeItem('kai_assessment_progress');
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep > (initialStep || 0)) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    const progressData = {
      step: currentStep,
      answers: answers,
      date: new Date().toISOString()
    };
    localStorage.setItem('kai_assessment_progress', JSON.stringify(progressData));
    onSaveAndExit();
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'profile': return 'Profiel & Context';
      case 'exposure': return 'Taak & Rol Analyse';
      case 'style': return 'Cognitieve Stijl (KAI)';
      case 'readiness': return 'Digitale Vaardigheid';
      case 'sentiment': return 'Toekomstvisie';
      default: return 'Algemeen';
    }
  };

  const validateInput = () => {
    // Special handling for org code: it is optional in UI context, 
    // but we treat empty string as valid answer to proceed.
    if (currentQuestion.id === 'prof_org_code') return true;

    if (!answers[currentQuestion.id]) return false;
    
    // Email validation
    if (currentQuestion.id === 'prof_email') {
        const email = answers[currentQuestion.id] as string;
        return email.includes('@') && email.includes('.');
    }
    
    return answers[currentQuestion.id] !== '';
  };

  const isAnswered = validateInput();

  // Helper to render specific input types
  const renderInput = (question: Question) => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <div className="mt-4">
            <input
              ref={inputRef}
              type={question.id === 'prof_email' ? 'email' : 'text'}
              className="w-full p-4 text-base md:text-lg border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm"
              placeholder={question.id === 'prof_email' ? 'naam@bedrijf.nl' : question.id === 'prof_org_code' ? 'Bijv. DEMO2025' : 'Typ uw antwoord hier...'}
              value={(answers[question.id] as string) || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    // For org code, we always allow enter
                    if (question.id === 'prof_org_code' || isAnswered) {
                        handleNext();
                    }
                }
              }}
            />
          </div>
        );

      case QuestionType.SELECT:
        return (
          <div className="mt-4 grid gap-3 max-h-[350px] md:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
             {question.options?.map((opt, idx) => (
               <button
                key={idx}
                onClick={() => {
                    handleAnswer(opt.value);
                }}
                className={`p-3 md:p-4 text-left rounded-lg border-2 transition-all flex items-center justify-between text-sm md:text-base
                  ${answers[question.id] === opt.value 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium shadow-md' 
                    : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700 hover:shadow-sm'}`}
               >
                 <span>{opt.label}</span>
                 {answers[question.id] === opt.value && <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />}
               </button>
             ))}
          </div>
        );

      case QuestionType.SCALE:
        return (
          <div className="mt-6 md:mt-8 px-0 md:px-2">
             <div className="flex justify-between gap-1 md:gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  className={`w-11 h-11 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center text-lg md:text-2xl font-medium transition-all duration-200
                    ${answers[question.id] === num 
                      ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-lg' 
                      : 'border-slate-200 hover:border-blue-400 text-slate-500 hover:bg-slate-50'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between w-full px-1 md:px-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Helemaal oneens</span>
              <span>Helemaal eens</span>
            </div>
          </div>
        );

      case QuestionType.SLIDER:
        return (
          <div className="mt-12 px-2 md:px-4">
            <div className="relative mb-8">
                 <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={(answers[question.id] as number) || 0}
                  onChange={(e) => handleAnswer(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex justify-between mt-4 text-slate-500 font-medium text-xs md:text-sm">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>
            <div className="text-center">
                <span className="text-4xl md:text-5xl font-bold text-blue-600">{(answers[question.id] as number) || 0}%</span>
            </div>
          </div>
        );

      case QuestionType.SCENARIO:
        return (
          <div className="flex flex-col gap-3 md:gap-4 mt-6">
            {question.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.value)}
                className={`p-4 md:p-6 text-left rounded-xl border-2 transition-all group
                  ${answers[question.id] === opt.value
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-lg transform scale-[1.01]'
                    : 'border-slate-200 hover:border-blue-400 bg-white hover:shadow-md'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${answers[question.id] === opt.value ? 'border-blue-600 bg-white' : 'border-slate-300 group-hover:border-blue-400'}`}>
                    {answers[question.id] === opt.value && <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-600" />}
                  </div>
                  <span className={`text-sm md:text-lg font-medium leading-relaxed ${answers[question.id] === opt.value ? 'text-slate-900' : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full md:max-w-3xl mx-auto bg-white md:rounded-2xl md:shadow-xl min-h-[calc(100vh-80px)] md:min-h-[650px] flex flex-col relative overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed md:absolute top-[64px] md:top-0 left-0 w-full h-1 bg-slate-100 z-20">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Save Button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <Button variant="ghost" size="sm" onClick={handleSave} className="text-slate-400 hover:text-blue-600 gap-1 bg-white/50 backdrop-blur-sm">
            <Save size={16} />
            <span className="hidden sm:inline">Opslaan & Stoppen</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 md:px-10 py-8 md:pt-6">
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 md:gap-3">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-blue-200 truncate max-w-[150px]">
                {getCategoryLabel(currentQuestion.category)}
                </span>
                <span className="text-slate-400 text-xs md:text-sm font-medium whitespace-nowrap">
                {currentStep + 1} / {totalQuestions}
                </span>
             </div>
          </div>
          
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3 leading-tight">
            {currentQuestion.text}
          </h2>
          {currentQuestion.subText && (
            <p className="text-slate-500 text-sm md:text-lg leading-relaxed">
              {currentQuestion.subText}
            </p>
          )}
        </div>

        <div className="relative py-2 md:py-4 animate-fade-in-up flex-1" key={currentStep}>
            {renderInput(currentQuestion)}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-auto px-4 md:px-10 pb-6 pt-4 border-t border-slate-100 bg-white sticky bottom-0 z-30">
        <div className="flex justify-between items-center gap-4">
            <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === initialStep}
                className={`${currentStep === initialStep ? 'invisible' : 'visible'} text-slate-400 hover:text-slate-600 px-2 md:px-4`}
            >
                <ArrowLeft size={20} className="md:mr-2" />
                <span className="hidden md:inline">Vorige</span>
            </Button>

            <Button 
            size="lg"
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex-1 md:flex-none gap-2 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 justify-center"
            variant={isAnswered ? 'primary' : 'secondary'}
            >
            {currentStep === totalQuestions - 1 ? 'Rapport Genereren' : 'Volgende'}
            {currentStep === totalQuestions - 1 ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
            </Button>
        </div>
      </div>
    </div>
  );
};
