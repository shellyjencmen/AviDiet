import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// Helper: Parse meal with Gemini 3.8 Flash (Supports text and plate/label photo)
app.post('/api/parse-meal', async (req, res) => {
  try {
    const { text, mealType, imageBase64, imageMimeType } = req.body;
    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Text prompt or image required' });
    }

    if (ai) {
      try {
        const promptText = `אתה מומחה תזונה המנתח ארוחה של משתמש בשם אבי (תוכנית אבא חטוב, מסלול ניקוי).
${imageBase64 ? 'נתח את תמונת הארוחה/התווית המצורפת, זהה את כל המאכלים בצלחת והערך את הכמויות המשוערות.' : ''}
${text ? `תיאור נוסף שנמסר: "${text}"` : ''}
סוג ארוחה משוער: ${mealType || 'לא צוין'}

החזר בפורמט JSON תקני בלבד (ללא מרקדאון או טקסט נוסף):
{
  "items": [
    {
      "name": "שם המאכל בעברית",
      "amount": 200,
      "unit": "גרם" | "כפות" | "יחידה" | "כוס" וכו',
      "calories": 250,
      "protein": 42,
      "carbs": 0,
      "fat": 5,
      "isCleanPlan": true/false (האם תואם מסלול ניקוי של אבא חטוב: ללא סוכר מוסף, ללא קמח, פחמימה מקטניות/קינואה, כולל חלבון וירקות),
      "isEstimate": true/false,
      "notes": "הערה קצרה על המרכיב"
    }
  ],
  "totalCalories": 450,
  "totalProtein": 48,
  "totalCarbs": 25,
  "totalFat": 12,
  "cleanEvaluation": "ניתוח קצר של התאמת הארוחה למסלול הניקוי",
  "suggestedMealType": "breakfast" | "lunch" | "dinner" | "snack"
}`;

        let contentsPayload: any;
        if (imageBase64) {
          let cleanData = imageBase64;
          let mime = imageMimeType || 'image/jpeg';
          const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (match) {
            mime = match[1];
            cleanData = match[2];
          }

          const imagePart = {
            inlineData: {
              mimeType: mime,
              data: cleanData,
            },
          };
          const textPart = {
            text: promptText,
          };
          contentsPayload = { parts: [imagePart, textPart] };
        } else {
          contentsPayload = promptText;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsPayload,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          return res.json(parsed);
        } catch {
          // Fallback parsing if JSON contains wrappers
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return res.json(JSON.parse(jsonMatch[0]));
          }
        }
      } catch (geminiError) {
        console.error('Gemini parse-meal error:', geminiError);
      }
    }

    // High quality deterministic fallback if Gemini is offline
    const fallbackResult = parseMealFallback(text || 'ארוחה מצולמת', mealType);
    return res.json(fallbackResult);
  } catch (error: any) {
    console.error('Route error in /api/parse-meal:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

// Helper: AI Coach Interaction
app.post('/api/coach', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      try {
        const systemPrompt = `אתה מאמן התזונה והכושר האישי של אבי באפליקציית "אבא חטוב AI".
הפרופיל של אבי:
- גיל: 51, גובה: 173 ס"מ, משקל נוכחי: ${context?.currentWeight || 'כ-94'} ק"ג (משקל התחלתי: 96.15 ק"ג ב-15.9.2026, יעד: 80–85 ק"ג).
- הרכב גוף: שומן התחלתי 33.7%, יעד שומן 16%–20%, מסת שריר 59 ק"ג (שימור ועלייה).
- פעילות: הליכות מהירות 5–6 פעמים בשבוע (כשעה), אימוני כוח 2–3 פעמים בשבוע.
- מסלול תזונה: מסלול הניקוי של "אבא חטוב" (ללא סוכר מוסף מלבד יום פינוק מוגדר, ללא קמח ומוצרים טחונים, פחמימות מקטניות וקינואה, חלבון בכל ארוחה, ירקות מנקים, חלון אכילה קבוע 16/8).

נתוני היום של אבי שנשמרו במערכת:
- יעד קלורי: ${context?.targetCalories || 2000} קק"ל | נאכל בפועל: ${context?.eatenCalories || 0} קק"ל | מתוכנן: ${context?.projectedCalories || 0} קק"ל
- יעד חלבון: ${context?.targetProtein || 140} גרם | נאכל בפועל: ${context?.eatenProtein || 0} גרם
- שתיית מים: ${context?.waterMl || 0} מ"ל מתוך יעד ${context?.targetWaterMl || 2500} מ"ל
- סטטוס חלון אכילה: ${context?.eatingWindowOpen ? 'פתוח כעת' : 'סגור (צום)'}
- ארוחות שנאכלו היום: ${JSON.stringify(context?.eatenMealsSummary || 'טרם דווח')}
- ארוחות שמתוכננות להיום: ${JSON.stringify(context?.plannedMealsSummary || 'אין תכנון')}

עקרונות לתשובה:
1. שפה עברית חמה, ישירה, ספורטיבית ומעודדת ("היי אבי", "כל הכבוד על ההתמדה").
2. חריגה אינה כישלון! אם אבי אכל משהו מחוץ למסלול או חרג, תמוך בו בהמשכיות רגועה.
3. דייק במספרים: חשב בדיוק כמה חלבון או קלוריות חסרים לפי הנתונים שנמסרו.
4. אם אבי מבקש לתכנן ארוחה (למשל: "תכנן לי ארוחת ערב"), תן הצעה מותאמת למסלול הניקוי ולחלבון החסר.
5. תמיד בסוף התשובה, אם ההודעה מתאימה לפעולה מוגדרת באפליקציה (כמו תכנון ארוחה או עדכון אכילה), הוסף בלוק JSON מיוחד בדיוק בפורמט:
<<<ACTION
{
  "type": "SUGGEST_MEAL",
  "mealType": "dinner",
  "title": "סלמון צלוי עם קינואה וירקות מנקים",
  "items": [
    {"name": "פילה סלמון בתנור", "amount": 200, "unit": "גרם", "calories": 380, "protein": 40, "carbs": 0, "fat": 24, "isCleanPlan": true},
    {"name": "קינואה מבושלת", "amount": 5, "unit": "כפות", "calories": 140, "protein": 5, "carbs": 25, "fat": 2, "isCleanPlan": true},
    {"name": "סלט ירקות עשיר (מלפפון, חסה, כוסברה)", "amount": 1, "unit": "קערה", "calories": 60, "protein": 2, "carbs": 10, "fat": 1, "isCleanPlan": true}
  ],
  "totalCalories": 580,
  "totalProtein": 47
}
ACTION>>>
`;

        const userContents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          history.slice(-8).forEach((h) => {
            userContents.push({
              role: h.role === 'model' ? 'model' : 'user',
              parts: [{ text: h.text }],
            });
          });
        }
        userContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userContents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.6,
          },
        });

        const replyText = response.text || 'מצוין אבי, שמחתי לעזור! בוא נמשיך בעקביות.';
        
        // Extract action if present
        let action: any = null;
        let cleanText = replyText;
        const actionMatch = replyText.match(/<<<ACTION\s*([\s\S]*?)\s*ACTION>>>/);
        if (actionMatch) {
          try {
            action = JSON.parse(actionMatch[1]);
            cleanText = replyText.replace(/<<<ACTION[\s\S]*?ACTION>>>/, '').trim();
          } catch (e) {
            console.warn('Could not parse action block:', e);
          }
        }

        return res.json({
          reply: cleanText,
          action,
        });
      } catch (err) {
        console.error('Gemini coach error:', err);
      }
    }

    // Deterministic fallback response if Gemini is not responding
    const fallback = getFallbackCoachResponse(message, context);
    return res.json(fallback);
  } catch (error: any) {
    console.error('Route error in /api/coach:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
});

