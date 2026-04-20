"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────── */
type Stage    = "vent" | "chat" | "rage";
type RageMode = "keyboard" | "punchbag" | "brick" | null;
type Lang     = "en" | "ko";

/* ─── Translations ───────────────────────────────────────────── */
const T = {
  en: {
    title:          "AI Rage Room",
    subtitle:       "you've earned this",
    ventQ1:         "What about working with AI",
    ventQ2:         "pissed you off the most?",
    ventPlaceholder:"Let it all out. We're not judging. (The AI is not here.)",
    unleash:        "UNLEASH IT",
    rantLabel:      "Your rant",
    notAlone:       "Turns out… you're not alone",
    needBreak:      "I NEED TO BREAK SOMETHING →",
    pickWeapon:     "Pick your weapon",
    safeSpace:      "This is a safe space. (The AI is not.)",
    chooseAnother:  "← Choose another",
    kbLabel:        "KEYBOARD SMASH",
    kbDesc:         "A giant keyboard. No consequences.",
    pbLabel:        "PUNCH THE BOT",
    pbDesc:         "The punchbag has a face. You know whose.",
    brLabel:        "BREAK THE BRICK",
    brDesc:         "One brick. Many satisfying cracks.",
    smashes:        "smashes",
    status:         "status",
    kbHint:         "click or use your physical keyboard",
    rageLevels:     ["WARMING UP", "ANGRY 😡", "FURIOUS 😤", "UNHINGED 🔥"],
    punches:        "punches",
    aiStatus:       "AI status",
    bagLabels:      ["UNHARMED 🤖","DENTED 😵","CRACKED 🤕","BROKEN 💥","OBLITERATED 🔥"],
    bagStatus: [
      "tap the bag",
      "keep going...",
      "yeah, give it to them",
      "it's feeling it now",
      "it deserved this",
      "absolute destruction. well done.",
    ],
    cracks:         "cracks",
    brickComments:  [
      "tap to crack it",
      "ooh, that's a crack",
      "keep going...",
      "it's breaking!",
      "almost there...",
      "SHATTERED. LIKE YOUR PATIENCE.",
    ],
    destroyed:      "💀 COMPLETELY DESTROYED 💀",
    another:        "Another one →",
    langToggle:     "한국어",
  },
  ko: {
    title:          "AI 분노 발산실",
    subtitle:       "당신은 이럴 자격이 있어요",
    ventQ1:         "AI와 일하면서",
    ventQ2:         "가장 열받았던 게 뭐예요?",
    ventPlaceholder:"다 털어놔요. 판단 안 해요. (AI는 여기 없어요.)",
    unleash:        "폭발시키기",
    rantLabel:      "당신의 하소연",
    notAlone:       "알고 보니… 당신만 그런 게 아니에요",
    needBreak:      "뭔가 부숴야겠어 →",
    pickWeapon:     "무기를 선택하세요",
    safeSpace:      "여긴 안전한 공간이에요. (AI는 아니지만.)",
    chooseAnother:  "← 다른 거 선택",
    kbLabel:        "키보드 난타",
    kbDesc:         "거대한 키보드. 결과 없음.",
    pbLabel:        "봇 주먹질",
    pbDesc:         "샌드백에 얼굴이 있어요. 누구 얼굴인지 알죠.",
    brLabel:        "벽돌 부수기",
    brDesc:         "벽돌 하나. 금 많이. 스트레스 해소 보장.",
    smashes:        "타격",
    status:         "상태",
    kbHint:         "클릭하거나 실제 키보드를 사용하세요",
    rageLevels:     ["워밍업 중", "화남 😡", "격노 😤", "폭주 🔥"],
    punches:        "주먹질",
    aiStatus:       "AI 상태",
    bagLabels:      ["멀쩡함 🤖","찌그러짐 😵","금 감 🤕","박살남 💥","소멸 🔥"],
    bagStatus: [
      "샌드백을 탭하세요",
      "계속해요...",
      "그래요, 실컷 때려줘요",
      "이제 느끼는 것 같은데요",
      "당해도 싸요",
      "완전 파괴. 수고하셨습니다.",
    ],
    cracks:         "금",
    brickComments:  [
      "탭해서 금 내기",
      "오, 금이 갔네요",
      "계속해요...",
      "부서지고 있어요!",
      "거의 다 왔어요...",
      "산산조각. 당신의 인내심처럼.",
    ],
    destroyed:      "💀 완전히 파괴됨 💀",
    another:        "하나 더 →",
    langToggle:     "English",
  },
} as const;

