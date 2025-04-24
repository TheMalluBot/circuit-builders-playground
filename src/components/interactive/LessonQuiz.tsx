
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  title?: string;
  onComplete?: (score: number) => void;
}

const LessonQuiz: React.FC<LessonQuizProps> = ({
  questions,
  title = "Knowledge Check",
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const handleOptionSelect = (optionIndex: number) => {
    if (checked) return;
    setSelectedOption(optionIndex);
  };
  
  const checkAnswer = () => {
    if (selectedOption === null) {
      toast.error("Please select an answer before checking");
      return;
    }
    
    setChecked(true);
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
      setSelectedOption(null);
      setChecked(false);
    } else {
      // Quiz completed
      setCompleted(true);
      if (onComplete) {
        onComplete(score);
      }
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setChecked(false);
    setScore(0);
    setCompleted(false);
  };
  
  const isCorrect = (optionIndex: number) => {
    return checked && optionIndex === questions[currentQuestion].correctAnswer;
  };
  
  const isIncorrect = (optionIndex: number) => {
    return checked && selectedOption === optionIndex && optionIndex !== questions[currentQuestion].correctAnswer;
  };
  
  const question = questions[currentQuestion];
  const scorePercentage = Math.round((score / questions.length) * 100);
  
  if (completed) {
    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-medium">{title} - Results</h3>
        </div>
        
        <div className="p-6 text-center">
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
            scorePercentage >= 80 ? "bg-green-100" :
            scorePercentage >= 60 ? "bg-yellow-100" : "bg-red-100"
          )}>
            <span className={cn(
              "text-2xl font-bold",
              scorePercentage >= 80 ? "text-green-700" :
              scorePercentage >= 60 ? "text-yellow-700" : "text-red-700"
            )}>
              {scorePercentage}%
            </span>
          </div>
          
          <h4 className="text-lg font-medium mb-1">
            {scorePercentage >= 80 ? "Great job!" :
             scorePercentage >= 60 ? "Good effort!" : "Keep learning!"}
          </h4>
          
          <p className="text-muted-foreground mb-6">
            You scored {score} out of {questions.length} questions correctly.
          </p>
          
          <Button onClick={resetQuiz} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-lg font-medium mb-4">{question.question}</h4>
          
          <RadioGroup value={selectedOption?.toString()}>
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center space-x-2 border rounded p-3 mb-2",
                  selectedOption === idx ? "border-blue-400 bg-blue-50" : "",
                  isCorrect(idx) ? "border-green-400 bg-green-50" : "",
                  isIncorrect(idx) ? "border-red-400 bg-red-50" : ""
                )}
                onClick={() => handleOptionSelect(idx)}
              >
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={checked} />
                <Label 
                  htmlFor={`option-${idx}`} 
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
                
                {isCorrect(idx) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                
                {isIncorrect(idx) && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {checked && question.explanation && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mb-4 text-sm">
            <p className="font-medium mb-1">Explanation:</p>
            <p>{question.explanation}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground pt-2">
            Score: {score}/{currentQuestion + (checked ? 1 : 0)}
          </div>
          
          <div>
            {!checked ? (
              <Button onClick={checkAnswer}>
                Check Answer
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="gap-1">
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonQuiz;
