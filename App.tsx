
import React, { useState, useEffect, useCallback } from 'react';
import { analyzePassword } from './utils/calculations';
import { getSecurityExplanation } from './services/geminiService';
import { PasswordAnalysis, StrengthLevel, SecurityTips } from './types';

// Components
const StrengthBadge: React.FC<{ strength: StrengthLevel }> = ({ strength }) => {
  const colors: Record<StrengthLevel, string> = {
    [StrengthLevel.VERY_WEAK]: 'bg-red-100 text-red-700 border-red-200',
    [StrengthLevel.WEAK]: 'bg-orange-100 text-orange-700 border-orange-200',
    [StrengthLevel.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [StrengthLevel.STRONG]: 'bg-green-100 text-green-700 border-green-200',
    [StrengthLevel.VERY_STRONG]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${colors[strength]}`}>
      {strength}
    </span>
  );
};

const MetricItem: React.FC<{ label: string; active: boolean; icon: string }> = ({ label, active, icon }) => (
  <div className={`flex items-center gap-2 p-3 rounded-xl transition-all ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 text-gray-400 border-gray-100'} border`}>
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-semibold">{label}</span>
    {active && (
      <svg className="w-5 h-5 ml-auto text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

const App: React.FC = () => {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [tips, setTips] = useState<SecurityTips | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    const result = analyzePassword(password);
    setAnalysis(password.length > 0 ? result : null);
    
    if (password.length > 0) {
      const timer = setTimeout(async () => {
        setLoadingTips(true);
        const aiResponse = await getSecurityExplanation(password, result.strength);
        setTips(aiResponse);
        setLoadingTips(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setTips(null);
    }
  }, [password]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white pt-10 pb-20 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-2">מעבדת הסייבר: חוזק סיסמאות</h1>
        <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
          גלו כמה זמן ייקח למחשב על לפרוץ את הסיסמה שלכם ואיך להפוך אותה למבצר דיגיטלי.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-50">
              <label className="block text-lg font-bold mb-4 text-slate-700">הזינו סיסמה לבדיקה:</label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="למשל: Pa$$w0rd123..."
                  className="w-full text-2xl p-5 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none bg-slate-50 font-mono tracking-wider"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {password.length > 0 && <span>{password.length} תווים</span>}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricItem label="אותיות קטנות" active={analysis?.hasLowercase || false} icon="abc" />
                <MetricItem label="אותיות גדולות" active={analysis?.hasUppercase || false} icon="ABC" />
                <MetricItem label="מספרים" active={analysis?.hasNumbers || false} icon="123" />
                <MetricItem label="סימנים" active={analysis?.hasSymbols || false} icon="#?!" />
                <MetricItem label="עברית" active={analysis?.hasHebrew || false} icon="אבג" />
                <MetricItem label="אורך (12+)" active={(analysis?.length || 0) >= 12} icon="📏" />
              </div>
            </section>

            {analysis && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-3xl">💻</span>
                  </div>
                  <h3 className="font-bold text-slate-500 mb-1">מחשב אישי ממוצע</h3>
                  <p className="text-2xl font-black text-slate-800">{analysis.timePC}</p>
                  <p className="text-xs text-slate-400 mt-2">מחשב בודד המבצע כמיליארד ניחושים בשנייה</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="font-bold text-slate-500 mb-1">קלאסטר (200 שרתים)</h3>
                  <p className="text-2xl font-black text-indigo-700">{analysis.timeCluster}</p>
                  <p className="text-xs text-slate-400 mt-2">רשת שרתים חזקה המבצעת מאות מיליארדי ניחושים</p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / AI Tips */}
          <div className="space-y-6">
            <section className="bg-indigo-900 text-white p-6 rounded-3xl shadow-2xl overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-700 rounded-full blur-3xl opacity-50"></div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🛡️</span>
                ציון בטיחות
              </h3>
              {analysis ? (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-indigo-300">חוזק כללי:</span>
                    <StrengthBadge strength={analysis.strength} />
                  </div>
                  <div className="w-full bg-indigo-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-400 transition-all duration-700"
                      style={{ 
                        width: `${Math.min((analysis.entropy / 128) * 100, 100)}%`,
                        backgroundColor: analysis.strength === StrengthLevel.VERY_STRONG ? '#10b981' : 
                                        analysis.strength === StrengthLevel.STRONG ? '#34d399' :
                                        analysis.strength === StrengthLevel.MEDIUM ? '#facc15' : '#f87171'
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-indigo-300 text-sm">הזינו סיסמה כדי לקבל ניתוח</p>
              )}
            </section>

            <section className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600">
                <span>💡</span>
                טיפים מהמומחה (AI)
              </h3>
              {loadingTips ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              ) : tips ? (
                <div className="space-y-4 text-sm leading-relaxed text-slate-600">
                  <div className="bg-blue-50 p-4 rounded-2xl border-r-4 border-blue-500 italic">
                    {tips.context}
                  </div>
                  <div className="font-bold text-slate-800">
                    העצה שלי: {tips.advice}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">ממתין לסיסמה...</p>
              )}
            </section>
          </div>

        </div>

        {/* Educational Footer Section */}
        <section className="mt-12 bg-white p-8 rounded-3xl shadow-md border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 underline decoration-indigo-200 underline-offset-8">איך זה עובד? שיעור קצר בסייבר</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-600">1. מרחב האפשרויות</h4>
              <p className="text-sm text-slate-600">ככל שיש יותר סוגי תווים (א-ב, A-Z, 0-9), כך לפורץ יש הרבה יותר שילובים לנסות. הוספת תו אחד בלבד יכולה להכפיל את הזמן הנדרש פי 60!</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-600">2. פריצה בכוח גס (Brute Force)</h4>
              <p className="text-sm text-slate-600">זו שיטה שבה מחשב מנסה את כל השילובים האפשריים אחד אחרי השני. מחשבים מודרניים מהירים מאוד, ולכן סיסמאות קצרות נפרצות בשבריר שנייה.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-600">3. כוחו של ה-Cluster</h4>
              <p className="text-sm text-slate-600">האקרים לא משתמשים רק במחשב אחד. הם מחברים עשרות ומאות מחשבים יחד (כמו ה-Cluster של 200 השרתים שלנו) כדי לעבוד במקביל, מה שמקצר את זמן הפריצה משנים לדקות.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} מעבדת הסייבר החינוכית - פותח עבור תלמידי ישראל
      </footer>
    </div>
  );
};

export default App;
