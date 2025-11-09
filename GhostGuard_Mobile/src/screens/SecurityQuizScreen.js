import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What makes a strong password?",
    options: [
      "Your birthday and name",
      "At least 12 characters with mix of letters, numbers, and symbols",
      "The word 'password123'",
      "Your pet's name"
    ],
    correct: 1,
    explanation: "Strong passwords should be at least 12 characters long and include uppercase, lowercase, numbers, and special characters. Avoid personal information!"
  },
  {
    id: 2,
    question: "What is phishing?",
    options: [
      "A type of fishing sport",
      "A computer virus",
      "Fraudulent attempts to obtain sensitive information by disguising as trustworthy",
      "A programming language"
    ],
    correct: 2,
    explanation: "Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive data like passwords and credit card numbers."
  },
  {
    id: 3,
    question: "What is two-factor authentication (2FA)?",
    options: [
      "Using two passwords",
      "An extra layer of security requiring a second verification method",
      "Having two email accounts",
      "A type of firewall"
    ],
    correct: 1,
    explanation: "2FA adds an extra security layer by requiring a second form of verification (like a code sent to your phone) in addition to your password."
  },
  {
    id: 4,
    question: "Is it safe to use public Wi-Fi for banking?",
    options: [
      "Yes, always safe",
      "Only during daytime",
      "No, public Wi-Fi can be insecure and monitored",
      "Yes, if the network has a password"
    ],
    correct: 2,
    explanation: "Public Wi-Fi networks are often unsecured and can be monitored by attackers. Avoid accessing sensitive accounts on public networks or use a VPN."
  },
  {
    id: 5,
    question: "What should you do if you receive a suspicious email asking for your password?",
    options: [
      "Reply with your password",
      "Click the link to verify",
      "Delete it and report as phishing",
      "Forward it to friends"
    ],
    correct: 2,
    explanation: "Legitimate companies never ask for passwords via email. Always delete suspicious emails and report them as phishing attempts."
  },
  {
    id: 6,
    question: "How often should you update your software?",
    options: [
      "Never, it's fine as is",
      "Once a year",
      "As soon as updates are available",
      "Only when it stops working"
    ],
    correct: 2,
    explanation: "Software updates often include security patches. Install updates promptly to protect against newly discovered vulnerabilities."
  },
  {
    id: 7,
    question: "What is malware?",
    options: [
      "A type of hardware",
      "Malicious software designed to harm or exploit devices",
      "A programming error",
      "An email service"
    ],
    correct: 1,
    explanation: "Malware is malicious software including viruses, trojans, ransomware, and spyware designed to damage systems or steal information."
  },
  {
    id: 8,
    question: "Should you share your passwords with friends?",
    options: [
      "Yes, with close friends only",
      "Yes, if they promise not to tell",
      "No, never share passwords with anyone",
      "Only family members"
    ],
    correct: 2,
    explanation: "Never share passwords with anyone. Each person should have their own credentials. Sharing passwords compromises security."
  },
  {
    id: 9,
    question: "What is a VPN?",
    options: [
      "A type of virus",
      "Virtual Private Network that encrypts your internet connection",
      "A social media platform",
      "A password manager"
    ],
    correct: 1,
    explanation: "A VPN (Virtual Private Network) creates an encrypted tunnel for your internet traffic, protecting your privacy and security online."
  },
  {
    id: 10,
    question: "How can you identify a secure website?",
    options: [
      "It has lots of ads",
      "The URL starts with 'https://' and shows a padlock icon",
      "It has colorful design",
      "It loads quickly"
    ],
    correct: 1,
    explanation: "Secure websites use HTTPS (the 'S' stands for Secure) and display a padlock icon in the address bar, indicating encrypted communication."
  }
];

