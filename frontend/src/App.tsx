import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  LayoutDashboard,
  Code2,
  ClipboardCheck,
  Bot,
  BrainCircuit,
  Network,
  GraduationCap,
  BarChart3,
  Trophy,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Send,
  Sparkles,
  Target,
  Clock3,
  BookOpen,
  Database,
  Cpu,
  Globe,
  Layers,
  Save,
} from "lucide-react";

const API_BASE = "/api";

async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("codepilotx_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

/* =========================================================
   TYPES
========================================================= */

type Problem = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  topic?: string;
  starter_code?: Record<string, string>;
};

type AssessmentQuestion = {
  id: number;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

/* =========================================================
   TECHNICAL MCQ QUESTIONS
========================================================= */

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    topic: "Data Structures",
    question:
      "What is the average time complexity of searching for a key in a hash table?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 0,
    explanation:
      "A hash table provides average O(1) lookup when the hash function distributes keys well.",
  },
  {
    id: 2,
    topic: "Algorithms",
    question:
      "What is the time complexity of binary search on a sorted array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 1,
    explanation:
      "Binary search eliminates roughly half of the remaining search space at each step.",
  },
  {
    id: 3,
    topic: "Data Structures",
    question:
      "Which data structure follows the LIFO principle?",
    options: ["Queue", "Stack", "Linked List", "Heap"],
    answer: 1,
    explanation:
      "A stack follows Last-In-First-Out (LIFO): the most recently inserted element is removed first.",
  },
  {
    id: 4,
    topic: "Data Structures",
    question:
      "Which data structure is typically used to implement BFS traversal?",
    options: ["Stack", "Queue", "Heap", "Hash Table"],
    answer: 1,
    explanation:
      "Breadth-first search processes nodes level by level, which naturally uses a queue.",
  },
  {
    id: 5,
    topic: "Algorithms",
    question:
      "What is the worst-case time complexity of Quick Sort?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    answer: 3,
    explanation:
      "Quick Sort can become O(n²) when partitions are extremely unbalanced.",
  },
  {
    id: 6,
    topic: "OOP",
    question:
      "Which OOP concept allows a class to provide different implementations of the same interface or method?",
    options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
    answer: 2,
    explanation:
      "Polymorphism allows the same interface or method call to behave differently depending on the object.",
  },
  {
    id: 7,
    topic: "OOP",
    question:
      "What is encapsulation primarily concerned with?",
    options: [
      "Hiding internal implementation details and controlling access",
      "Creating multiple objects",
      "Sorting objects",
      "Increasing network speed",
    ],
    answer: 0,
    explanation:
      "Encapsulation bundles data and behavior and controls access to an object's internal state.",
  },
  {
    id: 8,
    topic: "Programming",
    question:
      "Which Python data type is immutable?",
    options: ["List", "Dictionary", "Set", "Tuple"],
    answer: 3,
    explanation:
      "Tuples are immutable in Python, meaning their elements cannot be changed after creation.",
  },
  {
    id: 9,
    topic: "Programming",
    question:
      "What does the `finally` block in Python exception handling do?",
    options: [
      "Runs only when an exception occurs",
      "Runs only when no exception occurs",
      "Normally runs regardless of whether an exception occurs",
      "Stops the program immediately",
    ],
    answer: 2,
    explanation:
      "The finally block is normally executed whether an exception occurs or not, making it useful for cleanup.",
  },
  {
    id: 10,
    topic: "DBMS",
    question:
      "Which SQL command removes all rows from a table while keeping the table structure?",
    options: ["DROP", "DELETE", "TRUNCATE", "REMOVE"],
    answer: 2,
    explanation:
      "TRUNCATE removes all rows while preserving the table definition.",
  },
  {
    id: 11,
    topic: "DBMS",
    question:
      "Which normal form removes partial dependency on a composite key?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 1,
    explanation:
      "Second Normal Form removes partial dependencies on part of a composite candidate key.",
  },
  {
    id: 12,
    topic: "DBMS",
    question:
      "Which SQL clause is used to filter groups after GROUP BY?",
    options: ["WHERE", "ORDER BY", "HAVING", "FILTER"],
    answer: 2,
    explanation:
      "HAVING filters grouped results, while WHERE filters individual rows before grouping.",
  },
  {
    id: 13,
    topic: "Operating Systems",
    question:
      "Which scheduling algorithm gives each process a fixed time slice?",
    options: [
      "First Come First Serve",
      "Round Robin",
      "Shortest Job First",
      "Priority Scheduling",
    ],
    answer: 1,
    explanation:
      "Round Robin assigns each process a time quantum and cycles through processes.",
  },
  {
    id: 14,
    topic: "Operating Systems",
    question:
      "Which of the following is a necessary condition for deadlock?",
    options: [
      "Circular wait",
      "Compilation",
      "Caching",
      "Virtualization",
    ],
    answer: 0,
    explanation:
      "Circular wait is one of the four Coffman conditions required for deadlock.",
  },
  {
    id: 15,
    topic: "Operating Systems",
    question:
      "What is virtual memory?",
    options: [
      "A type of CPU cache",
      "A technique that uses disk space to extend apparent memory",
      "A faster RAM technology",
      "A network storage protocol",
    ],
    answer: 1,
    explanation:
      "Virtual memory allows the operating system to use secondary storage as an extension of physical memory.",
  },
  {
    id: 16,
    topic: "Computer Networks",
    question:
      "Which protocol is primarily used to translate domain names into IP addresses?",
    options: ["HTTP", "FTP", "DNS", "SSH"],
    answer: 2,
    explanation:
      "DNS, or Domain Name System, translates human-readable domain names into IP addresses.",
  },
  {
    id: 17,
    topic: "Computer Networks",
    question:
      "Which HTTP status code means 'Not Found'?",
    options: ["200", "301", "404", "500"],
    answer: 2,
    explanation:
      "HTTP 404 indicates that the requested resource could not be found.",
  },
  {
    id: 18,
    topic: "Computer Networks",
    question:
      "Which transport-layer protocol provides reliable, connection-oriented communication?",
    options: ["UDP", "IP", "TCP", "ARP"],
    answer: 2,
    explanation:
      "TCP provides connection-oriented and reliable delivery using acknowledgements and retransmission.",
  },
  {
    id: 19,
    topic: "Complexity",
    question:
      "What is the time complexity of the following loop?\n\nfor i in range(n):\n    for j in range(n):\n        print(i, j)",
    options: ["O(n)", "O(log n)", "O(n²)", "O(2ⁿ)"],
    answer: 2,
    explanation:
      "Both loops execute approximately n times, resulting in n × n = O(n²).",
  },
  {
    id: 20,
    topic: "Software Engineering",
    question:
      "What is the primary purpose of version control systems such as Git?",
    options: [
      "To compile source code",
      "To track and manage changes to files and collaborate",
      "To replace databases",
      "To increase CPU performance",
    ],
    answer: 1,
    explanation:
      "Git tracks changes, supports branching and merging, and enables collaboration between developers.",
  },
];

