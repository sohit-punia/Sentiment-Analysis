import React, { useState, useMemo } from "react";

// Single-file React component for a kid-friendly Sentiment Analysis web app
// Uses Tailwind CSS for styling (assumes Tailwind is configured in the host project)
// Export default component so it can be previewed in the canvas.

export default function App() {
  // --- Sample data & simple lexicons ---
  const positiveWords = useMemo(
    () => [
      "good",
      "great",
      "awesome",
      "happy",
      "love",
      "fun",
      "cool",
      "nice",
      "enjoy",
      "amazing",
    ],
    []
  );
  const negativeWords = useMemo(
    () => [
      "bad",
      "sad",
      "angry",
      "hate",
      "boring",
      "terrible",
      "upset",
      "worst",
      "scary",
      "no",
    ],
    []
  );

  // A tiny training set used to create a VERY small "mini-model" by scoring words.
  // This is not a real ML model — it's an educational in-browser approximation.
  const trainingData = useMemo(
    () => [
      { text: "I love this game, it's so fun and awesome", label: 1 },
      { text: "This is the worst, I hate it", label: -1 },
      { text: "It was nice and cool", label: 1 },
      { text: "I am sad and upset about it", label: -1 },
      { text: "What an amazing day, I enjoy it", label: 1 },
      { text: "Terrible event, very bad", label: -1 },
    ],
    []
  );

  // Build word score map from tiny training dataset
  const wordScores = useMemo(() => {
    const counts = {};
    trainingData.forEach(({ text, label }) => {
      const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
      words.forEach((w) => {
        if (!counts[w]) counts[w] = { score: 0, times: 0 };
        counts[w].score += label;
        counts[w].times += 1;
      });
    });
    // average
    const avg = {};
    Object.keys(counts).forEach((w) => {
      avg[w] = counts[w].score / counts[w].times;
    });
    return avg; // values typically in [-1, 1]
  }, [trainingData]);

  // --- state ---
  const [input, setInput] = useState("My cat is very cute and I love it");
  const [approach, setApproach] = useState("keywords"); // 'keywords' or 'mini-model'
  const [explanationOpen, setExplanationOpen] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState(null);

  // helper: normalize words
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
  }

  // Keyword-based simple sentiment
  function analyzeWithKeywords(text) {
    const words = tokenize(text);
    const matchedPos = words.filter((w) => positiveWords.includes(w));
    const matchedNeg = words.filter((w) => negativeWords.includes(w));
    const score = matchedPos.length - matchedNeg.length; // simple
    const rawConfidence = Math.min(1, Math.abs(score) / Math.max(1, words.length / 3));
    const sentiment = score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral";
    return {
      approach: "Keyword Match",
      sentiment,
      score,
      confidence: Math.round(rawConfidence * 100),
      matchedPos,
      matchedNeg,
    };
  }

  // Mini-model scoring using wordScores created from trainingData
  function analyzeWithMiniModel(text) {
    const words = tokenize(text);
    let total = 0;
    let count = 0;
    const contributing = [];
    words.forEach((w) => {
      if (wordScores[w] !== undefined) {
        total += wordScores[w];
        count += 1;
        contributing.push({ word: w, score: wordScores[w] });
      }
    });
    const avg = count ? total / count : 0;
    const sentiment = avg > 0.15 ? "Positive" : avg < -0.15 ? "Negative" : "Neutral";
    const confidence = Math.round(Math.min(1, Math.abs(avg) / 1) * 100);
    return {
      approach: "Mini " + "Model (word-weights)",
      sentiment,
      score: Number(avg.toFixed(2)),
      confidence,
      contributing,
    };
  }

  const result = useMemo(() => {
    if (!input || !input.trim())
      return {
        approach: "none",
        sentiment: "Neutral",
        score: 0,
        confidence: 0,
      };
    if (approach === "keywords") return analyzeWithKeywords(input);
    return analyzeWithMiniModel(input);
  }, [input, approach]);

  // Helper for color
  function sentimentColor(sent) {
    if (sent === "Positive") return "bg-green-200 text-green-800";
    if (sent === "Negative") return "bg-red-200 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  }

  // Sample sentences to try
  const samples = [
    "I had an amazing day at the park!",
    "This homework is boring and I hate it.",
    "The movie was okay, not too bad.",
    "I am so happy about my exam result!",
    "I feel sad and upset today.",
  ];

  // Quiz question
  const quiz = {
    q: "What does a 'positive' sentence usually show?",
    options: [
      "It shows happy or good feelings",
      "It shows angry or bad feelings",
      "It shows nothing (neutral)",
    ],
    correct: 0,
    explain: "Positive sentences have words that show happiness, liking, or good feelings (e.g., love, fun, amazing).",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="p-6 flex items-center gap-4">
          <div className="rounded-full w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">SA</div>
          <div>
            <h1 className="text-2xl font-extrabold">Sentiment Adventure: Learn Feelings with Asha & Robo</h1>
            <p className="text-sm text-slate-600">Interactive guide to understand how computers read feelings in text — made for 6th graders.</p>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Story section */}
          <section className="bg-gradient-to-r from-indigo-50 to-pink-50 p-4 rounded-lg">
            <h2 className="font-semibold text-lg">Story Time 📖</h2>
            <div className="mt-2 text-sm text-slate-700">
              <p>
                Meet <strong>Asha</strong>, a curious student, and <strong>Robo</strong>, her friendly coding robot. Asha wonders how Robo knows when a message is happy or sad. Robo decides to teach Asha using simple examples — that is called <em>Sentiment Analysis</em>.
              </p>
              <p className="mt-2">
                Together they will play with sentences, try two different ways to detect feelings, and do fun exercises. Let’s help Asha learn how words like "love" or "hate" tell us what someone feels!
              </p>
            </div>
          </section>

          {/* Interactive analyzer */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Try it yourself ✍️</h3>
                <div className="text-sm text-slate-600">Choose approach:</div>
              </div>

              <div className="mt-3 flex gap-2 items-center">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1 rounded-full ${approach === "keywords" ? "bg-indigo-100" : "border"}`}>
                  <input type="radio" checked={approach === "keywords"} onChange={() => setApproach("keywords")} />
                  <span className="text-sm">Word List (simple)</span>
                </label>
                <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1 rounded-full ${approach === "mini" || approach === "mini-model" ? "bg-indigo-100" : "border"}`}>
                  <input type="radio" checked={approach === "mini-model"} onChange={() => setApproach("mini-model")} />
                  <span className="text-sm">Mini-model (learned weights)</span>
                </label>
              </div>

              <textarea
                className="w-full mt-3 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-200"
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div className="flex gap-2 flex-wrap">
                  {samples.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="px-3 py-1 rounded-full border text-sm hover:bg-indigo-50"
                    >
                      {s.length > 28 ? s.slice(0, 28) + "..." : s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setInput("")}
                    className="px-3 py-1 text-sm rounded-lg border"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setExplanationOpen((s) => !s)}
                    className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white"
                  >
                    {explanationOpen ? "Hide" : "Show"} Explanation
                  </button>
                </div>
              </div>

              {/* result */}
              <div className={`mt-4 p-4 rounded-lg ${sentimentColor(result.sentiment)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-700">Approach: <strong>{result.approach}</strong></div>
                    <div className="text-xl font-bold">{result.sentiment} {result.sentiment === 'Positive' ? '😊' : result.sentiment === 'Negative' ? '😢' : '😐'}</div>
                  </div>
                  <div className="text-sm text-slate-700">Confidence: <strong>{result.confidence}%</strong></div>
                </div>

                {explanationOpen && (
                  <div className="mt-3 text-sm text-slate-700">
                    {approach === "keywords" ? (
                      <>
                        <div>Matched positive words: <strong>{(result.matchedPos || []).join(", ") || "—"}</strong></div>
                        <div>Matched negative words: <strong>{(result.matchedNeg || []).join(", ") || "—"}</strong></div>
                        <div className="mt-2">Explanation: The app counts happy words and sad words. If there are more happy words, the sentence is considered <strong>Positive</strong>. The other way around makes it <strong>Negative</strong>.</div>
                      </>
                    ) : (
                      <>
                        <div>Top contributing words:
                          <div className="mt-1 flex gap-2 flex-wrap">{(result.contributing || []).length ? result.contributing.map((c) => (
                            <span key={c.word} className="text-xs px-2 py-1 rounded-full border">{c.word} ({c.score})</span>
                          )) : <span className="text-xs">—</span>}</div>
                        </div>
                        <div className="mt-2">Explanation: The mini-model learned which words usually appear in happy or sad sentences (from a tiny set). It adds the learned numbers for words found and decides if the sentence is happy or sad.</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Side: learning steps, playful visuals */}
            <aside className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold">How Robo explains it 🤖</h4>
              <ol className="mt-2 text-sm space-y-2 list-decimal list-inside">
                <li>Break sentence into words (tokenize).</li>
                <li>Check if words are happy or sad (or learned weights).</li>
                <li>Add numbers and decide: happy / sad / neutral.</li>
              </ol>

              <div className="mt-4">
                <h5 className="font-semibold">Mini-experiment</h5>
                <p className="text-sm mt-2">Try: "I love the new game, but the music is bad." See which words made Robo pick that feeling.</p>
              </div>
            </aside>
          </section>

          {/* Exercises / Quiz */}
          <section className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold">Exercises & Quiz ✅</h3>
            <p className="text-sm text-slate-600 mt-2">Help Asha answer this:</p>
            <div className="mt-3">
              <div className="bg-gray-50 p-3 rounded-md">"I am so excited about my birthday party!"</div>
              <div className="mt-3 flex gap-2">
                {quiz.options.map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => setQuizAnswer(i)}
                    className={`px-3 py-2 rounded-lg border text-sm ${quizAnswer === i ? "bg-indigo-100" : ""}`}>
                    {opt}
                  </button>
                ))}
              </div>
              {quizAnswer !== null && (
                <div className="mt-3 text-sm">
                  {quizAnswer === quiz.correct ? (
                    <div className="text-green-700">Correct! {quiz.explain}</div>
                  ) : (
                    <div className="text-red-700">Not quite. {quiz.explain}</div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-slate-600">More exercises: Ask users to input three sentences from their day and see which are positive or negative.</div>
          </section>

          {/* Educator notes */}
          <section className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold">Note for teachers</h3>
            <ul className="text-sm mt-2 list-disc list-inside">
              <li>Talk through the story: use examples from students' lives.</li>
              <li>Discuss why words can be tricky (sarcasm, emojis, double meaning).</li>
              <li>Use the mini-model to explain how computers "learn" from examples.</li>
            </ul>
          </section>
        </main>

        <footer className="p-6 text-center text-sm text-slate-600 border-t">Made with ❤️ to teach kids the basics of Sentiment Analysis. Try adding your own words to the lists to see how Robo changes!</footer>
      </div>
    </div>
  );
}