export default function SecurityQuizScreen({ navigation }) {
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleStart = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setFinished(false);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === QUIZ_QUESTIONS[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / QUIZ_QUESTIONS.length) * 100;
    if (percentage >= 90) return { text: "🏆 Security Expert!", color: '#22c55e' };
    if (percentage >= 70) return { text: "🎖️ Security Pro!", color: '#3b82f6' };
    if (percentage >= 50) return { text: "📚 Keep Learning!", color: '#f59e0b' };
    return { text: "💪 Practice More!", color: '#ef4444' };
  };

  if (!started) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.welcomeContainer}>
          <Text style={styles.welcomeIcon}>🧠</Text>
          <Text style={styles.welcomeTitle}>Security Quiz</Text>
          <Text style={styles.welcomeSubtitle}>
            Test your cybersecurity knowledge and learn how to stay safe online!
          </Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>❓</Text>
              <Text style={styles.infoText}>10 Questions</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoText}>~5 Minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🎓</Text>
              <Text style={styles.infoText}>Learn & Earn Badge</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>▶️ Start Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (finished) {
    const scoreMsg = getScoreMessage();
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <Text style={styles.resultsIcon}>🎉</Text>
          <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          
          <View style={styles.scoreCard}>
            <Text style={[styles.scoreNumber, { color: scoreMsg.color }]}>
              {score}/{QUIZ_QUESTIONS.length}
            </Text>
            <Text style={styles.scoreLabel}>Correct Answers</Text>
            <Text style={[styles.scoreMessage, { color: scoreMsg.color }]}>
              {scoreMsg.text}
            </Text>
          </View>

          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>
              {score >= 9 ? '🏆' : score >= 7 ? '🥈' : score >= 5 ? '🥉' : '📚'}
            </Text>
            <Text style={styles.badgeText}>
              {score >= 9 ? 'Master Badge' : score >= 7 ? 'Expert Badge' : score >= 5 ? 'Learner Badge' : 'Beginner Badge'}
            </Text>
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={handleStart}>
            <Text style={styles.playAgainText}>🔄 Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
      </View>

      <ScrollView style={styles.quizContainer}>
        <Text style={[styles.questionNumber, { color: theme.textSecondary }]}>
          Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
        </Text>
        
        <Text style={[styles.questionText, { color: theme.text }]}>
          {question.question}
        </Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            let optionStyle = [styles.option, { backgroundColor: theme.surface, borderColor: theme.border }];
            let optionTextStyle = [styles.optionText, { color: theme.text }];
            
            if (selectedAnswer !== null) {
              if (index === question.correct) {
                optionStyle.push(styles.correctOption);
                optionTextStyle.push(styles.correctText);
              } else if (index === selectedAnswer && index !== question.correct) {
                optionStyle.push(styles.wrongOption);
                optionTextStyle.push(styles.wrongText);
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={optionTextStyle}>{option}</Text>
                {selectedAnswer !== null && index === question.correct && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {selectedAnswer === index && index !== question.correct && (
                  <Text style={styles.cross}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <View style={[styles.explanationCard, { 
            backgroundColor: selectedAnswer === question.correct ? '#d1fae5' : '#fee2e2',
            borderColor: selectedAnswer === question.correct ? '#22c55e' : '#ef4444'
          }]}>
            <Text style={[styles.explanationTitle, { 
              color: selectedAnswer === question.correct ? '#065f46' : '#991b1b'
            }]}>
              {selectedAnswer === question.correct ? '✓ Correct!' : '✗ Incorrect'}
            </Text>
            <Text style={[styles.explanationText, { 
              color: selectedAnswer === question.correct ? '#047857' : '#7f1d1d'
            }]}>
              {question.explanation}
            </Text>
          </View>
        )}

        {showExplanation && (
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results 🎉'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  welcomeIcon: { fontSize: 80, marginBottom: 20 },
  welcomeTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  welcomeSubtitle: { fontSize: 16, color: '#ffffff', textAlign: 'center', marginBottom: 32, opacity: 0.9 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 24, width: '100%', marginBottom: 32 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoText: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  startButton: { backgroundColor: '#22c55e', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 48 },
  startButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', width: '100%' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6' },
  quizContainer: { flex: 1, padding: 20 },
  questionNumber: { fontSize: 14, marginBottom: 12 },
  questionText: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, lineHeight: 30 },
  optionsContainer: { marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', color: '#ffffff', textAlign: 'center', lineHeight: 32, fontWeight: 'bold', marginRight: 12 },
  optionText: { flex: 1, fontSize: 16 },
  correctOption: { backgroundColor: '#d1fae5', borderColor: '#22c55e' },
  wrongOption: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  correctText: { color: '#065f46' },
  wrongText: { color: '#991b1b' },
  checkmark: { fontSize: 24, color: '#22c55e', fontWeight: 'bold' },
  cross: { fontSize: 24, color: '#ef4444', fontWeight: 'bold' },
  explanationCard: { borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 2 },
  explanationTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  explanationText: { fontSize: 14, lineHeight: 20 },
  nextButton: { borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 20 },
  nextButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultsIcon: { fontSize: 80, marginBottom: 20 },
  resultsTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 32 },
  scoreCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 32, width: '100%', alignItems: 'center', marginBottom: 24 },
  scoreNumber: { fontSize: 64, fontWeight: 'bold' },
  scoreLabel: { fontSize: 16, color: '#ffffff', marginTop: 8, marginBottom: 16 },
  scoreMessage: { fontSize: 24, fontWeight: 'bold' },
  badgeCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 32 },
  badgeIcon: { fontSize: 64, marginBottom: 12 },
  badgeText: { fontSize: 18, color: '#ffffff', fontWeight: 'bold' },
  playAgainButton: { backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, marginBottom: 12, width: '100%' },
  playAgainText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  homeButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, width: '100%' },
  homeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});
