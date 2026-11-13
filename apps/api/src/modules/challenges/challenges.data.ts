export interface TestCase {
  id: string;
  input: any;
  expected: any;
  isHidden: boolean;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  theme: string;
  difficulty: number; // 1 à 5
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
  referenceSolutions: {
    python: string;
    javascript: string;
  };
}

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "challenge-tri-bulles",
    slug: "tri-a-bulles",
    title: "Le Dédale des Tris : Réparation du Tri à Bulles",
    theme: "Tris et listes",
    difficulty: 1,
    statement: `### Mission Runner
L'IA corrompue **ORACLE** a désordonné les registres de mémoire du secteur 01.
Votre objectif est d'écrire une fonction qui prend en entrée une liste d'entiers et retourne cette liste triée par ordre croissant.

**Contraintes :**
- Complexité temporelle attendue : $\\mathcal{O}(n^2)$ au pire, mais doit trier correctement tous les cas.
- Signature attendue :
  - Python : \`def sort_list(lst: list[int]) -> list[int]:\`
  - JavaScript : \`function sortList(arr)\``,
    starterCode: {
      python: `def sort_list(lst):\n    # Écrivez votre algorithme de tri ci-dessous\n    arr = list(lst)\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr`,
      javascript: `function sortList(arr) {\n    // Écrivez votre algorithme de tri ci-dessous\n    const res = [...arr];\n    for (let i = 0; i < res.length; i++) {\n        for (let j = 0; j < res.length - i - 1; j++) {\n            if (res[j] > res[j + 1]) {\n                [res[j], res[j + 1]] = [res[j + 1], res[j]];\n            }\n        }\n    }\n    return res;\n}`
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
      { id: "test_basic_1", input: [5, 2, 8, 1, 9], expected: [1, 2, 5, 8, 9], isHidden: false },
      { id: "test_empty", input: [], expected: [], isHidden: false },
      { id: "test_single", input: [42], expected: [42], isHidden: false },
      { id: "test_negatives", input: [-5, 10, -2, 0, 3], expected: [-5, -2, 0, 3, 10], isHidden: false },
      { id: "test_duplicates", input: [3, 1, 3, 2, 1], expected: [1, 1, 2, 3, 3], isHidden: false },
      // Tests cachés
      { id: "test_hidden_already_sorted", input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isHidden: true },
      { id: "test_hidden_reverse_sorted", input: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isHidden: true },
      { id: "test_hidden_large", input: [15, 3, 22, 8, 1, 44, 12, 9, 31, 2, 17, 5, 19, 0, 50, 4, 11, 7], expected: [0, 1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 15, 17, 19, 22, 31, 44, 50], isHidden: true }
    ],
    referenceSolutions: {
      python: `def sort_list(lst):\n    return sorted(lst)`,
      javascript: `function sortList(arr) {\n    return [...arr].sort((a,b) => a - b);\n}`
    }
  },
  {
    id: "challenge-tri-fusion",
    slug: "tri-fusion",
    title: "Secteur Alpha : Algorithme Diviser pour Régner (Tri Fusion)",
    theme: "Tris et listes",
    difficulty: 3,
    statement: `### Mission Runner
Les flux de données corrompus par ORACLE sont trop volumineux pour un tri quadratique.
Implémentez un algorithme de **Tri Fusion (Merge Sort)** pour garantir un temps d'exécution en $\\mathcal{O}(n \\log n)$.

**Spécifications :**
- Diviser récursivement la liste en deux sous-listes.
- Fusionner de manière ordonnée les sous-listes triées.
- Gestion des grands volumes d'entiers avec efficacité.`,
    starterCode: {
      python: `def sort_list(lst):\n    if len(lst) <= 1:\n        return lst\n    mid = len(lst) // 2\n    left = sort_list(lst[:mid])\n    right = sort_list(lst[mid:])\n    # À compléter : fusionner left et right\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i])\n            i += 1\n        else:\n            res.append(right[j])\n            j += 1\n    res.extend(left[i:])\n    res.extend(right[j:])\n    return res`,
      javascript: `function sortList(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    const left = sortList(arr.slice(0, mid));\n    const right = sortList(arr.slice(mid));\n    const res = [];\n    let i = 0, j = 0;\n    while (i < left.length && j < right.length) {\n        if (left[i] <= right[j]) res.push(left[i++]);\n        else res.push(right[j++]);\n    }\n    return res.concat(left.slice(i)).concat(right.slice(j));\n}`
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
      { id: "test_fusion_1", input: [38, 27, 43, 3, 9, 82, 10], expected: [3, 9, 10, 27, 38, 43, 82], isHidden: false },
      { id: "test_fusion_empty", input: [], expected: [], isHidden: false },
      { id: "test_fusion_dup", input: [5, 1, 5, 2, 5, 3], expected: [1, 2, 3, 5, 5, 5], isHidden: false },
      // Tests cachés plus volumineux
      {
        id: "test_fusion_hidden_volume",
        input: [100, -50, 400, 20, 0, 15, -100, 999, 12, 45, 67, 89, 23, 1, 7, 8, 9, 2, 3, 4],
        expected: [-100, -50, 0, 1, 2, 3, 4, 7, 8, 9, 12, 15, 20, 23, 45, 67, 89, 100, 400, 999],
        isHidden: true
      }
    ],
    referenceSolutions: {
      python: `def sort_list(lst):\n    return sorted(lst)`,
      javascript: `function sortList(arr) {\n    return [...arr].sort((a,b) => a - b);\n}`
    }
  }
];
