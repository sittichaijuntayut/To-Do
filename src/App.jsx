import { useMemo, useState } from "react";
import {
  Plus, Trash2, Pencil, Check, X, Search, CalendarDays, Briefcase, User,
  ShoppingCart, HeartPulse, LayoutGrid, ListChecks,
} from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-green-100 text-green-700", bar: "border-l-green-400" },
  medium: { label: "กลาง", badge: "bg-orange-100 text-orange-700", bar: "border-l-orange-400" },
  high: { label: "สูง", badge: "bg-rose-100 text-rose-700", bar: "border-l-rose-500" },
};

const CATEGORIES = {
  work: { label: "งาน", icon: Briefcase, badge: "bg-blue-100 text-blue-700" },
  personal: { label: "ส่วนตัว", icon: User, badge: "bg-purple-100 text-purple-700" },
  shopping: { label: "ช้อปปิ้ง", icon: ShoppingCart, badge: "bg-pink-100 text-pink-700" },
  health: { label: "สุขภาพ", icon: HeartPulse, badge: "bg-emerald-100 text-emerald-700" },
};

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "completed", label: "เสร็จแล้ว" },
];

const pad = (n) => String(n).padStart(2, "0");
const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const offsetDay = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toStr(d); };
const formatDate = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

const INITIAL = [
  { id: 1, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high", category: "work", due: offsetDay(-1) },
  { id: 2, text: "ประชุมทีมตอนบ่าย", done: false, priority: "medium", category: "work", due: offsetDay(0) },
  { id: 3, text: "ซื้อผักและผลไม้", done: false, priority: "low", category: "shopping", due: offsetDay(2) },
  { id: 4, text: "วิ่งสวนสาธารณะ 30 นาที", done: true, priority: "medium", category: "health", due: "" },
  { id: 5, text: "โทรหาคุณแม่", done: false, priority: "low", category: "personal", due: "" },
];

function DueBadge({ due, done }) {
  if (!due) return null;
  const today = toStr(new Date());
  let cls = "bg-slate-100 text-slate-600";
  let text = formatDate(due);
  if (!done && due < today) { cls = "bg-red-100 text-red-700"; text = `เลยกำหนด · ${text}`; }
  else if (!done && due === today) { cls = "bg-yellow-100 text-yellow-800"; text = "ครบกำหนดวันนี้"; }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      <CalendarDays size={12} /> {text}
    </span>
  );
}

function Donut({ done, active }) {
  const total = done + active;
  const pct = total ? (done / total) * 100 : 0;
  return (
    <svg viewBox="0 0 36 36" className="h-24 w-24 shrink-0 -rotate-90" role="img" aria-label="สัดส่วนสถานะงาน">
      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#fbbf24" strokeWidth="4" opacity={total ? 1 : 0.25} />
      <circle
        cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="4"
        strokeDasharray={`${pct} ${100 - pct}`} className="transition-all duration-500"
      />
      <text
        x="18" y="18" textAnchor="middle" dominantBaseline="central"
        transform="rotate(90 18 18)" className="fill-slate-800 text-[8px] font-bold"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function TodoItem({ todo, leaving, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo);

  const startEdit = () => { setDraft(todo); setEditing(true); };
  const save = () => {
    if (!draft.text.trim()) return;
    onSave(todo.id, { ...draft, text: draft.text.trim() });
    setEditing(false);
  };
  const onKey = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };

  const wrap = `rounded-xl border-l-4 bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-all duration-300 sm:p-4 ${
    PRIORITIES[todo.priority].bar
  } ${leaving ? "translate-x-8 scale-95 opacity-0" : "translate-x-0 opacity-100"}`;

  if (editing) {
    return (
      <li className={wrap}>
        <input
          autoFocus value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          onKeyDown={onKey}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="field">
            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>ความสำคัญ: {v.label}</option>)}
          </select>
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} onKeyDown={onKey} className="field" />
          <div className="ml-auto flex gap-1">
            <button onClick={save} aria-label="บันทึก" className="rounded-lg bg-emerald-500 p-2 text-white hover:bg-emerald-600"><Check size={16} /></button>
            <button onClick={() => setEditing(false)} aria-label="ยกเลิก" className="rounded-lg bg-slate-200 p-2 text-slate-600 hover:bg-slate-300"><X size={16} /></button>
          </div>
        </div>
      </li>
    );
  }

  const Cat = CATEGORIES[todo.category];
  return (
    <li className={wrap}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-emerald-500"
          aria-label="ทำเสร็จแล้ว"
        />
        <div className="min-w-0 flex-1">
          <p
            onDoubleClick={startEdit} title="ดับเบิลคลิกเพื่อแก้ไข"
            className={`cursor-text break-words text-sm sm:text-base ${todo.done ? "text-slate-400 line-through" : "text-slate-800"}`}
          >
            {todo.text}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITIES[todo.priority].badge}`}>
              {PRIORITIES[todo.priority].label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${Cat.badge}`}>
              <Cat.icon size={12} /> {Cat.label}
            </span>
            <DueBadge due={todo.due} done={todo.done} />
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={startEdit} aria-label="แก้ไข" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><Pencil size={16} /></button>
          <button onClick={() => onDelete(todo.id)} aria-label="ลบ" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
        </div>
      </div>
    </li>
  );
}

