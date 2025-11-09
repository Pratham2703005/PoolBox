import { RefObject, useMemo } from "react";
import { Clock, Target, TrendingUp } from "lucide-react";

type TypingTestPageProps = {
  accuracy: number;
  hasTimeLimit: boolean;
  timeRemaining: number;
  timeElapsed: number;
  wpm: number;
  currentText: string;
  userInput: string;
  setUserInput: (value: string) => void;
  progress: number;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  endTest: (completed: boolean) => void;
  getWPMColor: () => string;
  formatTime: (totalSeconds: number) => string;
};

const TypingTestPage = ({
  accuracy,
  hasTimeLimit,
  timeRemaining,
  timeElapsed,
  wpm,
  currentText,
  userInput,
  setUserInput,
  progress,
  inputRef,
  endTest,
  getWPMColor,
  formatTime,
}: TypingTestPageProps) => {
  // Calculate visible text window - show upcoming text based on current position
  const visibleText = useMemo(() => {
    const currentPosition = userInput.length;
    const windowSize = 200; // Characters to show
    const startPos = Math.max(0, currentPosition - 50); // Show some context before
    const endPos = Math.min(currentText.length, currentPosition + windowSize);

    return {
      before: currentText.slice(0, startPos),
      visible: currentText.slice(startPos, endPos),
      after: currentText.slice(endPos),
      startPos,
    };
  }, [currentText, userInput.length]);

  return (
    <div className="min-h-screen bg-gray-950 p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top stats bar */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2 sm:p-3 rounded-xl">
                <Target className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                  Accuracy
                </p>
                <p className="text-sm sm:text-xl md:text-2xl font-bold text-blue-400">
                  {accuracy.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 sm:p-3 rounded-xl">
                <Clock className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                  Time
                </p>
                <p className="text-sm sm:text-xl md:text-2xl font-bold text-purple-400">
                  {hasTimeLimit
                    ? formatTime(timeRemaining)
                    : formatTime(timeElapsed)}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2 sm:p-3 rounded-xl">
                <TrendingUp
                  className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                    getWPMColor().includes("blue")
                      ? "text-blue-400"
                      : getWPMColor().includes("green")
                      ? "text-green-400"
                      : getWPMColor().includes("yellow")
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                  WPM
                </p>
                <p
                  className={`text-sm sm:text-xl md:text-2xl font-bold ${
                    getWPMColor().includes("blue")
                      ? "text-blue-400"
                      : getWPMColor().includes("green")
                      ? "text-green-400"
                      : getWPMColor().includes("yellow")
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {wpm}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main typing area */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-4 sm:p-6 md:p-10 mb-3 sm:mb-4 md:mb-4">
          {/* Text display area with scrollable window */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-slate-900/50 rounded-2xl font-mono text-sm sm:text-base md:text-lg leading-relaxed max-h-[180px] sm:max-h-[220px] md:max-h-[250px] overflow-y-auto border border-slate-700/50">
            {/* Show ellipsis if there's text before the visible window */}
            {visibleText.startPos > 0 && (
              <span className="text-gray-600">...</span>
            )}

            {visibleText.visible.split("").map((char, idx) => {
              const actualIdx = visibleText.startPos + idx;
              let className = "text-gray-500";

              if (actualIdx < userInput.length) {
                className =
                  userInput[actualIdx] === char
                    ? "text-green-400"
                    : "text-red-400 bg-red-500/20 rounded px-0.5";
              } else if (actualIdx === userInput.length) {
                // Highlight current character
                className =
                  "text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded px-0.5 animate-pulse";
              }

              return (
                <span key={actualIdx} className={className}>
                  {char}
                </span>
              );
            })}

            {/* Show ellipsis if there's more text after the visible window */}
            {visibleText.after.length > 0 && (
              <span className="text-gray-600">...</span>
            )}
          </div>

          {/* Input area */}
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full p-3 sm:p-4 md:p-5 bg-slate-900/50 border-2 border-slate-700/50 rounded-2xl font-mono text-sm sm:text-base md:text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
            rows={4}
            placeholder="Start typing here..."
            autoFocus
          />
        </div>

        {/* Bottom stats bar */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="w-full sm:flex-1">
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider mb-2">
                Progress
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-blue-400 whitespace-nowrap min-w-[3rem] text-right">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
            <button
              onClick={() => endTest(false)}
              className="w-full sm:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm sm:text-base font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              End Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingTestPage;
