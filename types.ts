
export enum StrengthLevel {
  VERY_WEAK = 'חלשה מאוד',
  WEAK = 'חלשה',
  MEDIUM = 'בינונית',
  STRONG = 'חזקה',
  VERY_STRONG = 'חזקה מאוד'
}

export interface PasswordAnalysis {
  strength: StrengthLevel;
  entropy: number;
  timePC: string;
  timeCluster: string;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasHebrew: boolean;
  length: number;
}

export interface SecurityTips {
  advice: string;
  context: string;
}