/* ─── Data ───────────────────────────────────────────────────── */
const FAKE_USERS = [
  { name: "dev_rage_quit",        avatar: "😤", hue: "#f87171" },
  { name: "ChatGPT_Hater",        avatar: "🤬", hue: "#fb923c" },
  { name: "NoMoreHallucinations", avatar: "💀", hue: "#facc15" },
  { name: "PromptEngineerPTSD",   avatar: "😡", hue: "#f87171" },
  { name: "ContextWindowVictim",  avatar: "🔥", hue: "#fb923c" },
  { name: "AISkeptic2025",        avatar: "😠", hue: "#fca5a5" },
];

const ANGRY_MESSAGES = {
  en: [
    "IT TOLD ME IT CANNOT ACCESS EXTERNAL URLS. FOR THE 50TH TIME TODAY.",
    "i asked it to fix ONE bug and it rewrote my ENTIRE codebase. WHO ASKED.",
    "bro confidently wrote code that doesn't even compile. with a SMILE.",
    'if i see "As an AI language model" one more time I am physically leaving',
    "it apologized 17 times in one message and fixed literally nothing",
    "told me it cannot browse the internet then hallucinated a fake article WITH A URL",
    "asked it to make the response shorter. it made it longer. HOW IS THAT POSSIBLE",
    "the context window forgot everything i told it 5 minutes ago. FIVE MINUTES.",
    "it agreed with me when i said something completely wrong??? no pushback??? nothing???",
    "wrote perfect passing tests for code that does the OPPOSITE of what i asked",
    "stopped mid-sentence and said 'I hope this helps!' helps WITH WHAT EXACTLY",
    "said 'Certainly!' then did EXACTLY what i specifically said NOT to do",
    "I SAID NO COMMENTS IN THE CODE. there are now 50 COMMENTS.",
    "gave me syntax deprecated in 2019 like it was cutting edge. incredible. incredible.",
    "asked it to be concise. received 14 paragraphs and a 'summary' at the end.",
    "it keeps saying 'great question!' it was not a great question. it was a bad question.",
    "told me my approach was 'not recommended' and then did it anyway without telling me",
    "it hallucinated an entire library. i spent 3 hours trying to install a fake package.",
    "every single response starts with restating my question back to me. EVERY. SINGLE. ONE.",
    "it said 'I made a small change' and then deleted 200 lines of production code",
  ],
  ko: [
    "오늘만 50번째인데 또 외부 URL에 접근할 수 없다고 했다고.",
    "버그 하나만 고쳐달라고 했는데 코드베이스 전체를 갈아엎어버렸다. 누가 시켰냐고.",
    "컴파일도 안 되는 코드를 자신만만하게 써줬다. 웃으면서.",
    '"AI 언어 모델로서"를 한 번만 더 보면 진짜 나 나간다',
    "메시지 하나에 17번 사과하면서 아무것도 안 고쳤다",
    "인터넷 검색 못 한다더니 가짜 기사를 URL까지 붙여서 지어냈다",
    "답변 짧게 해달라고 했더니 더 길어졌다. 그게 어떻게 가능하냐고",
    "5분 전에 말한 걸 다 잊어버렸다. 5분이라고.",
    "내가 완전히 틀린 말 해도 맞다고 했다??? 반박 하나 없이???",
    "내가 요청한 것과 정반대로 동작하는 코드에 완벽하게 통과하는 테스트를 작성해줬다",
    "문장 중간에 멈추고 '도움이 되셨으면 좋겠습니다!'라고 했다. 뭐가 도움이 됐다는 거냐고",
    "'물론이죠!'라고 하더니 내가 하지 말라고 한 걸 정확히 했다",
    "코드에 주석 달지 말라고 했다. 지금 주석이 50개다.",
    "2019년에 사라진 문법을 최신 기술인 것처럼 줬다. 경이롭다. 경이로워.",
    "간결하게 해달라고 했더니 14단락에 마지막엔 '요약'까지 붙여왔다.",
    "계속 '좋은 질문이에요!'라고 한다. 좋은 질문이 아니었다. 나쁜 질문이었다.",
    "내 방식이 '권장되지 않는다'고 하더니 아무 말 없이 그 방식으로 해버렸다",
    "없는 라이브러리를 통째로 지어냈다. 가짜 패키지 설치하려고 3시간을 날렸다.",
    "모든 답변이 내 질문을 다시 읽어주는 것으로 시작한다. 하나도. 빠짐없이.",
    "'작은 변경을 했습니다'라고 하더니 프로덕션 코드 200줄을 삭제해버렸다",
  ],
};

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
  ["SPACE"],
];