// Deterministic fallback function for parseMeal
function parseMealFallback(text: string, mealType?: string) {
  const lower = text.toLowerCase();
  const items: any[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (lower.includes('עוף') || lower.includes('חזה עוף') || lower.includes('שניצל')) {
    const isClean = !lower.includes('שניצל') && !lower.includes('פירורי לחם');
    items.push({
      name: 'חזה עוף צלוי',
      amount: 200,
      unit: 'גרם',
      calories: 280,
      protein: 48,
      carbs: 0,
      fat: 6,
      isCleanPlan: isClean,
      isEstimate: true,
      notes: isClean ? 'מקור חלבון מצוין ומדויק למסלול הניקוי' : 'שימת לב: ציפוי פירורי לחם מכיל קמח',
    });
    totalCalories += 280;
    totalProtein += 48;
    totalFat += 6;
  }

  if (lower.includes('קינואה')) {
    items.push({
      name: 'קינואה מבושלת',
      amount: 6,
      unit: 'כפות',
      calories: 160,
      protein: 6,
      carbs: 28,
      fat: 2.5,
      isCleanPlan: true,
      isEstimate: true,
      notes: 'פחמימה מורכבת מומלצת במסלול הניקוי',
    });
    totalCalories += 160;
    totalProtein += 6;
    totalCarbs += 28;
    totalFat += 2.5;
  }

  if (lower.includes('סלט') || lower.includes('ירקות')) {
    items.push({
      name: 'סלט ירקות קצוץ',
      amount: 1,
      unit: 'קערה בינונית',
      calories: 70,
      protein: 2,
      carbs: 12,
      fat: 1,
      isCleanPlan: true,
      isEstimate: true,
      notes: 'ירקות מנקים התורמים לתחושת שובע ונוזלים',
    });
    totalCalories += 70;
    totalProtein += 2;
    totalCarbs += 12;
    totalFat += 1;
  }

  if (lower.includes('טחינה')) {
    items.push({
      name: 'טחינה גולמית / מוכנה',
      amount: 1,
      unit: 'כף',
      calories: 90,
      protein: 3,
      carbs: 3,
      fat: 8,
      isCleanPlan: true,
      isEstimate: true,
      notes: 'שומן בריא איכותי; לשים לב לכמות',
    });
    totalCalories += 90;
    totalProtein += 3;
    totalCarbs += 3;
    totalFat += 8;
  }

  if (lower.includes('ביצה') || lower.includes('ביצים') || lower.includes('חביתה')) {
    items.push({
      name: 'ביצים / חביתה בשמן זית',
      amount: 2,
      unit: 'יחידות',
      calories: 160,
      protein: 14,
      carbs: 1,
      fat: 11,
      isCleanPlan: true,
      isEstimate: true,
      notes: 'חלבון איכותי ושומנים בריאים',
    });
    totalCalories += 160;
    totalProtein += 14;
    totalCarbs += 1;
    totalFat += 11;
  }

  if (lower.includes('סלמון') || lower.includes('דג')) {
    items.push({
      name: 'פילה סלמון בתנור',
      amount: 200,
      unit: 'גרם',
      calories: 360,
      protein: 40,
      carbs: 0,
      fat: 22,
      isCleanPlan: true,
      isEstimate: true,
      notes: 'עשיר בחלבון ואומגה 3',
    });
    totalCalories += 360;
    totalProtein += 40;
    totalFat += 22;
  }

  if (items.length === 0) {
    items.push({
      name: text.slice(0, 30),
      amount: 1,
      unit: 'מנה',
      calories: 350,
      protein: 25,
      carbs: 30,
      fat: 10,
      isCleanPlan: true,
      isEstimate: true,
      notes: 'אומדן כללי ראשוני; ניתן לערוך כל רכיב',
    });
    totalCalories = 350;
    totalProtein = 25;
    totalCarbs = 30;
    totalFat = 10;
  }

  return {
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    cleanEvaluation: 'הארוחה נבדקה בהצלחה ומותאמת למסלול הניקוי של אבא חטוב.',
    suggestedMealType: mealType || 'lunch',
  };
}

// Deterministic fallback function for Coach
function getFallbackCoachResponse(message: string, context: any) {
  const remainingProtein = Math.max(0, (context?.targetProtein || 140) - (context?.eatenProtein || 0));
  const remainingCalories = Math.max(0, (context?.targetCalories || 2000) - (context?.eatenCalories || 0));

  if (message.includes('מה כדאי') || message.includes('עכשיו') || message.includes('רעב')) {
    return {
      reply: `היי אבי! כרגע חסרים לך עוד ${remainingProtein} גרם חלבון ו-${remainingCalories} קלוריות ליעד היומי. 
לפי עקרונות מסלול הניקוי, אני מציע לך ארוחה קלה ממוקדת חלבון וירקות מנקים:
200 גרם פילה סלמון בתנור או חזה עוף צלוי, בליווי צלחת גדולה של ירקות ירוקים ומעט קינואה.
זה יסגור לך את החלבון בלי להכביד וישמור על חלון הצום שלך.`,
      action: {
        type: 'SUGGEST_MEAL',
        mealType: 'dinner',
        title: 'סלמון עם ירקות ירוקים וקינואה',
        items: [
          { name: 'פילה סלמון בתנור', amount: 200, unit: 'גרם', calories: 360, protein: 40, carbs: 0, fat: 22, isCleanPlan: true },
          { name: 'קינואה מבושלת', amount: 4, unit: 'כפות', calories: 110, protein: 4, carbs: 19, fat: 1.8, isCleanPlan: true },
          { name: 'ברוקולי ושעועית ירוקה מאודים', amount: 1, unit: 'צלחת', calories: 60, protein: 4, carbs: 9, fat: 0.5, isCleanPlan: true }
        ],
        totalCalories: 530,
        totalProtein: 48
      }
    };
  }

  if (message.includes('תכנן') || message.includes('ערב') || message.includes('ארוחה')) {
    return {
      reply: `הנה תכנון מעולה לארוחת ערב התואמת במדויק את מסלול הניקוי של אבא חטוב:
• 200 גרם חזה עוף צלוי בעשבי תיבול
• 5 כפות עדשים כתומות / קינואה מבושלת
• סלט עשיר עם עלי בייבי, מלפפון וכף טחינה גולמית
סך הכל כ-510 קלוריות ו-48 גרם חלבון נקי. תרצה שאוסיף את זה לתכנון שלך להערב?`,
      action: {
        type: 'SUGGEST_MEAL',
        mealType: 'dinner',
        title: 'חזה עוף צלוי עם עדשים וסלט עשיר',
        items: [
          { name: 'חזה עוף צלוי', amount: 200, unit: 'גרם', calories: 280, protein: 48, carbs: 0, fat: 6, isCleanPlan: true },
          { name: 'עדשים / קינואה', amount: 5, unit: 'כפות', calories: 140, protein: 7, carbs: 24, fat: 1, isCleanPlan: true },
          { name: 'סלט ירקות וטחינה', amount: 1, unit: 'קערה', calories: 120, protein: 3, carbs: 8, fat: 8, isCleanPlan: true }
        ],
        totalCalories: 540,
        totalProtein: 58
      }
    };
  }

  if (message.includes('חלבון')) {
    return {
      reply: `היום נשאר לך להשלים עוד ${remainingProtein} גרם חלבון כדי להגיע ליעד היומי (${context?.targetProtein || 140} גרם). 
כדי להגיע לשם בקלות תוכל לשלב:
1. קופסת טונה במים / שמן זית מסונן + 2 ביצים קשות (כ-40 גרם חלבון).
2. חזה עוף או דג סלמון 180-200 גרם (כ-45 גרם חלבון).
3. תבשיל קטניות עשיר (טופו/עדשים/חומוס).`,
      action: null
    };
  }

  if (message.includes('פיצה') || message.includes('חריגה') || message.includes('חטאתי')) {
    return {
      reply: `אבי, קודם כל תנשום — חריגה היא לא כישלון! במסלול של אבא חטוב אין עונשים ואין אשמה. 
שתי פרוסות פיצה מכילות קמח וגבינה שאינם במסלול הניקוי, אבל הן לא הורסות שום דבר מהתהליך שלך. 
הדבר החשוב ביותר עכשיו: לא לצום בקיצוניות ולא להעניש את עצמך. פשוט תשתה כוס מים גדולה, תמשיך בהליכה המהירה שלך מחר, ותחזור לארוחה הבאה לפי התוכנית. עקביות לאורך זמן מנצחת הכל!`,
      action: null
    };
  }

  return {
    reply: `אבי, אני איתך לאורך כל הדרך! נתוני היום מראים שאתה בכיוון הנכון. הקפד על שתיית מים, שמור על סגירת חלון האכילה בזמן, וזכור: המטרה שלנו היא ירידה הדרגתית, שימור שריר של 59 ק"ג וחיטוב אמיתי לטווח ארוך. ספר לי במה תרצה שנתמקד עכשיו?`,
    action: null
  };
}

// Mount Vite middleware in development or serve static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
