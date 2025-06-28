import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface CaptchaModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const CaptchaModal: React.FC<CaptchaModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [question, setQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate new math question
  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
    }

    setQuestion({ num1, num2: operation === '-' ? num2 : num2, answer });
    return { num1, num2, operation, answer };
  };

  // Initialize question when modal opens
  useEffect(() => {
    if (isOpen) {
      generateQuestion();
      setUserAnswer('');
      setIsCorrect(null);
      setAttempts(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    const userNum = parseInt(userAnswer);
    if (userNum === question.answer) {
      setIsCorrect(true);
      setTimeout(() => {
        onSuccess();
        setIsSubmitting(false);
      }, 1000);
    } else {
      setIsCorrect(false);
      setAttempts(prev => prev + 1);
      
      if (attempts >= 2) {
        // Too many failed attempts, close modal
        setTimeout(() => {
          onClose();
          setIsSubmitting(false);
        }, 1500);
      } else {
        // Generate new question after failed attempt
        setTimeout(() => {
          generateQuestion();
          setUserAnswer('');
          setIsCorrect(null);
          setIsSubmitting(false);
        }, 1500);
      }
    }
  };

  const handleRefresh = () => {
    generateQuestion();
    setUserAnswer('');
    setIsCorrect(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Security Check</h2>
          </div>
          <p className="text-slate-300 text-sm">
            Complete this captcha to continue clicking and prevent bot activity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Solve this math problem:</h3>
              <button
                type="button"
                onClick={handleRefresh}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                disabled={isSubmitting}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-4">
                {question.num1} + {question.num2} = ?
              </div>
              
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your answer"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
          </div>

          {isCorrect !== null && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isCorrect 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Correct! Continuing...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>
                    {attempts >= 2 
                      ? 'Too many failed attempts. Please reconnect your wallet.' 
                      : 'Incorrect. Try again with the new question.'
                    }
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!userAnswer || isSubmitting || isCorrect === true}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </div>
              ) : (
                'Verify'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-xs">
              Attempts: {attempts}/3 • This helps prevent automated clicking
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};