import { QuestionEvaluation, Question } from '../types';

export const evaluateInterviewResponses = async (
  apiKey: string,
  questions: Question[],
  userAnswers: Record<number, string>
): Promise<{ score: number; verdict: 'Requires Practice' | 'Good Performance' | 'Exemplary Mastery'; evaluations: QuestionEvaluation[] }> => {
  
  // If API key is provided, attempt live Gemini API call
  if (apiKey && apiKey.trim() !== '') {
    try {
      const prompt = `You are an expert technical interviewer. Evaluate the candidate's answers for the following questions:
${questions.map((q, idx) => `
Q${idx + 1}: ${q.title}
Candidate Answer: ${userAnswers[q.id] || '(No answer provided)'}
`).join('\n')}

Provide output strictly in JSON format:
{
  "score": <number 0-100>,
  "verdict": "<Requires Practice | Good Performance | Exemplary Mastery>",
  "evaluations": [
    {
      "questionId": <number>,
      "speechContentEval": "<Detailed evaluation of answer quality, conciseness, and clarity>",
      "recommendedAnswerStructure": "<Best structured answer>"
    }
  ]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              score: parsed.score || 0,
              verdict: parsed.verdict || 'Requires Practice',
              evaluations: questions.map((q, i) => {
                const item = parsed.evaluations?.[i] || {};
                const ans = userAnswers[q.id] || '(No answer provided)';
                return {
                  questionId: q.id,
                  questionTitle: q.title,
                  userAnswer: ans,
                  speechContentEval: item.speechContentEval || (ans === '(No answer provided)' ? 'You did not provide an answer. In a real interview, remaining silent is highly detrimental.' : 'Good attempt, but make sure to explain your thought process clearly.'),
                  recommendedAnswerStructure: item.recommendedAnswerStructure || q.idealStructure || 'Structure your response clearly with problem breakdown, approach, complexity analysis, and edge cases.'
                };
              })
            };
          }
        }
      }
    } catch (e) {
      console.warn('Gemini API call fallback to local evaluation engine:', e);
    }
  }

  // Smart Offline / Fallback AI Evaluation Engine
  let totalPoints = 0;
  const evaluations: QuestionEvaluation[] = questions.map((q) => {
    const answer = (userAnswers[q.id] || '').trim();

    if (!answer || answer === '(No answer provided)') {
      return {
        questionId: q.id,
        questionTitle: q.title,
        userAnswer: '(No answer provided)',
        speechContentEval: 'You did not provide an answer. In a real interview, remaining silent is highly detrimental. Even if unsure, try to explain your thought process or ask clarifying questions.',
        recommendedAnswerStructure: q.idealStructure || 'State your assumptions, break down the technical approach step-by-step, discuss complexity, and test edge cases.'
      };
    }

    // Basic heuristic scoring based on answer length and technical keywords
    const wordCount = answer.split(/\s+/).length;
    let points = Math.min(Math.floor(wordCount / 5) * 15, 85);
    
    if (answer.toLowerCase().includes('complexity') || answer.toLowerCase().includes('time') || answer.toLowerCase().includes('space') || answer.toLowerCase().includes('approach')) {
      points += 15;
    }
    points = Math.min(points, 100);
    totalPoints += points;

    return {
      questionId: q.id,
      questionTitle: q.title,
      userAnswer: answer,
      speechContentEval: points > 70 
        ? 'Solid response! You clearly structured your key points and articulated technical details effectively.'
        : 'Decent initial response, but expand more on algorithmic complexity, trade-offs, and alternative approaches.',
      recommendedAnswerStructure: q.idealStructure || 'Define core concepts, explain step-by-step implementation logic, state time/space complexity, and discuss edge cases.'
    };
  });

  const finalScore = questions.length > 0 ? Math.round(totalPoints / questions.length) : 0;
  let verdict: 'Requires Practice' | 'Good Performance' | 'Exemplary Mastery' = 'Requires Practice';
  if (finalScore >= 80) verdict = 'Exemplary Mastery';
  else if (finalScore >= 50) verdict = 'Good Performance';

  return {
    score: finalScore,
    verdict,
    evaluations
  };
};