export default function App() {
  const [todos, setTodos] = useState(INITIAL);
  const [leaving, setLeaving] = useState([]);
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [cat, setCat] = useState("work");
  const [due, setDue] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setTodos((t) => [{ id: Date.now(), text: text.trim(), done: false, priority, category: cat, due }, ...t]);
    setText(""); setDue("");
  };
  const toggle = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const save = (id, data) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, ...data } : x)));
  const remove = (id) => {
    setLeaving((l) => [...l, id]);
    setTimeout(() => {
      setTodos((t) => t.filter((x) => x.id !== id));
      setLeaving((l) => l.filter((x) => x !== id));
    }, 300);
  };
  const clearCompleted = () => setTodos((t) => t.filter((x) => !x.done));

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    return { total, done, active: total - done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [todos]);

  const catCounts = useMemo(() => {
    const c = {};
    Object.keys(CATEGORIES).forEach((k) => (c[k] = todos.filter((t) => t.category === k).length));
    return c;
  }, [todos]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return todos.filter(
      (t) =>
        (filter === "all" || (filter === "active" ? !t.done : t.done)) &&
        (category === "all" || t.category === category) &&
        (!q || t.text.toLowerCase().includes(q))
    );
  }, [todos, filter, category, search]);

  const sideBtn = (active) =>
    `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 lg:ring-0"
    }`;
  const count = (n, active) => (
    <span className={`ml-auto rounded-full px-2 text-xs ${active ? "bg-white/25" : "bg-slate-100 text-slate-500"}`}>{n}</span>
  );

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:py-10">
      <style>{`.field{border-radius:.5rem;border:1px solid #cbd5e1;background:#fff;padding:.4rem .6rem;font-size:.875rem;outline:none}.field:focus{border-color:#818cf8;box-shadow:0 0 0 3px #e0e7ff}`}</style>

      <header className="mb-6 flex items-center gap-3">
        <span className="rounded-xl bg-indigo-600 p-2 text-white"><ListChecks size={24} /></span>
        <h1 className="text-2xl font-bold sm:text-3xl">รายการที่ต้องทำ</h1>
      </header>

      {/* สถิติ */}
      <section className="mb-6 flex flex-col items-center gap-4 rounded-2xl bg-white p-4 shadow-md sm:flex-row sm:p-5">
        <Donut done={stats.done} active={stats.active} />
        <div className="grid w-full flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["งานทั้งหมด", stats.total, "text-slate-800"],
            ["เสร็จแล้ว", stats.done, "text-emerald-600"],
            ["ยังไม่เสร็จ", stats.active, "text-amber-600"],
            ["สำเร็จ", `${stats.pct}%`, "text-indigo-600"],
          ].map(([label, val, color]) => (
            <div key={label} className="rounded-xl bg-slate-50 px-3 py-2 text-center">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* หมวดหมู่ */}
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:rounded-2xl lg:bg-white lg:p-3 lg:shadow-md" aria-label="หมวดหมู่">
            <button onClick={() => setCategory("all")} className={sideBtn(category === "all")}>
              <LayoutGrid size={16} /> ทุกหมวด {count(stats.total, category === "all")}
            </button>
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <button key={k} onClick={() => setCategory(k)} className={sideBtn(category === k)}>
                <c.icon size={16} /> {c.label} {count(catCounts[k], category === k)}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {/* เพิ่มงาน */}
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-md">
            <div className="flex gap-2">
              <input
                value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="เพิ่มงานใหม่..."
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button onClick={add} className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700">
                <Plus size={18} /> <span className="hidden sm:inline">เพิ่ม</span>
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="field">
                {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>ความสำคัญ: {v.label}</option>)}
              </select>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="field">
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays size={16} />
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="field" />
              </label>
            </div>
          </div>

          {/* ค้นหา */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหางาน..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="ล้างคำค้น" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* แท็บกรอง */}
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-200/70 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key} onClick={() => setFilter(f.key)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  filter === f.key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* รายการ */}
          <ul className="space-y-3">
            {visible.map((t) => (
              <TodoItem key={t.id} todo={t} leaving={leaving.includes(t.id)} onToggle={toggle} onDelete={remove} onSave={save} />
            ))}
          </ul>
          {visible.length === 0 && (
            <p className="rounded-2xl bg-white py-10 text-center text-slate-400 shadow-sm">
              {todos.length === 0 ? "ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย" : "ไม่พบงานที่ตรงกับตัวกรอง"}
            </p>
          )}

          {/* ท้ายรายการ */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
            <span className="text-slate-600">เหลืออีก {stats.active} งาน</span>
            <button
              onClick={clearCompleted} disabled={stats.done === 0}
              className="font-medium text-rose-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
            >
              ล้างงานที่เสร็จแล้ว
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
