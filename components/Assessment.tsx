import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '../constants';
import { Question, QuestionType } from '../types';
import { Button } from './Button';
import { ArrowRight, CheckCircle2, ArrowLeft, Save } from 'lucide-react';

/**
 * Props for the Assessment component.
 * @interface AssessmentProps
 */
interface AssessmentProps {
  /**
   * Callback function to be called when the assessment is completed.
   * @param {Record<string, number | string>} answers - The answers to the assessment questions.
   */
  onComplete: (answers: Record<string, number | string>) => void;
  /**
   * Callback function to be called when the user saves and exits the assessment.
   */
  onSaveAndExit: () => void;
  /**
   * Initial answers for the assessment.
   * @type {Record<string, number | string>}
   * @optional
   */
  initialAnswers?: Record<string, number | string>;
  /**
   * Initial step for the assessment.
   * @type {number}
   * @optional
   */
  initialStep?: number;
  /**
   * The maximum number of questions to be asked in the assessment.
   * @type {number}
   * @optional
   */
  questionLimit?: number;
}

/**
 * A component that renders an assessment form.
 * @param {AssessmentProps} props - The props for the Assessment component.
 * @returns {JSX.Element | null} - The rendered Assessment component.
 */
export const Assessment: React.FC<AssessmentProps> = ({ 
  onComplete, 
  onSaveAndExit, 
  initialAnswers = {}, 
  initialStep = 0,
  questionLimit
}) => {
  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [answers, setAnswers] = useState<Record<string, number | string>>(initialAnswers);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- DERIVED STATE & CONSTANTS ---
  // Calculate effective total questions based on limit
  const totalQuestions = questionLimit ? Math.min(questionLimit, QUESTIONS.length) : QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentStep];

  // Safe check to prevent out of bounds if limit changed or url param is wrong
  useEffect(() => {
    if (currentStep >= totalQuestions && totalQuestions > 0) {
        onComplete(answers);
    }
  }, [currentStep, totalQuestions]);

  // If we skipped steps, we need to make sure progress bar reflects current view relative to available questions?
  // Actually, simpler is: Progress = (Step + 1) / Total
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  // --- LIFECYCLE HOOKS ---
  // Auto-focus text inputs
  useEffect(() => {
    if (currentQuestion?.type === QuestionType.TEXT && inputRef.current) {
      inputRef.current.focus();
    }
    // Scroll to top on step change
    window.scrollTo(0, 0);
  }, [currentStep, currentQuestion?.type]);

  if (!currentQuestion) return null;

  // --- EVENT HANDLERS ---
  /**
   * Updates the answer for the current question in the state.
   * @param value The new answer.
   */
  const handleAnswer = (value: number | string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  /**
   * Navigates to the next question or completes the assessment if it's the last question.
   */
  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Clear storage when finished to prevent resuming a completed session
      localStorage.removeItem('kai_assessment_progress');
      onComplete(answers);
    }
  };

  /**
   * Navigates to the previous question.
   */
  const handleBack = () => {
    if (currentStep > 0 && currentStep > (initialStep || 0)) {
      setCurrentStep(prev => prev - 1);
    }
  };

  /**
   * Saves the current assessment progress to local storage and exits.
   */
  const handleSave = () => {
    const progressData = {
      step: currentStep,
      answers: answers,
      date: new Date().toISOString()
    };
    localStorage.setItem('kai_assessment_progress', JSON.stringify(progressData));
    onSaveAndExit();
  };

  // --- HELPER FUNCTIONS ---
  /**
   * Returns the Dutch label for a given question category.
   * @param cat The category ID.
   * @returns The display label.
   */
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

  /**
   * Renders the appropriate input element based on the question type.
   * @param question The question to render an input for.
   * @returns The JSX element for the input.
   */
  const renderInput = (question: Question) => {
    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <div className="mt-4">
            <input
              ref={inputRef}
              type="text"
              className="w-full p-4 text-lg border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm"
              placeholder="Typ uw antwoord hier..."
              value={(answers[question.id] as string) || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && answers[question.id]) {
                    handleNext();
                }
              }}
            />
          </div>
        );

      case QuestionType.SELECT:
        return (
          <div className="mt-4 grid gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
             {question.options?.map((opt, idx) => (
               <button
                key={idx}
                onClick={() => {
                    handleAnswer(opt.value);
                }}
                className={`p-4 text-left rounded-lg border-2 transition-all flex items-center justify-between
                  ${answers[question.id] === opt.value 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium shadow-md' 
                    : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700 hover:shadow-sm'}`}
               >
                 <span>{opt.label}</span>
                 {answers[question.id] === opt.value && <CheckCircle2 size={20} className="text-blue-600" />}
               </button>
             ))}
          </div>
        );

      case QuestionType.SCALE:
        return (
          <div className="flex justify-between gap-2 mt-8 px-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleAnswer(num)}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center text-lg md:text-2xl font-medium transition-all duration-200
                  ${answers[question.id] === num 
                    ? 'border-blue-600 bg-blue-600 text-white scale-110 shadow-lg' 
                    : 'border-slate-200 hover:border-blue-400 text-slate-500 hover:bg-slate-50'}`}
              >
                {num}
              </button>
            ))}
            <div className="flex justify-between w-full absolute top-24 md:top-28 left-0 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Helemaal oneens</span>
              <span>Helemaal eens</span>
            </div>
          </div>
        );

      case QuestionType.SLIDER:
        return (
          <div className="mt-12 px-4">
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
                <div className="flex justify-between mt-4 text-slate-500 font-medium text-sm">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>
            <div className="text-center">
                <span className="text-4xl font-bold text-blue-600">{(answers[question.id] as number) || 0}%</span>
            </div>
          </div>
        );

      case QuestionType.SCENARIO:
        return (
          <div className="flex flex-col gap-4 mt-6">
            {question.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.value)}
                className={`p-6 text-left rounded-xl border-2 transition-all group
                  ${answers[question.id] === opt.value
                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-lg transform scale-[1.01]'
                    : 'border-slate-200 hover:border-blue-400 bg-white hover:shadow-md'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${answers[question.id] === opt.value ? 'border-blue-600 bg-white' : 'border-slate-300 group-hover:border-blue-400'}`}>
                    {answers[question.id] === opt.value && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                  </div>
                  <span className={`text-lg font-medium leading-relaxed ${answers[question.id] === opt.value ? 'text-slate-900' : 'text-slate-600'}`}>
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

  const isAnswered = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 min-h-[650px] flex flex-col relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Save Button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <Button variant="ghost" size="sm" onClick={handleSave} className="text-slate-400 hover:text-blue-600 gap-1">
            <Save size={16} />
            <span className="hidden sm:inline">Opslaan & Stoppen</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center pt-6">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                {getCategoryLabel(currentQuestion.category)}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                Vraag {currentStep + 1} / {totalQuestions}
                </span>
             </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 leading-tight">
            {currentQuestion.text}
          </h2>
          {currentQuestion.subText && (
            <p className="text-slate-500 text-lg leading-relaxed">
              {currentQuestion.subText}
            </p>
          )}
        </div>

        <div className="relative py-4 animate-fade-in-up" key={currentStep}>
            {renderInput(currentQuestion)}
        </div>
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
        <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === initialStep}
            className={`${currentStep === initialStep ? 'invisible' : 'visible'} text-slate-400 hover:text-slate-600`}
        >
            <ArrowLeft size={20} className="mr-2" />
            Vorige
        </Button>

        <Button 
          size="lg"
          onClick={handleNext}
          disabled={!isAnswered}
          className="gap-2 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
          variant={isAnswered ? 'primary' : 'secondary'}
        >
          {currentStep === totalQuestions - 1 ? 'Rapport Genereren' : 'Volgende'}
          {currentStep === totalQuestions - 1 ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
        </Button>
      </div>
    </div>
  );
};