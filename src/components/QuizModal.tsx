// FILE: src/components/QuizModal.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from 'lucide-react';

export const QuizModal = ({ isOpen, onClose, quizData, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Effect to reset the quiz state whenever a new quiz is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setScore(0);
    }
  }, [isOpen]);

  if (!isOpen || !quizData || !quizData.questions) return null;

  const questions = quizData.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionText: string, answerKey: string) => {
    setUserAnswers(prev => ({ ...prev, [questionText]: answerKey }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((q: any) => {
      if (userAnswers[q.question_text] === q.correct_answer) {
        correctAnswers++;
      }
    });
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    // Send the score and quizId back to the parent component to be saved
    if (onSubmit) {
      onSubmit(quizData.quizId, finalScore);
    }
  };
  
  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Module Quiz</DialogTitle>
          {!showResults && <DialogDescription>Answer all questions to the best of your ability.</DialogDescription>}
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <Progress value={progressValue} />
              <p className="font-semibold text-lg pt-2">{currentQuestion.question_text}</p>
            </div>

            <RadioGroup
              onValueChange={(value) => handleAnswerSelect(currentQuestion.question_text, value)}
              value={userAnswers[currentQuestion.question_text] || ''}
              className="space-y-2"
            >
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:border-primary transition-all">
                  <RadioGroupItem value={key} id={`option-${key}`} />
                  <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">{String(value)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
             {score >= 80 ? <CheckCircle className="w-16 h-16 text-green-500 mx-auto" /> : <XCircle className="w-16 h-16 text-red-500 mx-auto" />}
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-muted-foreground">You scored</p>
            <p className="text-5xl font-bold">{score}%</p>
          </div>
        )}

        <DialogFooter>
          {!showResults ? (
            <>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={!userAnswers[currentQuestion.question_text]}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!userAnswers[currentQuestion.question_text]}>
                  Submit Answers
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};