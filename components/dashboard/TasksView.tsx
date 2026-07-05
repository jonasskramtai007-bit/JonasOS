"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "./Pill";
import type { PillTone } from "./Pill";
import { api } from "@/lib/api-client";
import type { Task, Urgency } from "@/lib/types";

const COLUMNS: { name: string; match: (t: Task) => boolean }[] = [
  { name: "BACKLOG", match: (t) => !t.completed_at && (t.urgency === "month" || t.urgency === "someday") },
  { name: "THIS WEEK", match: (t) => !t.completed_at && t.urgency === "week" },
  { name: "TODAY", match: (t) => !t.completed_at && t.urgency === "today" },
  { name: "DONE", match: (t) => !!t.completed_at },
];

const URGENCY_TONE: Record<Urgency, PillTone> = {
  today: "warn",
  week: "warn",
  month: "muted",
  someday: "muted",
};

function pill(task: Task): { tone: PillTone; label: string } {
  if (task.completed_at) return { tone: "muted", label: "DONE" };
  if (task.key) return { tone: "accent", label: "KEY" };
  return { tone: URGENCY_TONE[task.urgency], label: task.urgency.toUpperCase() };
}

function TaskMeta({ task, onToggle, onDelete }: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const p = pill(task);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {task.category && (
        <span className="rounded-[5px] bg-(--wash) px-[7px] py-[2px] font-mono text-[9px] tracking-[1px] text-ink-2">
          {task.category.toUpperCase()}
        </span>
      )}
      <Pill tone={p.tone}>{p.label}</Pill>
      <span className="ml-auto flex gap-2">
        <button
          onClick={onToggle}
          className="cursor-pointer font-mono text-[10px] text-ink-2 hover:text-accent"
        >
          {task.completed_at ? "↺" : "✓"}
        </button>
        <button
          onClick={onDelete}
          aria-label={`delete ${task.title}`}
          className="cursor-pointer font-mono text-[10px] text-ink-1 hover:text-danger"
        >
          ✕
        </button>
      </span>
    </div>
  );
}

function NewTaskForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("week");
  const [category, setCategory] = useState("");
  const [key, setKey] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await api("/api/tasks", "POST", { title, urgency, category, key });
      router.refresh();
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-[22px] flex items-center gap-[10px] rounded-[12px] border border-(--accent-line) bg-(--surf-1) p-[14px]">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="task title…"
        className="flex-1 rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-3 py-[9px] text-[13px] text-ink-4 outline-none focus:border-(--accent-line)"
      />
      <select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value as Urgency)}
        className="rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-2 py-[9px] font-mono text-[11px] text-ink-3 outline-none"
      >
        <option value="today">TODAY</option>
        <option value="week">WEEK</option>
        <option value="month">MONTH</option>
        <option value="someday">SOMEDAY</option>
      </select>
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="category"
        className="w-[110px] rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-3 py-[9px] font-mono text-[11px] text-ink-4 outline-none focus:border-(--accent-line)"
      />
      <label className="flex cursor-pointer items-center gap-[6px] font-mono text-[10px] tracking-[1px] text-ink-2">
        <input type="checkbox" checked={key} onChange={(e) => setKey(e.target.checked)} />
        KEY
      </label>
      <button
        onClick={submit}
        disabled={busy || !title.trim()}
        className="cursor-pointer rounded-[9px] bg-accent px-4 py-[9px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent disabled:opacity-50"
      >
        ADD
      </button>
      <button
        onClick={onDone}
        className="cursor-pointer px-1 font-mono text-[11px] text-ink-1 hover:text-ink-3"
      >
        ✕
      </button>
    </div>
  );
}

export function TasksView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q),
    );
  }, [tasks, filter]);

  async function toggle(task: Task) {
    await api(`/api/tasks/${task.id}`, "PATCH", { completed: !task.completed_at });
    router.refresh();
  }

  async function remove(task: Task) {
    await api(`/api/tasks/${task.id}`, "DELETE");
    router.refresh();
  }

  const columns = COLUMNS.map((col) => ({
    name: col.name,
    cards: filtered.filter(col.match).slice(0, col.name === "DONE" ? 10 : 50),
  }));

  return (
    <div>
      <div className="mb-[22px] flex items-center gap-[14px]">
        <div className="flex flex-1 items-center gap-[7px] font-mono text-[11px] tracking-[1.6px]">
          <span className="text-accent-soft">{"//"}</span>
          <span className="text-ink-3">TASKS</span>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter tasks…"
          className="w-[220px] rounded-[9px] border border-(--line-strong) bg-(--surf-3) px-3 py-[9px] font-mono text-[11px] text-ink-4 outline-none focus:border-(--accent-line)"
        />
        <div className="flex rounded-[9px] border border-(--line-strong) bg-(--wash) p-[3px]">
          {(["kanban", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`cursor-pointer rounded-[6px] px-3 py-[6px] font-mono text-[10px] tracking-[1px] ${
                view === mode ? "bg-(--accent-dim) text-accent" : "text-ink-2"
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="cursor-pointer rounded-[9px] bg-accent px-4 py-[9px] font-mono text-[10.5px] font-semibold tracking-[1.5px] text-on-accent"
        >
          + NEW
        </button>
      </div>

      {adding && <NewTaskForm onDone={() => setAdding(false)} />}

      {tasks.length === 0 && !adding ? (
        <div className="rounded-[12px] border border-(--line-soft) bg-(--surf-2) p-8 text-center text-[13px] text-ink-1">
          No tasks yet — hit + NEW to add the first one.
        </div>
      ) : view === "kanban" ? (
        <div className="grid grid-cols-4 items-start gap-4">
          {columns.map((column) => (
            <div
              key={column.name}
              className="rounded-[12px] border border-(--line-soft) bg-(--surf-2) p-[14px]"
            >
              <div className="mb-[14px] flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[1.5px] text-ink-3">
                  {column.name}
                </span>
                <span className="font-mono text-[10px] text-ink-1">
                  {column.cards.length}
                </span>
              </div>
              <div className="flex flex-col gap-[10px]">
                {column.cards.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[10px] border border-(--line) bg-(--surf-4) p-[13px]"
                  >
                    <div
                      className={`mb-[11px] text-[13.5px] leading-[1.35] ${
                        task.completed_at ? "text-ink-1 line-through" : "text-ink-4"
                      }`}
                    >
                      {task.title}
                    </div>
                    <TaskMeta
                      task={task}
                      onToggle={() => toggle(task)}
                      onDelete={() => remove(task)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-(--line-soft) bg-(--surf-2)">
          {columns.flatMap((column) =>
            column.cards.map((task) => {
              const p = pill(task);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-[14px] border-b border-(--line-soft) px-[18px] py-[14px]"
                >
                  <span className="w-20 font-mono text-[9px] tracking-[1px] text-ink-1">
                    {column.name}
                  </span>
                  <span
                    className={`flex-1 text-[14px] ${
                      task.completed_at ? "text-ink-1 line-through" : "text-ink-4"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.category && (
                    <span className="rounded-[5px] bg-(--wash) px-[7px] py-[2px] font-mono text-[9px] tracking-[1px] text-ink-2">
                      {task.category.toUpperCase()}
                    </span>
                  )}
                  <Pill tone={p.tone}>{p.label}</Pill>
                  <button
                    onClick={() => toggle(task)}
                    className="cursor-pointer font-mono text-[10px] text-ink-2 hover:text-accent"
                  >
                    {task.completed_at ? "↺" : "✓"}
                  </button>
                  <button
                    onClick={() => remove(task)}
                    className="cursor-pointer font-mono text-[10px] text-ink-1 hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
