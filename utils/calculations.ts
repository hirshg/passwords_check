
import { StrengthLevel, PasswordAnalysis } from '../types';

const GUESSES_PER_SEC_PC = 10 ** 9; // 1 מיליארד ניחושים לשנייה
const GUESSES_PER_SEC_CLUSTER = 200 * (10 ** 9); // 200 מיליארד ניחושים לשנייה

export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0 שניות';
  if (seconds < 1) return 'פחות משנייה אחת';
  if (seconds < 60) return `${Math.floor(seconds)} שניות`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)} דקות`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)} שעות`;
  
  const days = hours / 24;
  if (days < 365) return `${Math.floor(days)} ימים`;
  
  const years = days / 365;
  if (years < 1000) return `${Math.floor(years)} שנים`;
  if (years < 1000000) return `${Math.floor(years / 1000)} אלף שנים`;
  if (years < 1000000000) return `${Math.floor(years / 1000000)} מיליון שנים`;
  
  return 'מיליארדי שנים (נצח)';
}

export function analyzePassword(password: string): PasswordAnalysis {
  let poolSize = 0;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9א-ת\s]/.test(password);
  const hasHebrew = /[א-ת]/.test(password);

  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33;
  if (hasHebrew) poolSize += 22;

  const length = password.length;
  // Entropy = length * log2(poolSize)
  const entropy = length > 0 && poolSize > 0 ? length * Math.log2(poolSize) : 0;
  const totalCombinations = poolSize > 0 ? Math.pow(poolSize, length) : 0;

  const secondsPC = length > 0 ? totalCombinations / GUESSES_PER_SEC_PC : 0;
  const secondsCluster = length > 0 ? totalCombinations / GUESSES_PER_SEC_CLUSTER : 0;

  let strength = StrengthLevel.VERY_WEAK;
  const typesCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols, hasHebrew].filter(Boolean).length;

  if (length >= 14 && typesCount >= 4) {
    strength = StrengthLevel.VERY_STRONG;
  } else if (length >= 12 && typesCount >= 3) {
    strength = StrengthLevel.STRONG;
  } else if (length >= 10 && typesCount >= 2) {
    strength = StrengthLevel.MEDIUM;
  } else if (length >= 8) {
    strength = StrengthLevel.WEAK;
  }

  return {
    strength,
    entropy,
    timePC: formatDuration(secondsPC),
    timeCluster: formatDuration(secondsCluster),
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSymbols,
    hasHebrew,
    length
  };
}
