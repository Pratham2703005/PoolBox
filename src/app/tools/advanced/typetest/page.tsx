'use client';   
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import TextPage from '@/components/tools/type-test/TextPage';
import ConfigPage from '@/components/tools/type-test/ConfigPage';
import TypingTestPage from '@/components/tools/type-test/TypingTestPage';
import ResultsPage from '@/components/tools/type-test/ResultsPage';

const TypingSpeedGame = () => {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState('');
  const [length, setLength] = useState('');
  const [customText, setCustomText] = useState('');
  const [totalWords, setTotalWords] = useState(0);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [minutes, setMinutes] = useState('1');
  const [seconds, setSeconds] = useState('30');
  const [sampleTexts, setSampleTexts] = useState<Record<string, Record<string, string[]>>>({});
  
  // Load sample texts from JSON file
  useEffect(() => {
    fetch('/sampletext.json')
      .then(response => response.json())
      .then(data => setSampleTexts(data))
      .catch(error => console.error('Error loading sample texts:', error));
  }, []);
  
  // Calculate required WPM using useMemo to avoid effect
  const requiredWPM = useMemo(() => {
    if (hasTimeLimit && minutes !== '' && seconds !== '' && totalWords > 0) {
      const totalMinutes = parseInt(minutes || '0') + parseInt(seconds || '0') / 60;
      if (totalMinutes > 0) {
        return Math.ceil(totalWords / totalMinutes);
      }
    }
    return 0;
  }, [hasTimeLimit, minutes, seconds, totalWords]);
  
  // Game state
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [wpm, setWpm] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  // Results
  const [finalWPM, setFinalWPM] = useState<number>(0);
  const [finalAccuracy, setFinalAccuracy] = useState<number>(0);
  const [finalTime, setFinalTime] = useState<number>(0);
  const [testPassed, setTestPassed] = useState<boolean>(true);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to store latest values for endTest to avoid recreating the callback
  const latestValuesRef = useRef({
    wpm: 0,
    accuracy: 100,
    timeElapsed: 0,
    timeRemaining: 0,
    hasTimeLimit: false,
    minutes: '',
    seconds: '',
    requiredWPM: 0
  });
  
  // Update refs whenever values change
  useEffect(() => {
    latestValuesRef.current = {
      wpm,
      accuracy,
      timeElapsed,
      timeRemaining,
      hasTimeLimit,
      minutes,
      seconds,
      requiredWPM
    };
  }, [wpm, accuracy, timeElapsed, timeRemaining, hasTimeLimit, minutes, seconds, requiredWPM]);

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setCustomText(text);
          setDifficulty('');
          setLength('');
        }
      };
      reader.readAsText(file);
    }
  };

  const canProceedFromPage1 = () => {
    return (difficulty && length) || customText;
  };

  const handlePage1Next = () => {
    let text = customText;
    
    // If not using custom text, randomly select from the array
    if (!customText && sampleTexts[difficulty]?.[length]) {
      const textsArray = sampleTexts[difficulty][length];
      const randomIndex = Math.floor(Math.random() * textsArray.length);
      text = textsArray[randomIndex];
    }
    
    if (text) {
      setCurrentText(text);
      const words = countWords(text);
      setTotalWords(words);
      setPage(2);
    }
  };

  const endTest = useCallback((completed: boolean) => {
    if (isFinished) return;
    
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const { hasTimeLimit, minutes, seconds, timeRemaining, timeElapsed, wpm, accuracy, requiredWPM } = latestValuesRef.current;
    
    const finalTime = hasTimeLimit 
      ? ((parseInt(minutes || '0') * 60 + parseInt(seconds || '0')) - timeRemaining)
      : timeElapsed;
    
    setFinalTime(finalTime);
    setFinalWPM(wpm);
    setFinalAccuracy(accuracy);
    
    if (hasTimeLimit && requiredWPM > 0) {
      setTestPassed(completed && wpm >= requiredWPM);
    } else {
      setTestPassed(completed);
    }
    
    setPage(4);
  }, [isFinished]);

  const getWPMColor = () => {
    if (!hasTimeLimit || requiredWPM === 0) return 'text-blue-600';
    if (wpm >= requiredWPM + 5) return 'text-green-600';
    if (wpm >= requiredWPM - 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePage2Next = () => {
    setPage(3);
    // Don't start timer here - wait for first keystroke
    if (hasTimeLimit) {
      const totalSeconds = (parseInt(minutes || '0') * 60) + parseInt(seconds || '0');
      setTimeRemaining(totalSeconds);
    }
  };

  // Timer effect
  useEffect(() => {
    if (page === 3 && startTime && !isFinished) {
      timerRef.current = setInterval(() => {
        if (hasTimeLimit) {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              endTest(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [page, startTime, hasTimeLimit, isFinished, endTest]);

  // Calculate metrics in real-time as user types
  // Note: setState in this effect is intentional for real-time feedback during typing test
  /* eslint-disable */
  useEffect(() => {
    if (page === 3 && userInput.length > 0) {
      // Start timer on first keystroke
      if (!startTime) {
        setStartTime(Date.now());
      }
      
      // Calculate accuracy
      let correctChars = 0;
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === currentText[i]) {
          correctChars++;
        }
      }
      const acc = (correctChars / userInput.length) * 100;
      
      // Calculate WPM
      const timeInMinutes = hasTimeLimit 
        ? ((parseInt(minutes || '0') * 60 + parseInt(seconds || '0')) - timeRemaining) / 60
        : timeElapsed / 60;
      
      let calculatedWPM = 0;
      // Only calculate WPM if at least 3 seconds have passed to avoid inflated values
      const minTimeSeconds = hasTimeLimit ? 
        ((parseInt(minutes || '0') * 60 + parseInt(seconds || '0')) - timeRemaining) : 
        timeElapsed;
      
      if (minTimeSeconds >= 3 && timeInMinutes > 0) {
        const wordsTyped = userInput.trim().split(/\s+/).filter(w => w.length > 0).length;
        calculatedWPM = Math.round(wordsTyped / timeInMinutes);
      }

      // Calculate progress
      const prog = (userInput.length / currentText.length) * 100;

      // Update state with calculated metrics for real-time feedback
      setAccuracy(acc);
      setWpm(calculatedWPM);
      setProgress(prog);

      // Check if finished
      if (userInput.length >= currentText.length) {
        endTest(true);
      }
    }
  }, [userInput, page, timeElapsed, timeRemaining, currentText, endTest, hasTimeLimit, minutes, seconds]);
  /* eslint-enable */

  const resetGame = () => {
    setPage(1);
    setDifficulty('');
    setLength('');
    setCustomText('');
    setTotalWords(0);
    setHasTimeLimit(false);
    setMinutes('');
    setSeconds('');
    setUserInput('');
    setStartTime(null);
    setTimeElapsed(0);
    setTimeRemaining(0);
    setAccuracy(100);
    setWpm(0);
    setProgress(0);
    setIsFinished(false);
  };

  // Page 1: Setup
  if (page === 1) {
    return (
        <TextPage difficulty={difficulty} length={length} customText={customText} setDifficulty={setDifficulty} setLength={setLength} setCustomText={setCustomText} handleFileUpload={handleFileUpload} handlePage1Next={handlePage1Next} canProceedFromPage1={canProceedFromPage1} countWords={countWords} />
    );
  }

  // Page 2: Time limit setup
  if (page === 2) {
    return (
      <ConfigPage
        totalWords={totalWords}
        hasTimeLimit={hasTimeLimit}
        setHasTimeLimit={setHasTimeLimit}
        minutes={minutes}
        setMinutes={setMinutes}
        seconds={seconds}
        setSeconds={setSeconds}
        requiredWPM={requiredWPM}
        handlePage2Next={handlePage2Next}
      />
    );
  }

  // Page 3: Typing test
  if (page === 3) {
    return (
      <TypingTestPage
        accuracy={accuracy}
        hasTimeLimit={hasTimeLimit}
        timeRemaining={timeRemaining}
        timeElapsed={timeElapsed}
        wpm={wpm}
        currentText={currentText}
        userInput={userInput}
        setUserInput={setUserInput}
        progress={progress}
        inputRef={inputRef}
        endTest={endTest}
        getWPMColor={getWPMColor}
        formatTime={formatTime}
      />
    );
  }

  // Page 4: Results
  if (page === 4) {
    return (
      <ResultsPage
        testPassed={testPassed}
        finalWPM={finalWPM}
        finalAccuracy={finalAccuracy}
        finalTime={finalTime}
        totalWords={totalWords}
        hasTimeLimit={hasTimeLimit}
        requiredWPM={requiredWPM}
        resetGame={resetGame}
        formatTime={formatTime}
      />
    );
  }
};

export default TypingSpeedGame;