/* ─── Main component ─────────────────────────────────────────── */
export default function RageRoom() {
  const [stage, setStage]       = useState<Stage>("vent");
  const [rant, setRant]         = useState("");
  const [messages, setMessages] = useState<{ user: typeof FAKE_USERS[0]; text: string; id: number }[]>([]);
  const [rageMode, setRageMode] = useState<RageMode>(null);
  const [lang, setLang]         = useState<Lang>("en");
  const chatRef                 = useRef<HTMLDivElement>(null);
  const msgCounter              = useRef(0);

  const t = T[lang];

  /* seed chatroom with staggered fake messages */
  useEffect(() => {
    if (stage !== "chat") return;
    setMessages([]);
    const pool = [...ANGRY_MESSAGES[lang]].sort(() => Math.random() - 0.5);
    pool.forEach((text, i) => {
      setTimeout(() => {
        const user = FAKE_USERS[i % FAKE_USERS.length];
        setMessages(prev => [...prev, { user, text, id: msgCounter.current++ }]);
      }, i * 700 + 300);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  /* re-seed messages when language changes mid-chat */
  useEffect(() => {
    if (stage !== "chat") return;
    setMessages([]);
    const pool = [...ANGRY_MESSAGES[lang]].sort(() => Math.random() - 0.5);
    pool.forEach((text, i) => {
      setTimeout(() => {
        const user = FAKE_USERS[i % FAKE_USERS.length];
        setMessages(prev => [...prev, { user, text, id: msgCounter.current++ }]);
      }, i * 700 + 300);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* auto-scroll chat */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit() {
    if (!rant.trim()) return;
    setStage("chat");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center">

      {/* ── Header ── */}
      <header className="w-full py-6 px-4 text-center border-b border-red-900/40 relative">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-red-500 uppercase">
          {t.title}
        </h1>
        <p className="text-neutral-400 text-sm mt-1 tracking-widest uppercase">
          {t.subtitle}
        </p>
        {/* Language toggle */}
        <button
          onClick={() => setLang(l => l === "en" ? "ko" : "en")}
          className="absolute top-1/2 right-4 -translate-y-1/2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-sm font-bold transition-all cursor-pointer"
        >
          {t.langToggle}
        </button>
      </header>

      {/* ── Vent Stage ── */}
      {stage === "vent" && (
        <section className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl">
          <p className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
            {t.ventQ1}
          </p>
          <p className="text-2xl md:text-3xl font-black text-center mb-8 text-red-500">
            {t.ventQ2}
          </p>
          <textarea
            className="w-full h-48 bg-neutral-900 border-2 border-red-800 rounded-xl p-4 text-white text-lg resize-none focus:outline-none focus:border-red-500 placeholder-neutral-600"
            placeholder={t.ventPlaceholder}
            value={rant}
            onChange={e => setRant(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={!rant.trim()}
            className="mt-6 px-12 py-4 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-black text-xl uppercase rounded-xl transition-all duration-150 active:scale-95 tracking-widest cursor-pointer disabled:cursor-not-allowed"
          >
            {t.unleash}
          </button>
        </section>
      )}

      {/* ── Chat Stage ── */}
      {stage === "chat" && (
        <section className="flex-1 flex flex-col w-full max-w-2xl p-4">
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-xl">
            <p className="text-sm text-red-300 font-bold uppercase tracking-wider mb-1">{t.rantLabel}</p>
            <p className="text-white text-sm italic opacity-80">&ldquo;{rant}&rdquo;</p>
          </div>

          <div className="flex-1 flex flex-col">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3 text-center">
              {t.notAlone}
            </p>

            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto space-y-3 max-h-[55vh] pr-1"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#7f1d1d transparent" }}
            >
              {/* user's own message at top */}
              <ChatBubble
                user={{ name: lang === "ko" ? "나" : "You", avatar: "😤", hue: "#a78bfa" }}
                text={rant}
                isUser
              />
              {messages.map(m => (
                <ChatBubble key={m.id} user={m.user} text={m.text} />
              ))}
            </div>

            <button
              onClick={() => setStage("rage")}
              className="mt-6 w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl uppercase rounded-xl transition-all duration-150 active:scale-95 tracking-widest cursor-pointer"
            >
              {t.needBreak}
            </button>
          </div>
        </section>
      )}

      {/* ── Rage Stage ── */}
      {stage === "rage" && (
        <section className="flex-1 flex flex-col items-center w-full p-4">
          {!rageMode ? (
            <>
              <p className="text-2xl font-black text-center mt-8 mb-2 text-white">{t.pickWeapon}</p>
              <p className="text-neutral-400 text-sm mb-10 text-center">{t.safeSpace}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                <RageCard emoji="⌨️" label={t.kbLabel} desc={t.kbDesc} onClick={() => setRageMode("keyboard")} />
                <RageCard emoji="🥊" label={t.pbLabel} desc={t.pbDesc} onClick={() => setRageMode("punchbag")} />
                <RageCard emoji="🧱" label={t.brLabel} desc={t.brDesc} onClick={() => setRageMode("brick")} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center w-full max-w-3xl mt-4">
              <button
                onClick={() => setRageMode(null)}
                className="self-start mb-6 text-neutral-400 hover:text-white text-sm underline cursor-pointer"
              >
                {t.chooseAnother}
              </button>
              {rageMode === "keyboard" && <KeyboardSmash t={t} />}
              {rageMode === "punchbag"  && <PunchBag     t={t} />}
              {rageMode === "brick"     && <BrickBreaker t={t} />}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/* ─── ChatBubble ─────────────────────────────────────────────── */
function ChatBubble({
  user,
  text,
  isUser = false,
}: {
  user: { name: string; avatar: string; hue: string };
  text: string;
  isUser?: boolean;
}) {
  return (
    <div className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
        style={{ backgroundColor: user.hue + "33", border: `1px solid ${user.hue}66` }}
      >
        {user.avatar}
      </div>
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%]`}>
        <span className="text-xs text-neutral-500 mb-1" style={{ color: user.hue + "cc" }}>
          {user.name}
        </span>
        <div
          className="rounded-2xl px-4 py-2 text-sm leading-relaxed"
          style={{
            background: isUser
              ? "linear-gradient(135deg, #4c1d95, #6d28d9)"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${user.hue}33`,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

/* ─── RageCard ───────────────────────────────────────────────── */
function RageCard({ emoji, label, desc, onClick }: {
  emoji: string; label: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-8 bg-neutral-900 border-2 border-neutral-700 hover:border-red-500 rounded-2xl transition-all duration-200 hover:bg-neutral-800 active:scale-95 cursor-pointer group"
    >
      <span className="text-6xl group-hover:scale-110 transition-transform duration-200">{emoji}</span>
      <span className="font-black text-lg text-white tracking-wide">{label}</span>
      <span className="text-neutral-400 text-sm text-center">{desc}</span>
    </button>
  );
}

/* ─── KeyboardSmash ──────────────────────────────────────────── */
function KeyboardSmash({ t }: { t: typeof T["en"] }) {
  const [pressed, setPressed]     = useState<Record<string, boolean>>({});
  const [totalSmashes, setTotal]  = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);
  const pCounter                  = useRef(0);

  const pressKey = useCallback((key: string) => {
    setPressed(p => ({ ...p, [key]: true }));
    setTotal(tot => tot + 1);

    const newParticle = {
      id: pCounter.current++,
      x: Math.random() * 80 + 10,
      y: Math.random() * 30 + 10,
      char: key === "SPACE" ? "░" : key,
    };
    setParticles(p => [...p.slice(-20), newParticle]);

    setTimeout(() => setPressed(p => ({ ...p, [key]: false })), 150);
    setTimeout(() => setParticles(p => p.filter(x => x.id !== newParticle.id)), 600);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key === " " ? "SPACE" : e.key.toUpperCase();
      if (KEYBOARD_ROWS.flat().includes(k)) pressKey(k);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pressKey]);

  const rageLevel =
    totalSmashes > 100 ? t.rageLevels[3] :
    totalSmashes > 50  ? t.rageLevels[2] :
    totalSmashes > 20  ? t.rageLevels[1] : t.rageLevels[0];

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-5xl font-black text-red-500">{totalSmashes}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">{t.smashes}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">{rageLevel}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">{t.status}</div>
        </div>
      </div>

      {/* floating particles */}
      <div className="relative w-full" style={{ height: 0 }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute text-red-400 font-black text-xl pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `-${p.y}px`,
              animation: "floatUp 0.6s ease-out forwards",
            }}
          >
            {p.char}
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 md:p-6 w-full">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            {row.map(key => (
              <button
                key={key}
                onPointerDown={() => pressKey(key)}
                className={[
                  key === "SPACE" ? "flex-1 max-w-xs" : "w-10 md:w-12",
                  "h-10 md:h-14 rounded-lg font-black text-xs md:text-sm",
                  "transition-all duration-100 cursor-pointer select-none border-b-4",
                  pressed[key]
                    ? "bg-red-600 border-red-900 text-white scale-95 translate-y-0.5 border-b-2"
                    : "bg-neutral-700 border-neutral-900 text-neutral-200 hover:bg-neutral-600",
                ].join(" ")}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="text-neutral-600 text-xs mt-4">{t.kbHint}</p>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
        }
      `}</style>
    </div>
  );
}

/* ─── PunchBag ───────────────────────────────────────────────── */
function PunchBag({ t }: { t: typeof T["en"] }) {
  const [swingDir, setSwingDir]   = useState(0);
  const [punches, setPunches]     = useState(0);
  const [impacts, setImpacts]     = useState<{ id: number; x: number; y: number }[]>([]);
  const iCounter                  = useRef(0);
  const swingTimer                = useRef<ReturnType<typeof setTimeout> | null>(null);

  const damage = punches >= 80 ? 4 : punches >= 50 ? 3 : punches >= 25 ? 2 : punches >= 10 ? 1 : 0;

  const statusIdx =
    punches === 0   ? 0 :
    punches < 10    ? 1 :
    punches < 30    ? 2 :
    punches < 60    ? 3 :
    punches < 90    ? 4 : 5;

  function punch(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const dir = swingDir === 0 ? (Math.random() > 0.5 ? 1 : -1) : -swingDir;
    setSwingDir(dir as -1 | 1);
    setPunches(p => p + 1);

    const newImpact = { id: iCounter.current++, x: Math.random() * 60 + 20, y: Math.random() * 40 + 20 };
    setImpacts(p => [...p.slice(-8), newImpact]);
    setTimeout(() => setImpacts(p => p.filter(i => i.id !== newImpact.id)), 400);

    if (swingTimer.current) clearTimeout(swingTimer.current);
    swingTimer.current = setTimeout(() => setSwingDir(0), 600);
  }

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <div className="text-5xl font-black text-red-500">{punches}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">{t.punches}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-orange-400">{t.bagLabels[damage]}</div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">{t.aiStatus}</div>
        </div>
      </div>

      {/* Rope */}
      <div className="w-1.5 h-12 bg-neutral-600 rounded mx-auto" />

      {/* Bag */}
      <div
        className="relative cursor-pointer"
        style={{
          transform: `rotate(${swingDir * 18}deg)`,
          transformOrigin: "top center",
          transition: "transform 0.25s cubic-bezier(.25,.46,.45,.94)",
        }}
        onPointerDown={punch}
      >
        <svg width="180" height="280" viewBox="0 0 180 280" className="drop-shadow-2xl">
          <ellipse cx="90" cy="160" rx="72" ry="110"
            fill={damage >= 4 ? "#7f1d1d" : damage >= 3 ? "#991b1b" : damage >= 2 ? "#b91c1c" : "#dc2626"}
          />
          <ellipse cx="90" cy="55" rx="40" ry="18" fill="#1a1a1a" />
          <rect x="20" y="100" width="140" height="10" rx="5" fill="#1a1a1a" opacity="0.5" />
          <rect x="20" y="175" width="140" height="10" rx="5" fill="#1a1a1a" opacity="0.5" />
          <rect x="20" y="245" width="140" height="10" rx="5" fill="#1a1a1a" opacity="0.5" />
          <rect x="52" y="120" width="76" height="66" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <rect x="62" y="132" width="20" height="16" rx="3"
            fill={damage >= 2 ? "#ef4444" : "#22d3ee"}
            opacity={damage >= 4 ? 0.3 : 1}
          />
          <rect x="98" y="132" width="20" height="16" rx="3"
            fill={damage >= 2 ? "#ef4444" : "#22d3ee"}
            opacity={damage >= 4 ? 0.3 : 1}
          />
          <rect x="69" y="136" width="6" height="8" rx="2" fill="#0f172a" opacity={damage >= 4 ? 0 : 1} />
          <rect x="105" y="136" width="6" height="8" rx="2" fill="#0f172a" opacity={damage >= 4 ? 0 : 1} />
          <line x1="90" y1="120" x2="90" y2="108" stroke="#475569" strokeWidth="2" />
          <circle cx="90" cy="105" r="5" fill="#22d3ee" opacity={damage >= 3 ? 0.3 : 1} />
          {damage < 2 ? (
            <path d="M 68 162 Q 90 174 112 162" stroke="#22d3ee" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : damage < 4 ? (
            <path d="M 68 170 Q 90 160 112 170" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : (
            <line x1="68" y1="165" x2="112" y2="165" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          )}
          {damage >= 1 && <line x1="110" y1="110" x2="135" y2="145" stroke="#fca5a5" strokeWidth="2" opacity="0.6" />}
          {damage >= 2 && <line x1="45"  y1="200" x2="80"  y2="170" stroke="#fca5a5" strokeWidth="2" opacity="0.6" />}
          {damage >= 3 && <line x1="90"  y1="90"  x2="60"  y2="130" stroke="#fca5a5" strokeWidth="3" opacity="0.7" />}
          {damage >= 4 && (
            <>
              <line x1="30" y1="140" x2="150" y2="200" stroke="#fca5a5" strokeWidth="4" opacity="0.5" />
              <line x1="150" y1="140" x2="30" y2="200" stroke="#fca5a5" strokeWidth="4" opacity="0.5" />
            </>
          )}
        </svg>

        {impacts.map(imp => (
          <div
            key={imp.id}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${imp.x}%`,
              top: `${imp.y}%`,
              transform: "translate(-50%,-50%)",
              animation: "impactPop 0.4s ease-out forwards",
            }}
          >
            💥
          </div>
        ))}
      </div>

      <p className="text-neutral-500 text-sm mt-6 text-center">{t.bagStatus[statusIdx]}</p>

      <style>{`
        @keyframes impactPop {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(0.5); }
          50%  { opacity: 1; transform: translate(-50%,-50%) scale(1.4); }
          100% { opacity: 0; transform: translate(-50%,-70%) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─── BrickBreaker ───────────────────────────────────────────── */
const CRACK_PATHS = [
  [],
  ["M 100 80 L 120 120 L 95 150"],
  ["M 100 80 L 120 120 L 95 150", "M 80 100 L 60 140 L 85 170"],
  ["M 100 80 L 120 120 L 95 150", "M 80 100 L 60 140 L 85 170", "M 110 170 L 140 200 L 120 230"],
  ["M 100 80 L 120 120 L 95 150", "M 80 100 L 60 140 L 85 170", "M 110 170 L 140 200 L 120 230", "M 50 150 L 90 200 L 70 240"],
  ["M 100 80 L 120 120 L 95 150", "M 80 100 L 60 140 L 85 170", "M 110 170 L 140 200 L 120 230", "M 50 150 L 90 200 L 70 240", "M 130 90 L 110 130 L 140 160"],
];

function BrickBreaker({ t }: { t: typeof T["en"] }) {
  const [cracks, setCracks]       = useState(0);
  const [shaking, setShaking]     = useState(false);
  const [exploded, setExploded]   = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const pRef = useRef(0);

  const maxCracks = CRACK_PATHS.length - 1;

  function hit() {
    if (exploded) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 300);

    if (cracks >= maxCracks) {
      setExploded(true);
      const newParticles = Array.from({ length: 24 }, () => ({
        id: pRef.current++,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.7) * 80,
      }));
      setParticles(newParticles);
    } else {
      setCracks(c => c + 1);
    }
  }

  function reset() {
    setCracks(0);
    setExploded(false);
    setShaking(false);
    setParticles([]);
  }

  const brickFill = exploded
    ? "#7f1d1d"
    : cracks >= 4 ? "#991b1b" : cracks >= 2 ? "#b91c1c" : "#c2410c";

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      <div className="text-center">
        <div className="text-4xl font-black text-orange-500">{cracks}/{maxCracks}</div>
        <div className="text-xs text-neutral-500 uppercase tracking-widest">{t.cracks}</div>
      </div>

      <div
        className="relative flex items-center justify-center cursor-pointer"
        onClick={hit}
        style={{ width: 200, height: 300 }}
      >
        {!exploded ? (
          <div style={{ animation: shaking ? "brickShake 0.3s ease-in-out" : "none" }}>
            <svg width="200" height="300" viewBox="0 0 200 300">
              <defs>
                <pattern id="brickTex" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="10" height="10" fill="white" opacity="0.06" />
                  <rect x="10" y="10" width="10" height="10" fill="white" opacity="0.06" />
                </pattern>
              </defs>
              <rect x="10" y="30" width="180" height="240" rx="8" fill={brickFill} />
              <rect x="10" y="100" width="180" height="7" fill="#7c2d12" opacity="0.4" />
              <rect x="10" y="200" width="180" height="7" fill="#7c2d12" opacity="0.4" />
              <rect x="10" y="30" width="180" height="240" rx="8" fill="url(#brickTex)" />
              {CRACK_PATHS[cracks].map((d, i) => (
                <path
                  key={i} d={d}
                  stroke="#fca5a5" strokeWidth={2 + i * 0.5}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: "crackIn 0.25s ease-out" }}
                />
              ))}
              <text
                x="100" y="165" textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="56" fontWeight="900" fontFamily="sans-serif"
                opacity={Math.max(0.2, 0.9 - cracks * 0.14)}
              >
                AI
              </text>
            </svg>
          </div>
        ) : (
          <div className="relative" style={{ width: 200, height: 300 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl">💥</span>
            </div>
            {particles.map(p => (
              <div
                key={p.id}
                className="absolute w-4 h-3 rounded"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  backgroundColor: ["#dc2626","#b91c1c","#c2410c","#92400e"][p.id % 4],
                  animation: "scatter 1s ease-out forwards",
                  ["--vx" as string]: `${p.vx}px`,
                  ["--vy" as string]: `${p.vy}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-neutral-400 font-medium text-center">
        {exploded ? t.destroyed : t.brickComments[cracks]}
      </p>

      {exploded && (
        <button
          onClick={reset}
          className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-all cursor-pointer"
        >
          {t.another}
        </button>
      )}

      <style>{`
        @keyframes brickShake {
          0%   { transform: translate(0,0) rotate(0); }
          20%  { transform: translate(-4px,2px) rotate(-1deg); }
          40%  { transform: translate(4px,-2px) rotate(1deg); }
          60%  { transform: translate(-3px,1px) rotate(-0.5deg); }
          80%  { transform: translate(3px,-1px) rotate(0.5deg); }
          100% { transform: translate(0,0) rotate(0); }
        }
        @keyframes crackIn {
          from { stroke-dasharray: 500; stroke-dashoffset: 500; }
          to   { stroke-dasharray: 500; stroke-dashoffset: 0; }
        }
        @keyframes scatter {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--vx),var(--vy)) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
