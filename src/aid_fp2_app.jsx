import { useState, useEffect, useRef } from "react";

const questions = [
  {
    id: 1,
    category: "ライフ・社会保険",
    question: "協会けんぽの被保険者に関する記述の空欄にあてはまる組合せとして、最も適切なものはどれか。\n\n特定適用事業所に使用される短時間労働者のうち、次のいずれかに該当する者は、原則として被保険者とならない。\n① 1週間の所定労働時間が（イ）未満の者\n② 所定内賃金が月額（ウ）未満の者\n③ 学生である者\n\nまた短時間労働者の要件として、所定労働時間・労働日数が通常の労働者の（ア）未満であること。",
    options: ["ア：3分の2　イ：20時間　ウ：5万8千円","ア：3分の2　イ：25時間　ウ：8万8千円","ア：4分の3　イ：20時間　ウ：8万8千円","ア：4分の3　イ：25時間　ウ：5万8千円"],
    answer: 2,
    explanation: "ポイントは3つ！\n\n✅ ア：4分の3 → 所定労働時間・日数が通常の4分の3未満が短時間労働者の基準\n✅ イ：20時間 → 週20時間未満はNG\n✅ ウ：8万8千円 → 月額8万8千円未満がポイント。これは「106万円の壁」のライン！\n\n「ハチハチ（88）で切れる！」で覚えよう！",
  },
  {
    id: 2,
    category: "ライフ・社会保険",
    question: "労働者災害補償保険に関する次の記述のうち、最も不適切なものはどれか。",
    options: ["労災保険の適用を受ける労働者には、アルバイトやパートタイマーも含まれる","労災保険料の算定に用いられる労災保険率は、適用事業に従事する労働者数に応じて定められている","業務上の傷病が治癒したときに一定の障害が残り、障害等級に該当する場合、障害補償給付が支給される","業務災害で労働者が死亡した場合、遺族に対して遺族補償年金または遺族補償一時金が支給される"],
    answer: 1,
    explanation: "2番が不適切！\n\n✅ 労災保険率は「労働者数」ではなく「業種（事業の種類）」で決まる！\n\n建設業や林業など危険な仕事は率が高く、オフィスワークは低い。\n\nまた1番の「アルバイト・パートも対象」は試験頻出！労災は雇用形態に関係なく全員対象や！",
  },
  {
    id: 3,
    category: "ライフ・社会保険",
    question: "国民年金の保険料に関する次の記述のうち、最も不適切なものはどれか。",
    options: ["第1号被保険者は、一定の条件を除き、月額400円の付加保険料を納付できる","産前産後期間の保険料免除制度により免除された期間は、保険料納付済期間として老齢基礎年金の年金額に反映される","保険料免除期間の保険料を追納する場合、追納額は追納する時期にかかわらず、免除された時点の保険料額となる","保険料を前納した第1号被保険者が、前納期間の途中で第2号被保険者になった場合、未経過期間分の保険料の還付を受けられる"],
    answer: 2,
    explanation: "3番が不適切！\n\n✅ 追納する場合、免除された時点の保険料そのままではない！\n\n2年以内の追納 → 加算なし（当時の保険料額）\n3年度目以降の追納 → 加算あり（割増になる！）\n\n「早よ追納せな損するで！」で覚えよう！⏰",
  },
  {
    id: 4,
    category: "タックス",
    question: "わが国の税制に関する次の記述のうち、最も不適切なものはどれか。",
    options: ["所得税では、課税対象となる所得を10種類に区分し、種類ごとに計算する","相続税では、納税者が申告書に記載した内容に基づき、税務署長が納付税額を決定する賦課課税方式が採用されている","税金を負担する者と納める者が異なる税金を間接税といい、消費税は間接税に該当する","法人税は国税、不動産取得税は地方税に該当する"],
    answer: 1,
    explanation: "2番が不適切！\n\n✅ 相続税は「申告納税方式」！自分で計算して申告する！\n\n📝 申告納税方式 → 自分で申告（所得税・相続税・贈与税・法人税）\n📬 賦課課税方式 → 役所から通知（固定資産税・住民税・不動産取得税）",
  },
  {
    id: 5,
    category: "タックス",
    question: "所得税における各種所得に関する次の記述のうち、最も適切なものはどれか。",
    options: ["個人事業主が事業資金で株式を購入し、配当金を受け取ったことによる所得は事業所得となる","給与収入が850万円を超える給与所得者が23歳未満の扶養親族を有する場合、所得金額調整控除として最大10万円が控除される","個人による不動産の貸付が事業的規模で行われている場合、その賃貸収入による所得は事業所得となる","会社員が自宅購入資金として勤務先から無利息で金銭を借り入れたことにより生じた経済的利益は給与所得となる"],
    answer: 3,
    explanation: "4番が正解！\n\n✅ 会社から無利息で借りたら、トクした利息分＝経済的利益は「給与所得」！\n\n❌ 1番：株の配当金はどんな目的で買っても「配当所得」\n❌ 2番：所得金額調整控除の最大は「15万円」\n❌ 3番：不動産貸付は規模に関係なく「不動産所得」",
  },
];

