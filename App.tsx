
import React, { useState, useEffect } from 'react';
import { analyzePassword } from './utils/calculations';
import { getSecurityExplanation } from './services/geminiService';
import { PasswordAnalysis, StrengthLevel, SecurityTips } from './types';

const StrengthBadge: React.FC<{ strength: StrengthLevel }> = ({ strength }) => {
  const colors: Record<StrengthLevel, string> = {
    [StrengthLevel.VERY_WEAK]: 'bg-red-100 text-red-700 border-red-200',
    [StrengthLevel.WEAK]: 'bg-orange-100 text-orange-700 border-orange-200',
    [StrengthLevel.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [StrengthLevel.STRONG]: 'bg-green-100 text-green-700 border-green-200',
    [StrengthLevel.VERY_STRONG]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`px-8 py-3 rounded-full text-2xl font-black border transition-colors duration-500 shadow-md ${colors[strength]}`}>
      {strength}
    </span>
  );
};

const MetricItem: React.FC<{ label: string; active: boolean; icon: string }> = ({ label, active, icon }) => (
  <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 text-gray-400 border-gray-100'} border`}>
    <span className="text-xl">{icon}</span>
    <span className="text-base font-bold">{label}</span>
    {active && (
      <svg className="w-5 h-5 mr-auto text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

const App: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [tips, setTips] = useState<SecurityTips | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    const result = analyzePassword(password);
    setAnalysis(password.length > 0 ? result : null);
    
    if (password.length > 3) {
      const timer = setTimeout(async () => {
        setLoadingTips(true);
        const aiResponse = await getSecurityExplanation(password, result.strength);
        setTips(aiResponse);
        setLoadingTips(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setTips(null);
    }
  }, [password]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white pt-12 pb-24 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">מעבדת הסייבר: חוזק סיסמאות</h1>
        <p className="text-indigo-100 text-2xl md:text-3xl max-w-5xl mx-auto font-light leading-relaxed">
          בואו נבדוק כמה זמן ייקח להאקרים לפרוץ את המבצר הדיגיטלי שלכם.
        </p>
      </header>

      <main className="max-w-[1500px] mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input & Crack Times Section */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white/20 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8">
                <label className="text-3xl font-bold text-slate-700 underline decoration-indigo-500 underline-offset-8">הזינו סיסמה לבדיקה:</label>
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-indigo-600 hover:text-indigo-800 text-xl font-black flex items-center gap-2 transition-colors bg-indigo-50 px-4 py-2 rounded-xl"
                >
                  {showPassword ? 'הסתר 🙈' : 'הצג 👁️'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="למשל: MyS3cureP@ss!"
                  className="w-full text-4xl md:text-5xl p-10 border-4 border-slate-100 rounded-[2.5rem] focus:border-indigo-500 focus:ring-8 focus:ring-indigo-100 transition-all outline-none bg-slate-50/50 font-mono tracking-widest text-center shadow-inner"
                />
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">
                  {password.length > 0 && <span>{password.length} תווים</span>}
                </div>
              </div>
              
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <MetricItem label="אותיות קטנות" active={analysis?.hasLowercase || false} icon="abc" />
                <MetricItem label="אותיות גדולות" active={analysis?.hasUppercase || false} icon="ABC" />
                <MetricItem label="מספרים" active={analysis?.hasNumbers || false} icon="123" />
                <MetricItem label="סימנים" active={analysis?.hasSymbols || false} icon="#?!" />
                <MetricItem label="עברית" active={analysis?.hasHebrew || false} icon="אבג" />
                <MetricItem label="אורך (12+)" active={(analysis?.length || 0) >= 12} icon="📏" />
              </div>
            </section>

            {analysis && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
                  <div className="w-28 h-28 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:bg-blue-100 transition-colors">
                    <span className="text-6xl">💻</span>
                  </div>
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-base mb-6">מחשב אישי סטנדרטי</h3>
                  <p className="text-5xl md:text-6xl font-black text-slate-800 leading-tight mb-6">{analysis.timePC}</p>
                  <div className="h-1.5 w-24 bg-blue-100 rounded-full mb-6"></div>
                  <p className="text-lg text-slate-500 font-bold max-w-[280px]">מחשב בודד המנחש כמיליארד סיסמאות בשנייה</p>
                </div>

                <div className="bg-indigo-50 p-12 rounded-[3rem] shadow-xl border border-indigo-100 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
                  <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:shadow-md transition-all shadow-sm">
                    <span className="text-6xl">🚀</span>
                  </div>
                  <h3 className="font-black text-indigo-400 uppercase tracking-widest text-base mb-6">קלאסטר של 200 שרתים</h3>
                  <p className="text-5xl md:text-6xl font-black text-indigo-700 leading-tight mb-6">{analysis.timeCluster}</p>
                  <div className="h-1.5 w-24 bg-indigo-200 rounded-full mb-6"></div>
                  <p className="text-lg text-indigo-500 font-bold max-w-[280px]">200 מחשבים חזקים שעובדים יחד במקביל לפצח אתכם</p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Security Rating Section with Larger Fonts */}
          <div className="space-y-8">
            <section className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <h3 className="text-4xl font-black mb-12 flex items-center gap-4">
                <span className="text-4xl">🛡️</span>
                דירוג אבטחה
              </h3>
              {analysis ? (
                <div className="space-y-12">
                   <div className="flex flex-col gap-6 items-center">
                    <span className="text-2xl text-indigo-200 font-bold">סטטוס נוכחי:</span>
                    <StrengthBadge strength={analysis.strength} />
                  </div>
                  <div className="space-y-6 pt-10 border-t border-indigo-800/50">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xl text-indigo-100 font-black uppercase tracking-wider">רמת האנטרופיה</span>
                        <span className="text-4xl font-black text-white">{Math.round(analysis.entropy)} <span className="text-lg text-indigo-300">bits</span></span>
                      </div>
                      <span className="text-lg text-indigo-300 font-medium italic">(מדד הקושי המדעי לניחוש הסיסמה)</span>
                    </div>
                    <div className="w-full bg-indigo-950 h-8 rounded-full p-2 border border-indigo-800 shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                        style={{ 
                          width: `${Math.min((analysis.entropy / 100) * 100, 100)}%`,
                          backgroundColor: analysis.strength === StrengthLevel.VERY_STRONG ? '#10b981' : 
                                          analysis.strength === StrengthLevel.STRONG ? '#34d399' :
                                          analysis.strength === StrengthLevel.MEDIUM ? '#fbbf24' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-indigo-300/60 py-16 text-center border-4 border-dashed border-indigo-700/50 rounded-[2.5rem] text-2xl font-bold">
                  הזינו סיסמה כדי להתחיל
                </div>
              )}
            </section>

            <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative">
              <h3 className="text-3xl font-black mb-10 flex items-center gap-4 text-indigo-600">
                <span className="p-4 bg-indigo-50 rounded-2xl">💡</span>
                טיפים מהמומחה
              </h3>
              {loadingTips ? (
                <div className="space-y-6">
                  <div className="h-8 bg-slate-100 rounded w-full animate-pulse"></div>
                  <div className="h-8 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                  <div className="h-8 bg-slate-100 rounded w-4/6 animate-pulse"></div>
                </div>
              ) : tips ? (
                <div className="space-y-12 text-2xl leading-relaxed text-slate-700">
                  <div className="bg-indigo-50/50 p-10 rounded-[2.5rem] border-r-[16px] border-indigo-500 italic relative shadow-sm">
                    <span className="absolute -top-8 -right-4 text-8xl opacity-10 text-indigo-900">"</span>
                    <p className="relative z-10 text-xl md:text-2xl font-bold text-slate-800">{tips.context}</p>
                  </div>
                  <div className="font-black text-slate-900 flex items-start gap-5 bg-white p-8 rounded-[2rem] shadow-lg border-2 border-indigo-50">
                    <span className="text-5xl text-indigo-500 mt-1">✨</span>
                    <span className="text-2xl md:text-3xl text-indigo-900 leading-tight">{tips.advice}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-2xl text-center italic py-16">הזינו לפחות 4 תווים לקבלת טיפים מותאמים אישית...</p>
              )}
            </section>
          </div>

        </div>

        {/* Info Section - Single Row Layout Always on Large Screens */}
        <section className="mt-20 bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100">
          <h2 className="text-5xl md:text-6xl font-black mb-20 text-center text-slate-800 underline decoration-indigo-200 underline-offset-[16px]">מדריך הסייבר המהיר</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="flex flex-col bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-3 group bg-white">
              <div className="text-7xl font-black text-indigo-100 group-hover:text-indigo-200 mb-8 select-none transition-colors">01</div>
              <h4 className="font-black text-indigo-700 text-2xl mb-6">למה סיסמה ארוכה?</h4>
              <p className="text-xl text-slate-600 leading-relaxed italic border-r-8 border-indigo-200 pr-6 font-bold">
                אורך הוא הכוח הכי גדול! כל תו נוסף הופך את מספר השילובים לעצום.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-3 group bg-white">
              <div className="text-7xl font-black text-indigo-100 group-hover:text-indigo-200 mb-8 select-none transition-colors">02</div>
              <h4 className="font-black text-indigo-700 text-2xl mb-6">מהי אנטרופיה?</h4>
              <p className="text-xl text-slate-600 leading-relaxed italic border-r-8 border-indigo-200 pr-6 font-bold">
                "מדד ההפתעה". ככל שיש יותר סוגי תווים, היא יותר קשה לניחוש ע"י מחשב.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-3 group bg-white">
              <div className="text-7xl font-black text-indigo-100 group-hover:text-indigo-200 mb-8 select-none transition-colors">03</div>
              <h4 className="font-black text-indigo-700 text-2xl mb-6">Brute Force?</h4>
              <p className="text-xl text-slate-600 leading-relaxed italic border-r-8 border-indigo-200 pr-6 font-bold">
                שיטת "ניסוי וטעייה" שבה המחשב מנסה את כל האפשרויות ברצף.
              </p>
            </div>

            {/* Step 4 - Improved Passphrase Advice */}
            <div className="flex flex-col bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-3 group bg-white">
              <div className="text-7xl font-black text-indigo-100 group-hover:text-indigo-200 mb-8 select-none transition-colors">04</div>
              <h4 className="font-black text-indigo-700 text-2xl mb-6">טיפ: Passphrase</h4>
              <p className="text-xl text-slate-600 leading-relaxed italic border-r-8 border-indigo-200 pr-6 font-bold">
                בחרו 4 מילים אקראיות ללא קשר ביניהן (למשל: מחשב-פיצה-חבר-שמים). שילוב כזה קל לזכור אך כמעט בלתי אפשרי לפיצוח!
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer className="mt-32 text-center text-slate-400 text-xl px-4 font-bold">
        <p>&copy; {new Date().getFullYear()} מעבדת הסייבר החינוכית - למטרות לימודיות בלבד</p>
        <p className="mt-5 text-base opacity-70 bg-white/70 inline-block px-8 py-3 rounded-full border-2 border-slate-200">שימו לב: אין להזין כאן סיסמאות אמיתיות שבהן אתם משתמשים בחשבונות שלכם!</p>
      </footer>
    </div>
  );
};

export default App;