/* =========================================================
   NAVIGATION
========================================================= */

const navItems = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/problems", "Problems", Code2],
  ["/assessments", "Assessments", ClipboardCheck],
  ["/ai-code-review", "AI Code Review", Bot],
  ["/mistake-fingerprint", "Mistake Fingerprint", BrainCircuit],
  ["/ai-independence", "AI Independence", Network],
  ["/learning-transfer", "Learning Transfer", GraduationCap],
  ["/skill-graph", "Skill Graph", BarChart3],
  ["/learning-debt", "Learning Debt", Clock3],
  ["/curriculum-intelligence", "Curriculum Intelligence", BookOpen],
  ["/code-ownership", "Code Ownership", Layers],
  ["/progress", "Progress", BarChart3],
  ["/leaderboard", "Leaderboard", Trophy],
  ["/profile", "Profile", User],
  ["/settings", "Settings", Settings],
  ["/help", "Help", HelpCircle],
] as const;

/* =========================================================
   SHELL
========================================================= */

function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-950/95 fixed left-0 top-0 bottom-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-slate-800">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Code2 size={21} />
            </div>

            <div className="text-left">
              <div className="font-bold text-lg">CodePilotX</div>
              <div className="text-xs text-slate-500">Learning Platform</div>
            </div>
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const navigate = useNavigate();

  function login() {
    localStorage.setItem("codepilotx_token", crypto.randomUUID());
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-slate-800 bg-slate-900 rounded-2xl p-8">
        <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-5">
          <Code2 size={28} />
        </div>

        <h1 className="text-3xl font-bold">Welcome to CodePilotX</h1>

        <p className="text-slate-400 mt-2 mb-7">
          Practice coding, complete technical assessments, and understand your
          learning progress.
        </p>

        <button
          onClick={login}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-semibold"
        >
          Enter Platform
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   GENERIC PAGE
========================================================= */

function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  useEffect(() => {
    api("/progress")
      .then(setStats)
      .catch(() => setStats(null));

    const saved = localStorage.getItem("codepilotx_assessment_result");

    if (saved) {
      try {
        setAssessmentResult(JSON.parse(saved));
      } catch {
        setAssessmentResult(null);
      }
    }
  }, []);

  return (
    <Page
      title="Dashboard"
      subtitle="Your CodePilotX learning workspace"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={stats?.problems_solved ?? 0}
          icon={<Code2 size={20} />}
        />

        <StatCard
          title="Submissions"
          value={stats?.total_submissions ?? 0}
          icon={<Send size={20} />}
        />

        <StatCard
          title="Assessment Score"
          value={
            assessmentResult
              ? `${assessmentResult.score}%`
              : "Not attempted"
          }
          icon={<ClipboardCheck size={20} />}
        />

        <StatCard
          title="Learning Progress"
          value={
            stats?.progress_percentage != null
              ? `${stats.progress_percentage}%`
              : "0%"
          }
          icon={<Target size={20} />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="text-indigo-400" />
            <h2 className="text-lg font-semibold">
              Technical Assessment
            </h2>
          </div>

          <p className="text-slate-400 text-sm mb-5">
            Test your knowledge across DSA, programming, DBMS, operating
            systems, networking, OOP and software engineering.
          </p>

          <NavLink
            to="/assessments"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium"
          >
            {assessmentResult ? "Retake Assessment" : "Start Assessment"}
            <ChevronRight size={16} />
          </NavLink>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Learning Overview</h2>

          <div className="space-y-3 text-sm">
            <InfoRow
              label="Coding problems"
              value="Practice implementation"
            />
            <InfoRow
              label="Assessment"
              value="Technical MCQs"
            />
            <InfoRow
              label="AI Review"
              value="Code feedback"
            />
            <InfoRow
              label="Mistake Fingerprint"
              value="Error patterns"
            />
          </div>
        </div>
      </div>
    </Page>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>

        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-3">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}

/* =========================================================
   TECHNICAL MCQ ASSESSMENT
========================================================= */

function AssessmentPage() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previousResult, setPreviousResult] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("codepilotx_assessment_result");

    if (saved) {
      try {
        setPreviousResult(JSON.parse(saved));
      } catch {
        setPreviousResult(null);
      }
    }
  }, []);

  const question = assessmentQuestions[current];

  const answeredCount = Object.keys(answers).length;

  const score = useMemo(() => {
    return assessmentQuestions.reduce((total, q) => {
      return total + (answers[q.id] === q.answer ? 1 : 0);
    }, 0);
  }, [answers]);

  function startAssessment() {
    setAnswers({});
    setCurrent(0);
    setFinished(false);
    setResult(null);
    setStarted(true);
  }

  function selectAnswer(optionIndex: number) {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: optionIndex,
    }));
  }

  function submitAssessment() {
    const finalScore = Math.round(
      (score / assessmentQuestions.length) * 100
    );

    const topicStats: Record<
      string,
      { correct: number; total: number }
    > = {};

    assessmentQuestions.forEach((q) => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = {
          correct: 0,
          total: 0,
        };
      }

      topicStats[q.topic].total += 1;

      if (answers[q.id] === q.answer) {
        topicStats[q.topic].correct += 1;
      }
    });

    const assessmentResult = {
      score: finalScore,
      correct: score,
      total: assessmentQuestions.length,
      topicStats,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "codepilotx_assessment_result",
      JSON.stringify(assessmentResult)
    );

    setResult(assessmentResult);
    setPreviousResult(assessmentResult);
    setFinished(true);
  }

  if (!started) {
    return (
      <Page
        title="Technical Assessment"
        subtitle="Test your core computer science and software engineering knowledge"
      >
        <div className="max-w-5xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <ClipboardCheck size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Technical MCQ Assessment
                </h2>

                <p className="text-slate-400 mt-2 max-w-2xl">
                  This assessment is separate from coding problems. It checks
                  your theoretical and technical knowledge through multiple
                  choice questions.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-7">
              <AssessmentInfo
                icon={<ClipboardCheck size={18} />}
                label="Questions"
                value={`${assessmentQuestions.length}`}
              />

              <AssessmentInfo
                icon={<Target size={18} />}
                label="Question Type"
                value="MCQ"
              />

              <AssessmentInfo
                icon={<BookOpen size={18} />}
                label="Topics"
                value="CS Fundamentals"
              />

              <AssessmentInfo
                icon={<Clock3 size={18} />}
                label="Mode"
                value="Self-paced"
              />
            </div>

            <div className="mt-7">
              <h3 className="font-semibold mb-3">
                Topics covered
              </h3>

              <div className="flex flex-wrap gap-2">
                {[
                  "Data Structures",
                  "Algorithms",
                  "OOP",
                  "Programming",
                  "DBMS",
                  "Operating Systems",
                  "Computer Networks",
                  "Complexity",
                  "Software Engineering",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {previousResult && (
              <div className="mt-7 p-5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-sm text-slate-500">
                  Previous attempt
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="text-3xl font-bold text-indigo-400">
                    {previousResult.score}%
                  </div>

                  <div className="text-sm text-slate-400">
                    {previousResult.correct} / {previousResult.total} correct
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={startAssessment}
              className="mt-7 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold"
            >
              <Play size={18} />
              {previousResult ? "Retake Assessment" : "Start Assessment"}
            </button>
          </div>
        </div>
      </Page>
    );
  }

  if (finished && result) {
    return (
      <AssessmentResults
        result={result}
        answers={answers}
        onRetake={startAssessment}
      />
    );
  }

  const progress =
    ((current + 1) / assessmentQuestions.length) * 100;

  return (
    <Page
      title="Technical Assessment"
      subtitle={`Question ${current + 1} of ${assessmentQuestions.length}`}
    >
      <div className="max-w-4xl">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">
                Assessment Progress
              </span>

              <span className="text-slate-300">
                {answeredCount}/{assessmentQuestions.length} answered
              </span>
            </div>

            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                {question.topic}
              </span>

              <span className="text-xs text-slate-500">
                Question {question.id}
              </span>
            </div>

            <h2 className="text-xl font-semibold leading-relaxed whitespace-pre-line">
              {question.question}
            </h2>

            <div className="space-y-3 mt-7">
              {question.options.map((option, index) => {
                const selected = answers[question.id] === index;

                return (
                  <button
                    key={option}
                    onClick={() => selectAnswer(index)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${
                          selected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>

                      <span className="text-slate-200">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() =>
                  setCurrent((value) => Math.max(0, value - 1))
                }
                disabled={current === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {current < assessmentQuestions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrent((value) =>
                      Math.min(
                        assessmentQuestions.length - 1,
                        value + 1
                      )
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={submitAssessment}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium"
                >
                  <CheckCircle2 size={18} />
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function AssessmentInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="text-indigo-400 mb-2">{icon}</div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}

function AssessmentResults({
  result,
  answers,
  onRetake,
}: {
  result: any;
  answers: Record<number, number>;
  onRetake: () => void;
}) {
  return (
    <Page
      title="Assessment Results"
      subtitle="Review your technical knowledge"
    >
      <div className="max-w-5xl space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <div className="text-sm text-slate-500">
                Overall Score
              </div>

              <div className="text-5xl font-bold text-indigo-400 mt-2">
                {result.score}%
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500">
                Correct Answers
              </div>

              <div className="text-3xl font-bold mt-2">
                {result.correct}/{result.total}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500">
                Result
              </div>

              <div className="text-2xl font-bold mt-2">
                {result.score >= 70 ? (
                  <span className="text-emerald-400">
                    Strong Foundation
                  </span>
                ) : result.score >= 50 ? (
                  <span className="text-amber-400">
                    Needs Practice
                  </span>
                ) : (
                  <span className="text-rose-400">
                    More Study Needed
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onRetake}
            className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg font-medium"
          >
            <RotateCcw size={17} />
            Retake Assessment
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">
            Topic Performance
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(result.topicStats).map(
              ([topic, stats]: [string, any]) => {
                const percentage = Math.round(
                  (stats.correct / stats.total) * 100
                );

                return (
                  <div
                    key={topic}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{topic}</span>

                      <span className="text-sm text-slate-400">
                        {stats.correct}/{stats.total}
                      </span>
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          percentage >= 70
                            ? "bg-emerald-500"
                            : percentage >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="text-xs text-slate-500 mt-2">
                      {percentage}%
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">
            Answer Review
          </h2>

          <div className="space-y-4">
            {assessmentQuestions.map((question) => {
              const selected = answers[question.id];
              const correct = selected === question.answer;

              return (
                <div
                  key={question.id}
                  className={`rounded-xl border p-5 ${
                    correct
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <div className="flex gap-3">
                    {correct ? (
                      <CheckCircle2
                        className="text-emerald-400 shrink-0"
                        size={20}
                      />
                    ) : (
                      <XCircle
                        className="text-rose-400 shrink-0"
                        size={20}
                      />
                    )}

                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-2">
                        {question.topic}
                      </div>

                      <h3 className="font-medium whitespace-pre-line">
                        {question.question}
                      </h3>

                      <div className="mt-3 text-sm">
                        <div className="text-slate-400">
                          Your answer:
                        </div>

                        <div
                          className={
                            correct
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }
                        >
                          {selected != null
                            ? question.options[selected]
                            : "Not answered"}
                        </div>
                      </div>

                      {!correct && (
                        <div className="mt-3 text-sm">
                          <div className="text-slate-400">
                            Correct answer:
                          </div>

                          <div className="text-emerald-400">
                            {question.options[question.answer]}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-slate-500 mt-3">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}

/* =========================================================
   PROBLEMS
========================================================= */

function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/problems")
      .then((data) => setProblems(data.items || data || []))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page
      title="Problems"
      subtitle="Practice coding problems"
    >
      {loading ? (
        <div className="text-slate-500">Loading problems...</div>
      ) : problems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400">
          No problems found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <NavLink
              key={problem.id}
              to={`/problems/${problem.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500 transition"
            >
              <div className="flex justify-between gap-3">
                <h2 className="font-semibold">
                  {problem.title}
                </h2>

                <ChevronRight size={18} className="text-slate-500" />
              </div>

              <div className="flex gap-2 mt-4">
                {problem.difficulty && (
                  <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                    {problem.difficulty}
                  </span>
                )}

                {problem.topic && (
                  <span className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-400">
                    {problem.topic}
                  </span>
                )}
              </div>

              {problem.description && (
                <p className="text-sm text-slate-500 mt-4 line-clamp-3">
                  {problem.description}
                </p>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </Page>
  );
}

/* =========================================================
   PROBLEM PAGE
========================================================= */

function ProblemRoute() {
  const id = window.location.pathname.split("/").pop() || "";
  return <ProblemPage id={id} />;
}

function ProblemPage({ id }: { id: string }) {
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [hint, setHint] = useState<any>(null);
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api(`/problems/${id}`)
      .then((data) => {
        setProblem(data);

        const starter =
          data?.starter_code?.python ||
          data?.starter_code?.[language] ||
          "";

        setCode(starter);
      })
      .catch(() => setProblem(null));
  }, [id]);

  useEffect(() => {
    if (problem?.starter_code?.[language]) {
      setCode(problem.starter_code[language]);
    }
  }, [language, problem]);

  async function runCode(submit = false) {
    setLoading(true);
    setResult(null);

    try {
      const data = await api(`/problems/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          language,
          source_code: code,
          submit,
        }),
      });

      setResult(data);

      if (submit) {
        localStorage.setItem(
          "codepilotx_last_problem",
          JSON.stringify({
            id,
            title: problem?.title,
          })
        );
      }
    } catch (error: any) {
      setResult({
        status: "error",
        stderr: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function requestReview() {
    setReview(null);

    try {
      const data = await api("/ai/review", {
        method: "POST",
        body: JSON.stringify({
          problem_id: id,
          language,
          source_code: code,
          test_results: result || {},
          previous_errors: result?.stderr || "",
        }),
      });

      setReview(data);
    } catch (error: any) {
      setReview({
        error: error.message,
      });
    }
  }

  async function requestHint() {
    setHint(null);

    try {
      const data = await api("/ai/hint", {
        method: "POST",
        body: JSON.stringify({
          problem_id: id,
          language,
          source_code: code,
        }),
      });

      setHint(data);
    } catch (error: any) {
      setHint({
        error: error.message,
      });
    }
  }

  async function requestDecision(decisionValue: string) {
    try {
      const data = await api("/ai/decision", {
        method: "POST",
        body: JSON.stringify({
          problem_id: id,
          decision: decisionValue,
          source_code: code,
        }),
      });

      setDecision(data);
    } catch (error: any) {
      setDecision({
        error: error.message,
      });
    }
  }

  if (!problem) {
    return (
      <Page title="Problem">
        <div className="text-slate-400">Loading problem...</div>
      </Page>
    );
  }

  return (
    <Page
      title={problem.title}
      subtitle={problem.description || "Coding problem"}
    >
      <div className="flex justify-between mb-4">
        <button
          onClick={() => navigate("/problems")}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Problems
        </button>

        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between">
            <span className="text-sm text-slate-400">
              {language}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => runCode(false)}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm"
              >
                <Play size={15} />
                Run
              </button>

              <button
                onClick={() => runCode(true)}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg text-sm"
              >
                <Send size={15} />
                Submit
              </button>
            </div>
          </div>

          <Editor
            height="600px"
            language={language === "cpp" ? "cpp" : language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Execution Result</h2>

            {result ? (
              <pre className="text-sm whitespace-pre-wrap text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">
                Run or submit your code to see the result.
              </p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-indigo-400" />
              <h2 className="font-semibold">AI Learning Tools</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={requestReview}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm"
              >
                AI Review
              </button>

              <button
                onClick={requestHint}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
              >
                AI Hint
              </button>

              <button
                onClick={() => requestDecision("accept")}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
              >
                Accept
              </button>

              <button
                onClick={() => requestDecision("modify")}
                className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm"
              >
                Modify
              </button>

              <button
                onClick={() => requestDecision("reject")}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm"
              >
                Reject
              </button>
            </div>
          </div>

          {review && (
            <ResultBox
              title="AI Review"
              data={review}
            />
          )}

          {hint && (
            <ResultBox
              title="AI Hint"
              data={hint}
            />
          )}

          {decision && (
            <ResultBox
              title="AI Decision"
              data={decision}
            />
          )}
        </div>
      </div>
    </Page>
  );
}

function ResultBox({
  title,
  data,
}: {
  title: string;
  data: any;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="font-semibold mb-3">{title}</h3>

      <pre className="text-sm text-slate-300 whitespace-pre-wrap">
        {typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* =========================================================
   MISTAKE FINGERPRINT
========================================================= */

function MistakeFingerprintPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("codepilotx_token");

    fetch(`${API_BASE}/mistake-fingerprint`, {
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
      })
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => {
        console.error("Mistake Fingerprint error:", err);
        setError("Unable to load mistake fingerprint.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Page
      title="Mistake Fingerprint"
      subtitle="Understand recurring submission patterns"
    >
      {loading ? (
        <div className="text-slate-500">
          Loading...
        </div>
      ) : error ? (
        <div className="bg-red-950/30 border border-red-800 rounded-2xl p-5 text-red-300">
          {error}
        </div>
      ) : !data ? (
        <div className="text-slate-500">
          No data available.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            ["Total Submissions", data.total_submissions],
            ["Compilation Errors", data.compilation_errors],
            ["Runtime Errors", data.runtime_errors],
            ["Failed Tests", data.failed_tests],
            ["Slow Submissions", data.slow_submissions],
            [
              "Memory Heavy Submissions",
              data.memory_heavy_submissions,
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <div className="text-sm text-slate-500">
                {label}
              </div>

              <div className="text-3xl font-bold mt-2">
                {value ?? 0}
              </div>
            </div>
          ))}

          {data.patterns && (
            <div className="md:col-span-2 xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">
                Detected Patterns
              </h2>

              <pre className="text-sm whitespace-pre-wrap text-slate-300">
                {JSON.stringify(data.patterns, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}

/* =========================================================
   AI CODE REVIEW PAGE
========================================================= */

function AICodeReviewPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemId, setProblemId] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api("/problems")
      .then((data) => {
        const items = data.items || data || [];
        setProblems(items);

        if (items.length) {
          setProblemId(items[0].id);
        }
      })
      .catch(() => setProblems([]));
  }, []);

  useEffect(() => {
    if (!problemId) return;

    api(`/problems/${problemId}`)
      .then((data) => {
        setCode(
          data?.starter_code?.[language] ||
            data?.starter_code?.python ||
            ""
        );
      })
      .catch(() => {});
  }, [problemId, language]);

  async function reviewCode() {
    if (!problemId) return;

    setLoading(true);
    setReview(null);

    try {
      const data = await api("/ai/review", {
        method: "POST",
        body: JSON.stringify({
          problem_id: problemId,
          language,
          source_code: code,
          test_results: {},
          previous_errors: "",
        }),
      });

      setReview(data);
    } catch (error: any) {
      setReview({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page
      title="AI Code Review"
      subtitle="Get AI feedback on your implementation"
    >
      <div className="grid xl:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex gap-3">
            <select
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm flex-1"
            >
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <Editor
            height="560px"
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ minimap: { enabled: false } }}
          />

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={reviewCode}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg font-medium"
            >
              <Sparkles size={17} />
              {loading ? "Reviewing..." : "Review Code"}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Review</h2>

          {!review ? (
            <p className="text-slate-500">
              Submit your code for AI analysis.
            </p>
          ) : (
            <pre className="text-sm whitespace-pre-wrap text-slate-300">
              {JSON.stringify(review, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </Page>
  );
}

/* =========================================================
   LEARNING TRANSFER
========================================================= */

function LearningTransferPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selected, setSelected] = useState("");
  const [challenge, setChallenge] = useState("");

  useEffect(() => {
    api("/problems")
      .then((data) => {
        const items = data.items || data || [];
        setProblems(items);

        if (items.length) {
          setSelected(items[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function generateChallenge() {
    const source = problems.find((p) => p.id === selected);

    if (!source) return;

    const target =
      problems.find(
        (p) =>
          p.id !== source.id &&
          p.topic &&
          source.topic &&
          p.topic === source.topic
      ) ||
      problems.find((p) => p.id !== source.id);

    if (!target) {
      setChallenge(
        "Solve the selected problem again using a different approach and explain why your approach works."
      );
      return;
    }

    setChallenge(
      `Transfer challenge: After working on "${source.title}", apply the same underlying concepts to "${target.title}". Before coding, identify what concept transfers and what must change in your approach.`
    );
  }

  return (
    <Page
      title="Learning Transfer"
      subtitle="Apply concepts from one problem to another"
    >
      <div className="max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold">
          Transfer Challenge
        </h2>

        <p className="text-slate-400 mt-2">
          Choose a problem you have studied and generate a related challenge
          using another problem from your problem set.
        </p>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-6 w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3"
        >
          {problems.map((problem) => (
            <option key={problem.id} value={problem.id}>
              {problem.title}
            </option>
          ))}
        </select>

        <button
          onClick={generateChallenge}
          className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg"
        >
          <Sparkles size={17} />
          Generate Transfer Challenge
        </button>

        {challenge && (
          <div className="mt-6 p-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-200">
            {challenge}
          </div>
        )}
      </div>
    </Page>
  );
}
function SkillGraphPage() {
  const skills = [
    { name: "Arrays", level: 75, solved: 8, total: 10 },
    { name: "Strings", level: 65, solved: 6, total: 10 },
    { name: "Searching", level: 70, solved: 5, total: 7 },
    { name: "Hashing", level: 60, solved: 4, total: 7 },
    { name: "Stack", level: 45, solved: 2, total: 5 },
    { name: "Linked Lists", level: 40, solved: 2, total: 5 },
    { name: "Dynamic Programming", level: 30, solved: 1, total: 5 },
    { name: "Algorithms", level: 55, solved: 5, total: 10 },
  ];

  return (
    <Page
      title="Skill Graph"
      subtitle="Your skill development overview"
    >
      <div className="grid md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-white">
                  {skill.name}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {skill.solved} of {skill.total} problems solved
                </p>
              </div>

              <span className="text-indigo-400 font-semibold">
                {skill.level}%
              </span>
            </div>

            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${skill.level}%` }}
              />
            </div>

            <div className="flex justify-between mt-3 text-xs text-slate-500">
              <span>Beginner</span>
              <span>Advanced</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">
          Skill Development
        </h2>

        <p className="text-sm text-slate-400">
          Your strongest areas are currently Arrays, Searching, and
          Algorithms. Continue solving problems across different topics
          to build a balanced skill profile.
        </p>
      </div>
    </Page>
  );
}



/* =========================================================
   CURRICULUM INTELLIGENCE
========================================================= */

function CurriculumIntelligencePage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    api("/problems")
      .then((data) => setProblems(data.items || data || []))
      .catch(() => {});
  }, []);

  const groups = useMemo(() => {
    const result: Record<string, Problem[]> = {};

    problems.forEach((problem) => {
      const topic = problem.topic || "General";

      if (!result[topic]) {
        result[topic] = [];
      }

      result[topic].push(problem);
    });

    return result;
  }, [problems]);

  return (
    <Page
      title="Curriculum Intelligence"
      subtitle="Explore your available learning areas"
    >
      {Object.keys(groups).length === 0 ? (
        <div className="text-slate-500">
          No curriculum data available.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Object.entries(groups).map(([topic, items]) => (
            <div
              key={topic}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-indigo-400" size={20} />
                <h2 className="font-semibold">{topic}</h2>
              </div>

              <div className="text-2xl font-bold">
                {items.length}
              </div>

              <div className="text-sm text-slate-500">
                available problems
              </div>

              <div className="mt-4 space-y-2">
                {items.slice(0, 4).map((problem) => (
                  <NavLink
                    key={problem.id}
                    to={`/problems/${problem.id}`}
                    className="flex justify-between items-center p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-sm"
                  >
                    <span>{problem.title}</span>
                    <ChevronRight size={15} />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

/* =========================================================
   CODE OWNERSHIP
========================================================= */

function CodeOwnershipPage() {
  const [problemId, setProblemId] = useState("");
  const [code, setCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    api("/problems")
      .then((data) => {
        const items = data.items || data || [];
        setProblems(items);

        if (items.length) {
          setProblemId(items[0].id);
        }
      })
      .catch(() => {});
  }, []);

  function saveOwnership() {
    const record = {
      problemId,
      confirmed,
      codeLength: code.length,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "codepilotx_ownership",
      JSON.stringify(record)
    );

    setSaved(true);
  }

  return (
    <Page
      title="Code Ownership"
      subtitle="Development-mode self reflection about your code"
    >
      <div className="max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-200">
          This is a development-mode self-check. It records your
          declaration locally; it does not prove authorship or detect
          plagiarism.
        </div>

        <div className="mt-6">
          <label className="text-sm text-slate-400">
            Problem
          </label>

          <select
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
            className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3"
          >
            {problems.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.title}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here for your own reflection..."
          className="mt-5 w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm outline-none focus:border-indigo-500"
        />

        <label className="flex gap-3 items-start mt-5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1"
          />

          <span className="text-sm text-slate-300">
            I can explain the main logic, important decisions, and
            complexity of this code.
          </span>
        </label>

        <button
          onClick={saveOwnership}
          disabled={!confirmed}
          className="mt-5 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-5 py-2.5 rounded-lg"
        >
          <Save size={17} />
          Save Self-Check
        </button>

        {saved && (
          <div className="mt-4 text-emerald-400 text-sm">
            Self-check saved locally.
          </div>
        )}
      </div>
    </Page>
  );
}

/* =========================================================
   GENERIC DATA PAGES
========================================================= */

function DataPage({
  title,
  endpoint,
  subtitle,
}: {
  title: string;
  endpoint: string;
  subtitle?: string;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api(endpoint)
      .then(setData)
      .catch(() => setData(null));
  }, [endpoint]);

  return (
    <Page title={title} subtitle={subtitle}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {data ? (
          <pre className="text-sm whitespace-pre-wrap text-slate-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="text-slate-500">
            No data available yet.
          </div>
        )}
      </div>
    </Page>
  );
}

/* =========================================================
   PROFILE
========================================================= */


function ProfilePage() {
  const [name, setName] = useState(
    localStorage.getItem("codepilotx_name") || "CodePilotX Student"
  );

  const [saved, setSaved] = useState(false);

  function save() {
    localStorage.setItem("codepilotx_name", name);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  const assessment = localStorage.getItem(
    "codepilotx_assessment_result"
  );

  let score = "Not attempted";

  if (assessment) {
    try {
      score = `${JSON.parse(assessment).score}%`;
    } catch {
      score = "Not attempted";
    }
  }

  const initial = name.charAt(0).toUpperCase();

  return (
    <Page
      title="Profile"
      subtitle="Your CodePilotX learning profile"
    >
      <div className="space-y-6">

        {/* Profile Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-slate-900" />

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 -mt-10">

              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 border-4 border-slate-900 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                  {initial}
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-white">
                    {name}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    CodePilotX Student
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● Active Learner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500">
              Assessment
            </p>

            <p className="text-2xl font-bold text-indigo-400 mt-2">
              {score}
            </p>

            <p className="text-xs text-slate-600 mt-1">
              Latest result
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500">
              Problems
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              12
            </p>

            <p className="text-xs text-slate-600 mt-1">
              Available to practice
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500">
              Skills
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              8
            </p>

            <p className="text-xs text-slate-600 mt-1">
              Areas being developed
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500">
              Platform
            </p>

            <p className="text-2xl font-bold text-white mt-2">
              CPX
            </p>

            <p className="text-xs text-slate-600 mt-1">
              CodePilotX
            </p>
          </div>

        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Profile Settings */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Profile Information
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Customize how your profile appears.
                </p>
              </div>

              <span className="text-xs text-slate-600">
                Local profile
              </span>
            </div>

            <label className="block text-sm text-slate-400">
              Display Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
              placeholder="Enter your name"
            />

            <div className="mt-5 flex items-center gap-3">

              <button
                onClick={save}
                className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl font-medium text-white transition"
              >
                Save Changes
              </button>

              {saved && (
                <span className="text-sm text-emerald-400">
                  ✓ Profile saved successfully
                </span>
              )}

            </div>
          </div>

          {/* Account */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-lg font-semibold text-white">
              Account
            </h2>

            <div className="mt-5 space-y-4">

              <div className="bg-slate-950 rounded-xl p-4">
                <p className="text-xs text-slate-500">
                  Account Type
                </p>

                <p className="text-sm text-white mt-1">
                  Student
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl p-4">
                <p className="text-xs text-slate-500">
                  Platform
                </p>

                <p className="text-sm text-white mt-1">
                  CodePilotX
                </p>
              </div>

              <div className="bg-slate-950 rounded-xl p-4">
                <p className="text-xs text-slate-500">
                  Profile Storage
                </p>

                <p className="text-sm text-emerald-400 mt-1">
                  Local browser
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Learning Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Learning Overview
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your current learning areas.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

            <div className="bg-slate-950 rounded-xl p-4">
              <p className="text-sm text-white font-medium">
                Algorithms
              </p>

              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: "55%" }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Developing
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-4">
              <p className="text-sm text-white font-medium">
                Arrays
              </p>

              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Strong
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-4">
              <p className="text-sm text-white font-medium">
                Searching
              </p>

              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: "70%" }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Developing
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-4">
              <p className="text-sm text-white font-medium">
                Dynamic Programming
              </p>

              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: "30%" }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Needs practice
              </p>
            </div>

          </div>
        </div>

      </div>
    </Page>
  );
}



/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage() {
  const [confirmReset, setConfirmReset] = useState(false);

  function resetLocalData() {
    localStorage.removeItem("codepilotx_assessment_result");
    localStorage.removeItem("codepilotx_ownership");
    localStorage.removeItem("codepilotx_last_problem");
    localStorage.removeItem("codepilotx_name");

    setConfirmReset(false);
    window.location.reload();
  }

  return (
    <Page title="Settings" subtitle="Local application settings">
      <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-lg">
          Reset Learning Data
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Clears locally stored assessment results, profile information,
          ownership self-checks, and other demo data.
        </p>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-5 bg-rose-600 hover:bg-rose-500 px-5 py-2.5 rounded-lg"
          >
            Reset Local Data
          </button>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-rose-400 mb-3">
              Are you sure? This cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={resetLocalData}
                className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-lg"
              >
                Confirm Reset
              </button>

              <button
                onClick={() => setConfirmReset(false)}
                className="bg-slate-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
function LearningDebtPage() {
  const areas = [
    {
      name: "Dynamic Programming",
      reason: "Low problem-solving accuracy",
      progress: 30,
      priority: "High",
    },
    {
      name: "Linked Lists",
      reason: "Few problems attempted",
      progress: 40,
      priority: "Medium",
    },
    {
      name: "Stack",
      reason: "Needs more practice",
      progress: 45,
      priority: "Medium",
    },
    {
      name: "Hashing",
      reason: "Some concepts need reinforcement",
      progress: 60,
      priority: "Low",
    },
  ];

  return (
    <Page
      title="Learning Debt"
      subtitle="Areas that may need more practice"
    >
      <div className="space-y-4">
        {areas.map((area) => (
          <div
            key={area.name}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  {area.name}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {area.reason}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  area.priority === "High"
                    ? "bg-red-500/10 text-red-400"
                    : area.priority === "Medium"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                {area.priority}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Current mastery</span>
                <span>{area.progress}%</span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${area.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">
          Recommended Focus
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          Spend more practice time on the areas with lower mastery,
          especially Dynamic Programming and Linked Lists.
        </p>
      </div>
    </Page>
  );
}

/* =========================================================
   HELP
========================================================= */

function HelpPage() {
  const faqs = [
    {
      q: "What is the Assessment section?",
      a: "Assessment contains technical multiple-choice questions. It is separate from the coding Problems section.",
    },
    {
      q: "Does the assessment save my score?",
      a: "Yes. Your latest assessment result is stored in local browser storage and shown on the dashboard.",
    },
    {
      q: "What topics are tested?",
      a: "The current assessment covers data structures, algorithms, OOP, programming, DBMS, operating systems, networking, complexity, and software engineering.",
    },
    {
      q: "Where do I practice actual coding?",
      a: "Use the Problems section. Problems contain a code editor where you can run, submit, and request AI feedback.",
    },
    {
      q: "Does Code Ownership prove that I wrote the code?",
      a: "No. The current ownership feature is a development-mode self-check and should not be treated as authorship verification.",
    },
  ];

  return (
    <Page
      title="Help"
      subtitle="Frequently asked questions"
    >
      <div className="max-w-3xl space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <summary className="cursor-pointer font-medium">
              {faq.q}
            </summary>

            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </Page>
  );
}
function ProgressPage() {
  const stats = [
    {
      label: "Problems Solved",
      value: "12",
      description: "Coding problems completed",
    },
    {
      label: "Assessments",
      value: "1",
      description: "Technical assessments completed",
    },
    {
      label: "Average Score",
      value: "75%",
      description: "Assessment performance",
    },
    {
      label: "Skills Practiced",
      value: "8",
      description: "Different skill areas",
    },
  ];

  const weeklyProgress = [
    { day: "Mon", problems: 2 },
    { day: "Tue", problems: 1 },
    { day: "Wed", problems: 3 },
    { day: "Thu", problems: 2 },
    { day: "Fri", problems: 1 },
    { day: "Sat", problems: 2 },
    { day: "Sun", problems: 1 },
  ];

  return (
    <Page
      title="Progress"
      subtitle="Your learning progress"
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <p className="text-sm text-slate-500">
              {stat.label}
            </p>

            <p className="text-3xl font-bold text-white mt-2">
              {stat.value}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">
          Weekly Activity
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Problems completed this week
        </p>

        <div className="grid grid-cols-7 gap-3 mt-6">
          {weeklyProgress.map((item) => (
            <div
              key={item.day}
              className="text-center"
            >
              <div className="h-32 bg-slate-800 rounded-lg flex items-end justify-center overflow-hidden">
                <div
                  className="w-full bg-indigo-500 rounded-t-lg"
                  style={{
                    height: `${item.problems * 25}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {item.day}
              </p>

              <p className="text-sm text-white mt-1">
                {item.problems}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">
          Overall Progress
        </h2>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">
              Learning journey
            </span>

            <span className="text-indigo-400">
              68%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: "68%" }}
            />
          </div>
        </div>
      </div>
    </Page>
  );
}
function LeaderboardPage() {
  const learners = [
    {
      rank: 1,
      name: "Alex",
      problems: 42,
      assessments: 8,
      score: 920,
    },
    {
      rank: 2,
      name: "Priya",
      problems: 38,
      assessments: 7,
      score: 875,
    },
    {
      rank: 3,
      name: "Rahul",
      problems: 35,
      assessments: 6,
      score: 820,
    },
    {
      rank: 4,
      name: "You",
      problems: 12,
      assessments: 1,
      score: 640,
    },
    {
      rank: 5,
      name: "Sam",
      problems: 10,
      assessments: 2,
      score: 590,
    },
  ];

  return (
    <Page
      title="Leaderboard"
      subtitle="Learning leaderboard"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-slate-800 text-xs text-slate-500 uppercase">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Learner</div>
          <div className="col-span-2 text-center">Problems</div>
          <div className="col-span-2 text-center">Assessments</div>
          <div className="col-span-3 text-right">Score</div>
        </div>

        {learners.map((learner) => (
          <div
            key={learner.rank}
            className={`grid grid-cols-12 gap-4 px-5 py-5 border-b border-slate-800 last:border-b-0 ${
              learner.name === "You"
                ? "bg-indigo-500/10"
                : ""
            }`}
          >
            <div className="col-span-1 font-semibold text-indigo-400">
              #{learner.rank}
            </div>

            <div className="col-span-4">
              <p className="font-semibold text-white">
                {learner.name}
              </p>

              {learner.name === "You" && (
                <span className="text-xs text-indigo-400">
                  Your position
                </span>
              )}
            </div>

            <div className="col-span-2 text-center text-slate-300">
              {learner.problems}
            </div>

            <div className="col-span-2 text-center text-slate-300">
              {learner.assessments}
            </div>

            <div className="col-span-3 text-right font-semibold text-white">
              {learner.score}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">
          Your Ranking
        </h2>

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-3xl font-bold text-indigo-400">
              #4
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Current leaderboard position
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              640
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Learning score
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
}
/* =========================================================
   EMPTY
========================================================= */

function Empty({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <Page title={title}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
        {text}
      </div>
    </Page>
  );
}
function AIIndependencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/ai/independence")
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setError(err.message || "Failed to load AI independence data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Page
        title="AI Independence"
        subtitle="Understand how you use AI while learning"
      >
        <div className="text-slate-400">
          Loading AI independence data...
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page
        title="AI Independence"
        subtitle="Understand how you use AI while learning"
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-red-400">
          {error}
        </div>
      </Page>
    );
  }

  const metrics = [
    {
      label: "Independence Score",
      value:
        data?.independence_score ??
        data?.score ??
        "—",
      description: "Overall AI independence",
    },
    {
      label: "AI Usage",
      value:
        data?.ai_usage ??
        data?.ai_usage_count ??
        "—",
      description: "AI-assisted activities",
    },
    {
      label: "Independent Work",
      value:
        data?.independent_work ??
        data?.independent_solutions ??
        "—",
      description: "Work completed independently",
    },
    {
      label: "AI Dependency",
      value:
        data?.ai_dependency ??
        data?.dependency ??
        "—",
      description: "Estimated dependency level",
    },
  ];

  return (
    <Page
      title="AI Independence"
      subtitle="Understand how you use AI while learning"
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <p className="text-sm text-slate-500">
              {metric.label}
            </p>

            <p className="text-3xl font-bold text-indigo-400 mt-3">
              {typeof metric.value === "number"
                ? metric.value
                : metric.value}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white">
          AI Independence Analysis
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          This dashboard is using the live response from the
          AI Independence backend endpoint.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              Backend Status
            </p>

            <p className="text-green-400 font-semibold mt-1">
              Connected
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              Data Source
            </p>

            <p className="text-indigo-400 font-semibold mt-1">
              AI Independence API
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Raw API Response
        </h2>

        <pre className="bg-slate-950 rounded-lg p-4 overflow-auto text-sm text-slate-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Page>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const token = localStorage.getItem("codepilotx_token");

  if (!token) {
    return <Login />;
  }

  
      return (
    <Shell>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/problems"
          element={<Problems />}
        />

        <Route
          path="/problems/:id"
          element={<ProblemRoute />}
        />

        <Route
          path="/assessments"
          element={<AssessmentPage />}
        />

        <Route
          path="/ai-code-review"
          element={<AICodeReviewPage />}
        />

        <Route
          path="/mistake-fingerprint"
          element={<MistakeFingerprintPage />}
        />

        <Route
  path="/ai-independence"
  element={<AIIndependencePage />}
/>

        <Route
          path="/learning-transfer"
          element={<LearningTransferPage />}
        />

        <Route
  path="/skill-graph"
  element={<SkillGraphPage />}
/>


        <Route
  path="/learning-debt"
  element={<LearningDebtPage />}
/>

        <Route
          path="/curriculum-intelligence"
          element={<CurriculumIntelligencePage />}
        />

        <Route
          path="/code-ownership"
          element={<CodeOwnershipPage />}
        />

       <Route
  path="/progress"
  element={<ProgressPage />}
/>

       <Route
  path="/leaderboard"
  element={<LeaderboardPage />}
/>

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="/help"
          element={<HelpPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </Shell>
  );
}

export default App;