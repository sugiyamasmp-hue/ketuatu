import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

const GAS_URL = "https://script.google.com/macros/s/AKfycbyMe6WfZmNJfzmdWLmUIbW4O-FZpDTcDOItsMzouwM07hM7cBC2ht5uFsiV9YjNtgNj/exec";
const LOCATIONS = ["自宅", "病院", "DS", "その他"];

// BMI計算
const calcBMI = (weight, height) => {
  if (!weight || !height || height <= 0) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
};

// BMI判定
const getBMIStatus = (bmi) => {
  if (!bmi) return { label: "---", color: "#888" };
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "低体重", color: "#3b82f6" };
  if (b < 25) return { label: "標準", color: "#22c55e" };
  if (b < 30) return { label: "肥満(1度)", color: "#f59e0b" };
  return { label: "肥満(2度以上)", color: "#ef4444" };
};

// 血圧判定
const getBPStatus = (sys, dia) => {
  if (!sys || !dia) return { label: "---", color: "#888" };
  if (sys >= 180 || dia >= 110) return { label: "高血圧3度", color: "#7f1d1d" };
  if (sys >= 160 || dia >= 100) return { label: "高血圧2度", color: "#ef4444" };
  if (sys >= 140 || dia >= 90) return { label: "高血圧1度", color: "#f97316" };
  if (sys >= 130 || dia >= 80) return { label: "高値血圧", color: "#f59e0b" };
  if (sys >= 120 || dia >= 80) return { label: "正常高値", color: "#eab308" };
  if (sys < 90 || dia < 60) return { label: "低血圧", color: "#3b82f6" };
  return { label: "正常", color: "#22c55e" };
};

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    systolic: "", diastolic: "", pulse: "", weight: "",
    location: "自宅", memo: ""
  });
  const [height, setHeight] = useState(() => localStorage.getItem("userHeight") || "170");
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState("record"); // record | chart | history

  // 身長保存
  useEffect(() => {
    localStorage.setItem("userHeight", height);
  }, [height]);

  // GAS からデータ取得
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${GAS_URL}?action=get`);
      const data = await res.json();
      setRecords(data.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  // GAS へ送信
  const handleSubmit = async () => {
    if (!form.systolic || !form.diastolic) {
      alert("収縮期・拡張期血圧は必須です");
      return;
    }
    const bmi = calcBMI(form.weight, height);
    const payload = {
      action: "add",
      systolic: form.systolic,
      diastolic: form.diastolic,
      pulse: form.pulse,
      weight: form.weight,
      bmi: bmi || "",
      location: form.location,
      memo: form.memo,
      timestamp: new Date().toISOString()
    };
    try {
      setLoading(true);
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setForm({ systolic: "", diastolic: "", pulse: "", weight: "", location: "自宅", memo: "" });
      await fetchRecords();
      setTab("history");
    } catch (e) {
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // チャート用データ整形（最新20件）
  const chartData = [...records]
    .reverse()
    .slice(0, 20)
    .map((r) => ({
      date: r.timestamp ? r.timestamp.slice(5, 10) : "",
      収縮期: r.systolic ? parseInt(r.systolic) : null,
      拡張期: r.diastolic ? parseInt(r.diastolic) : null,
      脈拍: r.pulse ? parseInt(r.pulse) : null,
      体重: r.weight ? parseFloat(r.weight) : null,
    }));

  const bmi = calcBMI(form.weight, height);
  const bmiStatus = getBMIStatus(bmi);
  const bpStatus = getBPStatus(parseInt(form.systolic), parseInt(form.diastolic));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%)",
      color: "#e2e8f0",
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      padding: "0 0 80px 0"
    }}>
      {/* ヘッダー */}
      <div style={{
        background: "rgba(15,23,42,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(99,179,237,0.2)",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#63b3ed", letterSpacing: "0.05em" }}>
            🩺 血圧・体重管理
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            Health Tracker
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: "rgba(99,179,237,0.1)",
            border: "1px solid rgba(99,179,237,0.3)",
            borderRadius: 8,
            color: "#63b3ed",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 13
          }}
        >
          ⚙ 設定
        </button>
      </div>

      {/* 身長設定パネル */}
      {showSettings && (
        <div style={{
          background: "rgba(30,41,59,0.95)",
          borderBottom: "1px solid rgba(99,179,237,0.15)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <label style={{ fontSize: 14, color: "#94a3b8" }}>身長（BMI計算用）</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(99,179,237,0.4)",
                borderRadius: 8,
                color: "#e2e8f0",
                padding: "8px 12px",
                width: 80,
                fontSize: 16,
                textAlign: "center"
              }}
            />
            <span style={{ color: "#94a3b8", fontSize: 14 }}>cm</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            設定すると体重入力時にBMIを自動計算します
          </div>
        </div>
      )}

      {/* タブ */}
      <div style={{
        display: "flex",
        background: "rgba(15,23,42,0.6)",
        borderBottom: "1px solid rgba(99,179,237,0.1)",
        padding: "0 20px"
      }}>
        {[["record", "📝 記録"], ["chart", "📊 グラフ"], ["history", "📋 履歴"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === key ? "2px solid #63b3ed" : "2px solid transparent",
              color: tab === key ? "#63b3ed" : "#64748b",
              padding: "14px 16px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: tab === key ? 600 : 400,
              transition: "all 0.2s"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px", maxWidth: 600, margin: "0 auto" }}>

        {/* ===== 記録タブ ===== */}
        {tab === "record" && (
          <div>
            {/* 現在のステータス表示 */}
            {(form.systolic || form.weight) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20
              }}>
                <div style={{
                  background: "rgba(30,41,59,0.8)",
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid ${bpStatus.color}40`
                }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>血圧判定</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: bpStatus.color }}>
                    {bpStatus.label}
                  </div>
                  {form.systolic && form.diastolic && (
                    <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                      {form.systolic}/{form.diastolic} mmHg
                    </div>
                  )}
                </div>
                <div style={{
                  background: "rgba(30,41,59,0.8)",
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid ${bmiStatus.color}40`
                }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>BMI</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: bmiStatus.color }}>
                    {bmi ? `${bmi}` : "---"}
                  </div>
                  <div style={{ fontSize: 13, color: bmiStatus.color, marginTop: 4 }}>
                    {bmiStatus.label}
                  </div>
                </div>
              </div>
            )}

            {/* 入力フォーム */}
            <div style={{
              background: "rgba(30,41,59,0.7)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(99,179,237,0.15)"
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#93c5fd", marginBottom: 20 }}>
                📋 新規記録
              </div>

              {/* 血圧 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                  🩺 血圧 (mmHg)
                </label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>収縮期（上）</div>
                    <input
                      type="number"
                      value={form.systolic}
                      onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                      placeholder="120"
                      style={inputStyle}
                    />
                  </div>
                  <span style={{ color: "#475569", fontSize: 20, paddingTop: 20 }}>/</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>拡張期（下）</div>
                    <input
                      type="number"
                      value={form.diastolic}
                      onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                      placeholder="80"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* 脈拍 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                  💓 脈拍 (bpm)
                </label>
                <input
                  type="number"
                  value={form.pulse}
                  onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                  placeholder="70"
                  style={{ ...inputStyle, width: "50%" }}
                />
              </div>

              {/* 体重 */}
              <div style={{
                marginBottom: 16,
                background: "rgba(99,179,237,0.05)",
                borderRadius: 12,
                padding: "16px",
                border: "1px solid rgba(99,179,237,0.15)"
              }}>
                <label style={{ fontSize: 13, color: "#93c5fd", display: "block", marginBottom: 8 }}>
                  ⚖ 体重 (kg)
                  {height && <span style={{ color: "#475569", fontSize: 11, marginLeft: 8 }}>身長: {height}cm</span>}
                </label>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="65.0"
                      style={inputStyle}
                    />
                  </div>
                  {bmi && (
                    <div style={{
                      background: `${bmiStatus.color}20`,
                      border: `1px solid ${bmiStatus.color}40`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      textAlign: "center",
                      minWidth: 90
                    }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>BMI</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: bmiStatus.color }}>{bmi}</div>
                      <div style={{ fontSize: 11, color: bmiStatus.color }}>{bmiStatus.label}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 場所 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                  📍 測定場所
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setForm({ ...form, location: loc })}
                      style={{
                        background: form.location === loc ? "rgba(99,179,237,0.2)" : "rgba(30,41,59,0.8)",
                        border: form.location === loc ? "1px solid #63b3ed" : "1px solid rgba(99,179,237,0.2)",
                        borderRadius: 8,
                        color: form.location === loc ? "#63b3ed" : "#94a3b8",
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: 14,
                        transition: "all 0.2s"
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* メモ */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 8 }}>
                  📝 メモ
                </label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  placeholder="気になること、体調など..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    width: "100%",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "rgba(99,179,237,0.2)" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  padding: "14px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.05em"
                }}
              >
                {loading ? "保存中..." : "💾 記録を保存"}
              </button>
            </div>
          </div>
        )}

        {/* ===== グラフタブ ===== */}
        {tab === "chart" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 血圧グラフ */}
            <div style={{
              background: "rgba(30,41,59,0.7)",
              borderRadius: 16,
              padding: "20px 8px 20px 0",
              border: "1px solid rgba(99,179,237,0.15)"
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#93c5fd", paddingLeft: 20, marginBottom: 16 }}>
                📈 血圧トレンド（直近20件）
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis domain={[40, 200]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <ReferenceLine y={140} stroke="#ef444480" strokeDasharray="4 4" label={{ value: "140", fill: "#ef4444", fontSize: 10 }} />
                  <ReferenceLine y={90} stroke="#f59e0b80" strokeDasharray="4 4" label={{ value: "90", fill: "#f59e0b", fontSize: 10 }} />
                  <Line type="monotone" dataKey="収縮期" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} connectNulls />
                  <Line type="monotone" dataKey="拡張期" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} connectNulls />
                  <Line type="monotone" dataKey="脈拍" stroke="#22c55e" strokeWidth={1.5} dot={{ r: 2, fill: "#22c55e" }} strokeDasharray="5 5" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 体重グラフ */}
            <div style={{
              background: "rgba(30,41,59,0.7)",
              borderRadius: 16,
              padding: "20px 8px 20px 0",
              border: "1px solid rgba(99,179,237,0.15)"
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#93c5fd", paddingLeft: 20, marginBottom: 16 }}>
                ⚖ 体重トレンド（直近20件）
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData.filter(d => d.体重)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#94a3b8" }}
                    formatter={(v) => [`${v} kg`, "体重"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="体重"
                    stroke="#63b3ed"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#63b3ed", stroke: "#1e293b", strokeWidth: 2 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ===== 履歴タブ ===== */}
        {tab === "history" && (
          <div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              {records.length} 件の記録
              <button onClick={fetchRecords} style={{ marginLeft: 12, background: "none", border: "1px solid rgba(99,179,237,0.3)", borderRadius: 6, color: "#63b3ed", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
                🔄 更新
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {records.map((r, i) => {
                const bpS = getBPStatus(parseInt(r.systolic), parseInt(r.diastolic));
                const bmiVal = r.bmi || calcBMI(r.weight, height);
                const bmiS = getBMIStatus(bmiVal);
                return (
                  <div
                    key={i}
                    style={{
                      background: "rgba(30,41,59,0.7)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      border: `1px solid ${bpS.color}25`
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {r.timestamp ? r.timestamp.replace("T", " ").slice(0, 16) : "---"}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{
                          background: `${bpS.color}20`,
                          color: bpS.color,
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: `1px solid ${bpS.color}40`
                        }}>
                          {bpS.label}
                        </span>
                        {r.location && (
                          <span style={{ color: "#64748b", fontSize: 11, padding: "2px 8px", background: "rgba(100,116,139,0.1)", borderRadius: 4 }}>
                            {r.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div>
                        <span style={{ color: "#ef4444", fontSize: 22, fontWeight: 700 }}>{r.systolic}</span>
                        <span style={{ color: "#94a3b8", fontSize: 14 }}>/</span>
                        <span style={{ color: "#f97316", fontSize: 22, fontWeight: 700 }}>{r.diastolic}</span>
                        <span style={{ color: "#64748b", fontSize: 12, marginLeft: 4 }}>mmHg</span>
                      </div>
                      {r.pulse && (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ color: "#22c55e", fontSize: 18, fontWeight: 600 }}>{r.pulse}</span>
                          <span style={{ color: "#64748b", fontSize: 12 }}>bpm</span>
                        </div>
                      )}
                      {r.weight && (
                        <div style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          background: "rgba(99,179,237,0.08)",
                          padding: "2px 10px",
                          borderRadius: 6,
                          border: "1px solid rgba(99,179,237,0.15)"
                        }}>
                          <span style={{ color: "#63b3ed", fontSize: 18, fontWeight: 600 }}>{r.weight}</span>
                          <span style={{ color: "#64748b", fontSize: 12 }}>kg</span>
                          {bmiVal && (
                            <span style={{ color: bmiS.color, fontSize: 12, fontWeight: 600 }}>
                              BMI {bmiVal}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {r.memo && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                        📝 {r.memo}
                      </div>
                    )}
                  </div>
                );
              })}
              {records.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: "#475569", padding: 40 }}>
                  まだ記録がありません
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 共通inputスタイル
const inputStyle = {
  background: "rgba(15,23,42,0.8)",
  border: "1px solid rgba(99,179,237,0.3)",
  borderRadius: 8,
  color: "#e2e8f0",
  padding: "10px 14px",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
  outline: "none"
};
