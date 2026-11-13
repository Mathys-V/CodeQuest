const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface TestCase {
  id: string;
  input: any;
  expected: any;
  isHidden?: boolean;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  theme: string;
  difficulty: number;
  statement: string;
  starterCode: {
    python: string;
    javascript: string;
  };
  entrypoint: {
    python: string;
    javascript: string;
  };
  basePoints: number;
  perfMax: number;
  tOptMs: number;
  tMaxMs: number;
  tests: TestCase[];
}

export interface SubmissionResult {
  id: string;
  challengeId: string;
  status: string;
  allPassed: boolean;
  score: {
    validated: boolean;
    basePoints: number;
    perfPoints: number;
    totalScore: number;
    tOptMs: number;
    tMaxMs: number;
    measuredCpuTimeMs: number;
  };
  medianCpuTimeMs: number;
  testResults: {
    testId: string;
    passed: boolean;
    durationMs: number;
    actual: any;
    expected: any;
    error: string | null;
    isHidden?: boolean;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  pseudo: string;
  score: number;
  submissionsCount: number;
  updatedAt: string;
}

// Données locales de secours au cas où le serveur API n'est pas encore démarré
const FALLBACK_CHALLENGES: Challenge[] = [
  {
    id: "challenge-tri-bulles",
    slug: "tri-a-bulles",
    title: "Le Dédale des Tris : Réparation du Tri à Bulles",
    theme: "Tris et listes",
    difficulty: 1,
    statement: "L'IA corrompue ORACLE a désordonné les registres de mémoire du secteur 01.\nÉcrivez une fonction qui trie une liste d'entiers par ordre croissant.",
    starterCode: {
      python: "def sort_list(lst):\n    arr = list(lst)\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr",
      javascript: "function sortList(arr) {\n    const res = [...arr];\n    for (let i = 0; i < res.length; i++) {\n        for (let j = 0; j < res.length - i - 1; j++) {\n            if (res[j] > res[j + 1]) {\n                [res[j], res[j + 1]] = [res[j + 1], res[j]];\n            }\n        }\n    }\n    return res;\n}"
    },
    entrypoint: {
      python: "sort_list",
      javascript: "sortList"
    },
    basePoints: 100,
    perfMax: 50,
    tOptMs: 1.0,
    tMaxMs: 50.0,
    tests: [
      { id: "test_basic_1", input: [5, 2, 8, 1, 9], expected: [1, 2, 5, 8, 9] },
      { id: "test_empty", input: [], expected: [] },
      { id: "test_single", input: [42], expected: [42] },
      { id: "test_negatives", input: [-5, 10, -2, 0, 3], expected: [-5, -2, 0, 3, 10] }
    ]
  },
  {
    id: "challenge-tri-fusion",
    slug: "tri-fusion",
    title: "Secteur Alpha : Tri Fusion (Diviser pour Régner)",
    theme: "Tris et listes",
    difficulty: 3,
    statement: "Implémentez un Tri Fusion pour traiter les flux volumineux en temps O(n log n).",
    starterCode: {
      python: "def sort_list(lst):\n    if len(lst) <= 1:\n        return lst\n    mid = len(lst) // 2\n    left = sort_list(lst[:mid])\n    right = sort_list(lst[mid:])\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i])\n            i += 1\n        else:\n            res.append(right[j])\n            j += 1\n    res.extend(left[i:])\n    res.extend(right[j:])\n    return res",
      javascript: "function sortList(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    const left = sortList(arr.slice(0, mid));\n    const right = sortList(arr.slice(mid));\n    const res = [];\n    let i = 0, j = 0;\n    while (i < left.length && j < right.length) {\n        if (left[i] <= right[j]) res.push(left[i++]);\n        else res.push(right[j++]);\n    }\n    return res.concat(left.slice(i)).concat(right.slice(j));\n}"
    },
    entrypoint: {
      python: "sort_list",
      javascript: "sortList"
    },
    basePoints: 300,
    perfMax: 150,
    tOptMs: 2.5,
    tMaxMs: 40.0,
    tests: [
      { id: "test_fusion_1", input: [38, 27, 43, 3, 9, 82, 10], expected: [3, 9, 10, 27, 38, 43, 82] }
    ]
  }
];

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/challenges`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("API indisponible, chargement des défis locaux :", e);
  }
  return FALLBACK_CHALLENGES;
}

export async function submitChallengeCode(
  challengeId: string,
  payload: { code: string; language: 'python' | 'javascript'; pseudo?: string }
): Promise<SubmissionResult> {
  const res = await fetch(`${API_BASE_URL}/challenges/${challengeId}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur serveur (${res.status})`);
  }

  return await res.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/leaderboards/players`);
    if (res.ok) {
      const data = await res.json();
      return data.leaderboard || [];
    }
  } catch (e) {
    console.warn("API Leaderboard indisponible :", e);
  }
  return [
    { rank: 1, userId: "u1", pseudo: "CipherRunner", score: 250, submissionsCount: 4, updatedAt: new Date().toISOString() },
    { rank: 2, userId: "u2", pseudo: "GhostInTheShell", score: 180, submissionsCount: 2, updatedAt: new Date().toISOString() }
  ];
}