const STORAGE_KEY = "aid_fp2_scores";

export default function AIDApp() {
  const [screen, setScreen] = useState("home");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [history, setHistory] = useState([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) setHistory(JSON.parse(result.value));
      } catch { setHistory([]); }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // When result shows, initialize chat
  useEffect(() => {
    if (showResult && chatMessages.length === 0) {
      const q = questions[currentQ];
      setChatMessages([{
        role: "assistant",
        text: "なんか気になることあったら何でも聞いてや！「なんで？」「もっと詳しく！」でもOKやで🖤",
      }]);
    }
  }, [showResult]);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    setChatMessages([]);
    const correct = idx === questions[currentQ].answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, { q: currentQ, selected: idx, correct }]);
  };

  const handleNext = () => {
    setChatMessages([]);
    setChatInput("");
    if (currentQ + 1 < questions.length) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const newRecord = { date: new Date().toLocaleDateString("ja-JP"), score, total: questions.length };
    const newHistory = [newRecord, ...history].slice(0, 10);
    setHistory(newHistory);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(newHistory)); } catch {}
    setScreen("result");
  };

  const restartQuiz = () => {
    setScreen("home");
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setChatMessages([]);
    setChatInput("");
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");

    const q = questions[currentQ];
    const userMsg = { role: "user", text };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatLoading(true);

    const systemPrompt = `あなたは「クロちゃん」というFP2級の先生です。関西弁でフレンドリーに、楽しく、わかりやすく教えてください。
今取り組んでいる問題：
カテゴリ：${q.category}
問題：${q.question}
正解：選択肢${q.answer + 1}番「${q.options[q.answer]}」
解説：${q.explanation}

ユーザーが質問したことに対して、「なぜそうなるか」を日常のたとえや具体例を使って完全理解できるよう説明してください。200字以内で簡潔に答えてください。`;

    const apiMessages = newMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "ごめん、うまく答えられへんかった！もう一回聞いてみて！";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "通信エラーやで！もう一回試してみて！" }]);
    }
    setChatLoading(false);
  };

  const q = questions[currentQ];
  const percent = Math.round((score / questions.length) * 100);
  const getEmoji = (p) => p >= 80 ? "🎉" : p >= 60 ? "💪" : "😅";
  const getMessage = (p) => p >= 80 ? "めっちゃええやん！この調子で2級合格や！" : p >= 60 ? "惜しい！あと一歩やで！もう一回チャレンジ！" : "ドンマイ！間違いが宝や！解説読んで完全理解しよ！";

  return (
    <div style={S.root}>
      <div style={S.bg} />

      {/* HOME */}
      {screen === "home" && (
        <div style={S.container}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>A</div>
            <div>
              <div style={S.logoTitle}>AID式学習法</div>
              <div style={S.logoSub}>AI Interactive Dialogue</div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.tagRow}>
              <span style={S.tag}>FP2級</span>
              <span style={S.tag}>学科対策</span>
            </div>
            <div style={S.heroText}>楽しく、気分良く、</div>
            <div style={S.heroText2}>完全理解！</div>
            <div style={S.heroSub}>暗記じゃなくて「なぜ？」で理解する学習法</div>
            <div style={S.statsRow}>
              <div style={S.stat}><div style={S.statNum}>{questions.length}</div><div style={S.statLabel}>問題数</div></div>
              <div style={S.statDivider} />
              <div style={S.stat}><div style={S.statNum}>{history.length}</div><div style={S.statLabel}>挑戦回数</div></div>
              <div style={S.statDivider} />
              <div style={S.stat}><div style={S.statNum}>{history.length > 0 ? Math.round((history[0].score / history[0].total) * 100) + "%" : "--"}</div><div style={S.statLabel}>最新スコア</div></div>
            </div>
            {/* API Key Setup */}
            <div style={S.apiKeyWrap}>
              <div style={S.apiKeyLabel}>🔑 Anthropic APIキー（チャット機能に必要）</div>
              <div style={S.apiKeyRow}>
                <input
                  style={S.apiKeyInput}
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                />
                <button style={S.apiKeyBtn} onClick={() => { setApiKey(apiKeyInput); }}>
                  {apiKey ? "✅" : "設定"}
                </button>
              </div>
              {apiKey && <div style={S.apiKeyOk}>APIキー設定済み！チャット機能が使えるで🎉</div>}
            </div>
            <button style={S.startBtn} onClick={() => setScreen("quiz")}>スタート！🔥</button>
          </div>
          {history.length > 0 && (
            <div style={S.historyCard}>
              <div style={S.historyTitle}>📊 最近の記録</div>
              {history.slice(0, 3).map((h, i) => (
                <div key={i} style={S.historyRow}>
                  <span style={S.historyDate}>{h.date}</span>
                  <span style={S.historyScore}>{h.score}/{h.total} ({Math.round((h.score / h.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          )}
          <div style={S.footer}>クロちゃんと一緒に合格めざそ！🖤</div>
        </div>
      )}

      {/* QUIZ */}
      {screen === "quiz" && (
        <div style={S.container}>
          <div style={S.progressBar}><div style={S.progressFill(((currentQ + 1) / questions.length) * 100)} /></div>
          <div style={S.quizHeader}>
            <span style={S.categoryTag}>{q.category}</span>
            <span style={S.qCount}>{currentQ + 1} / {questions.length}</span>
          </div>
          <div style={S.questionCard}>
            <div style={S.questionText}>{q.question}</div>
          </div>
          <div style={S.optionsWrap}>
            {q.options.map((opt, idx) => {
              let btnStyle = { ...S.optionBtn };
              if (showResult) {
                if (idx === q.answer) btnStyle = { ...btnStyle, ...S.optionCorrect };
                else if (idx === selected) btnStyle = { ...btnStyle, ...S.optionWrong };
                else btnStyle = { ...btnStyle, ...S.optionDim };
              }
              return (
                <button key={idx} style={btnStyle} onClick={() => handleAnswer(idx)}>
                  <span style={S.optionNum}>{idx + 1}</span>
                  <span style={S.optionText}>{opt}</span>
                  {showResult && idx === q.answer && <span>✅</span>}
                  {showResult && idx === selected && idx !== q.answer && <span>❌</span>}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div style={S.explanationCard}>
              <div style={S.resultLabel}>{selected === q.answer ? "🎉 正解！！" : "💦 不正解..."}</div>
              <div style={S.explanationText}>{q.explanation}</div>

              {/* CHAT エリア */}
              <div style={S.chatArea}>
                <div style={S.chatHeader}>🖤 クロちゃんに質問する</div>
                <div style={S.chatMessages}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={m.role === "assistant" ? S.chatBubbleBot : S.chatBubbleUser}>
                      {m.role === "assistant" && <div style={S.botIcon}>🖤</div>}
                      <div style={m.role === "assistant" ? S.bubbleTextBot : S.bubbleTextUser}>{m.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={S.chatBubbleBot}>
                      <div style={S.botIcon}>🖤</div>
                      <div style={S.bubbleTextBot}>考え中やで...⏳</div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div style={S.chatInputRow}>
                  <input
                    style={S.chatInput}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendChat()}
                    placeholder="なんでも聞いてや！"
                  />
                  <button style={S.chatSendBtn} onClick={sendChat} disabled={chatLoading}>送信</button>
                </div>
              </div>

              <button style={S.nextBtn} onClick={handleNext}>
                {currentQ + 1 < questions.length ? "次の問題へ →" : "結果を見る 🏁"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* RESULT */}
      {screen === "result" && (
        <div style={S.container}>
          <div style={S.resultCard}>
            <div style={S.resultEmoji}>{getEmoji(percent)}</div>
            <div style={S.resultScore}>{score} / {questions.length}</div>
            <div style={S.resultPercent}>{percent}%</div>
            <div style={S.resultMsg}>{getMessage(percent)}</div>
            <div style={S.reviewWrap}>
              {answers.map((a, i) => (
                <div key={i} style={S.reviewRow}>
                  <span>{a.correct ? "✅" : "❌"}</span>
                  <span style={S.reviewQ}>問{i + 1}：{questions[a.q].category}</span>
                </div>
              ))}
            </div>
            <button style={S.startBtn} onClick={restartQuiz}>もう一回挑戦！🔥</button>
          </div>
          <div style={S.footer}>AID式学習法 © amadopapa</div>
        </div>
      )}
    </div>
  );
}

const S = {
  root: { minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0", fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif", position: "relative" },
  bg: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(255,140,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,80,80,0.06) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 },
  container: { position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px" },
  logoWrap: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingTop: 8 },
  logoIcon: { width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #ff8c00, #ff4500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#fff", boxShadow: "0 4px 20px rgba(255,140,0,0.4)" },
  logoTitle: { fontSize: 20, fontWeight: 800, color: "#fff" },
  logoSub: { fontSize: 11, color: "#ff8c00", letterSpacing: "0.1em", fontWeight: 600 },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px 20px", marginBottom: 16 },
  tagRow: { display: "flex", gap: 8, marginBottom: 16 },
  tag: { background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.3)", color: "#ff8c00", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 },
  heroText: { fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.2 },
  heroText2: { fontSize: 32, fontWeight: 900, background: "linear-gradient(90deg, #ff8c00, #ff4500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 },
  heroSub: { fontSize: 13, color: "#888", marginBottom: 20 },
  statsRow: { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 0", marginBottom: 20 },
  stat: { flex: 1, textAlign: "center" },
  statNum: { fontSize: 22, fontWeight: 800, color: "#ff8c00" },
  statLabel: { fontSize: 11, color: "#666", marginTop: 2 },
  statDivider: { width: 1, height: 30, background: "rgba(255,255,255,0.08)" },
  startBtn: { width: "100%", padding: "14px 0", background: "linear-gradient(135deg, #ff8c00, #ff4500)", border: "none", borderRadius: 14, color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(255,140,0,0.35)" },
  historyCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "16px 20px", marginBottom: 16 },
  historyTitle: { fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 10 },
  historyRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  historyDate: { fontSize: 13, color: "#666" },
  historyScore: { fontSize: 13, fontWeight: 700, color: "#ff8c00" },
  footer: { textAlign: "center", fontSize: 12, color: "#444", marginTop: 8 },
  progressBar: { height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, marginBottom: 16, overflow: "hidden" },
  progressFill: (w) => ({ height: "100%", width: `${w}%`, background: "linear-gradient(90deg, #ff8c00, #ff4500)", borderRadius: 4, transition: "width 0.4s ease" }),
  quizHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  categoryTag: { background: "rgba(255,140,0,0.15)", border: "1px solid rgba(255,140,0,0.3)", color: "#ff8c00", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 },
  qCount: { fontSize: 13, color: "#666", fontWeight: 700 },
  questionCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px 16px", marginBottom: 14 },
  questionText: { fontSize: 14, lineHeight: 1.8, color: "#e8e8e8", whiteSpace: "pre-wrap" },
  optionsWrap: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 },
  optionBtn: { display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", color: "#e8e8e8", fontSize: 13, textAlign: "left", cursor: "pointer", lineHeight: 1.6 },
  optionCorrect: { background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.4)" },
  optionWrong: { background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.4)" },
  optionDim: { opacity: 0.4 },
  optionNum: { minWidth: 22, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#ff8c00", marginTop: 1 },
  optionText: { flex: 1 },
  explanationCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px", marginBottom: 8 },
  resultLabel: { fontSize: 18, fontWeight: 800, marginBottom: 10, color: "#fff" },
  explanationText: { fontSize: 13, lineHeight: 1.9, color: "#ccc", whiteSpace: "pre-wrap", marginBottom: 14 },
  // Chat styles
  chatArea: { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,140,0,0.2)", borderRadius: 14, padding: "12px", marginBottom: 14 },
  chatHeader: { fontSize: 13, fontWeight: 700, color: "#ff8c00", marginBottom: 10 },
  chatMessages: { maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 },
  chatBubbleBot: { display: "flex", alignItems: "flex-start", gap: 8 },
  chatBubbleUser: { display: "flex", justifyContent: "flex-end" },
  botIcon: { fontSize: 18, marginTop: 2 },
  bubbleTextBot: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px 12px 12px 12px", padding: "8px 12px", fontSize: 13, lineHeight: 1.7, color: "#e8e8e8", maxWidth: "85%", whiteSpace: "pre-wrap" },
  bubbleTextUser: { background: "linear-gradient(135deg, #ff8c00, #ff4500)", borderRadius: "12px 4px 12px 12px", padding: "8px 12px", fontSize: 13, lineHeight: 1.7, color: "#fff", maxWidth: "85%" },
  chatInputRow: { display: "flex", gap: 8 },
  chatInput: { flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none" },
  chatSendBtn: { padding: "9px 16px", background: "linear-gradient(135deg, #ff8c00, #ff4500)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" },
  nextBtn: { width: "100%", padding: "13px 0", background: "linear-gradient(135deg, #ff8c00, #ff4500)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" },
  resultCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 16 },
  resultEmoji: { fontSize: 52, marginBottom: 12 },
  resultScore: { fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1 },
  resultPercent: { fontSize: 22, fontWeight: 800, color: "#ff8c00", marginBottom: 10 },
  resultMsg: { fontSize: 15, color: "#ccc", marginBottom: 20, lineHeight: 1.6 },
  reviewWrap: { textAlign: "left", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 },
  reviewRow: { display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 },
  reviewQ: { color: "#aaa" },
  apiKeyWrap: { background: "rgba(255,140,0,0.05)", border: "1px solid rgba(255,140,0,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 },
  apiKeyLabel: { fontSize: 12, color: "#ff8c00", fontWeight: 700, marginBottom: 8 },
  apiKeyRow: { display: "flex", gap: 8 },
  apiKeyInput: { flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#fff", outline: "none" },
  apiKeyBtn: { padding: "8px 14px", background: "rgba(255,140,0,0.3)", border: "1px solid rgba(255,140,0,0.5)", borderRadius: 8, color: "#ff8c00", fontSize: 13, fontWeight: 800, cursor: "pointer" },
  apiKeyOk: { fontSize: 12, color: "#4caf50", marginTop: 6 },
};
