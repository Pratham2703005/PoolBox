# Typing Speed Test

A modern, feature-rich typing speed test application built with Next.js and TypeScript. Test your typing speed and accuracy with customizable settings and real-time feedback.

## Features

### 🎯 Flexible Test Configuration
- **Multiple Difficulty Levels**: Easy, Medium, and Hard
- **Customizable Text Length**: Short, Medium, and Long passages
- **Custom Text Support**: Upload your own text files for practice
- **Time-Based Challenges**: Set time limits and WPM goals

![Text Selection Page](../images/typetest/Screenshot%202025-11-09%20215518.png)
*Choose your difficulty level and text length*

![Custom Text Upload](../images/typetest/Screenshot%202025-11-09%20215538.png)
*Upload custom text files for personalized practice*

### ⏱️ Time Management
- **Flexible Time Limits**: Set custom time limits with minutes and seconds
- **Required WPM Goals**: Automatically calculated based on text length and time limit
- **Real-time Timer**: Countdown display during typing test

![Configuration Page](../images/typetest/Screenshot%202025-11-09%20215556.png)
*Configure time limits and see required WPM goals*

### ✍️ Smart Typing Interface
- **Real-time WPM Calculation**: See your typing speed as you type
- **Live Accuracy Tracking**: Monitor your accuracy percentage
- **Color-coded Feedback**: 
  - ✅ Green for correct characters
  - ❌ Red for incorrect characters
  - ⚪ Gray for upcoming text
- **Progress Bar**: Visual indication of test completion
- **Optimized Text Display**: Shows limited lines to prevent scrolling issues

![Typing Test in Progress](../images/typetest/Screenshot%202025-11-09%20215612.png)
*Real-time feedback while typing*

![Progress Tracking](../images/typetest/Screenshot%202025-11-09%20215640.png)
*Track your progress with live stats*

### 📊 Detailed Results
- **Final WPM**: Your words per minute at test completion
- **Final Accuracy**: Percentage of correctly typed characters
- **Time Taken**: Total time spent on the test
- **Pass/Fail Status**: Visual feedback on whether you met your goals
- **Retry Option**: Quick restart for another attempt

![Test Results - Success](../images/typetest/Screenshot%202025-11-09%20215707.png)
*Detailed results with pass/fail status*

![Test Results Overview](../images/typetest/Screenshot%202025-11-09%20215755.png)
*Comprehensive performance metrics*

## Technical Highlights

### Architecture
- **Component Modularity**: Separated into 4 distinct page components
  - `TextPage`: Text selection and difficulty settings
  - `ConfigPage`: Time limit and goal configuration
  - `TypingTestPage`: Main typing test interface
  - `ResultsPage`: Results display with performance metrics

### Performance Optimizations
- **Accurate WPM Calculation**: 3-second minimum threshold to prevent inflated values
- **Efficient Timer Management**: Uses refs to prevent unnecessary re-renders
- **Smart Timer Start**: Begins only when user types first character
- **Responsive Design**: Optimized for all screen sizes

### Data & Customization
- **Rich Sample Text Library**: 27+ pre-loaded paragraphs across different difficulties and lengths
- **File Upload Support**: Accept custom `.txt` files for personalized practice
- **Dark Theme**: Modern, eye-friendly interface

## How to Use

1. **Select Your Text**
   - Choose difficulty level (Easy/Medium/Hard)
   - Pick text length (Short/Medium/Long)
   - Or upload your own text file

2. **Configure Test Settings**
   - Set time limit (optional)
   - View required WPM goal
   - Proceed to start typing

3. **Take the Test**
   - Timer starts on your first keystroke
   - Type accurately to match the displayed text
   - Watch your WPM and accuracy in real-time

4. **Review Results**
   - See your final WPM and accuracy
   - Check if you passed the challenge
   - Retry to improve your score

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with dark theme
- **React Hooks**: Modern state management

## Responsive Design

The typing test is fully responsive and works seamlessly on:
- 💻 Desktop computers
- 📱 Tablets
- 📱 Mobile devices (landscape recommended)

![Responsive Interface](../images/typetest/Screenshot%202025-11-09%20215807.png)
*Clean, responsive interface across all devices*

---

**Start improving your typing speed today!** 🚀
