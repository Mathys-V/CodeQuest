#!/usr/bin/env python3
import sys
import json
import time
import ast
import statistics
import traceback
from copy import deepcopy

# Liste des modules interdits pour raison de sécurité
FORBIDDEN_MODULES = {
    "os", "sys", "subprocess", "socket", "urllib", "requests", "shutil",
    "pathlib", "ctypes", "importlib", "pickle", "shelve", "builtins",
    "pty", "commands", "posix", "nt", "_thread", "threading", "multiprocessing"
}

FORBIDDEN_CALLS = {
    "eval", "exec", "compile", "open", "__import__", "globals", "locals"
}

def analyze_ast(code_str: str):
    """Vérifie statiquement l'absence d'appels système ou d'imports malveillants."""
    try:
        tree = ast.parse(code_str)
    except SyntaxError as e:
        return f"Erreur de syntaxe : {e}"

    for node in ast.walk(tree):
        # Vérification des imports
        if isinstance(node, ast.Import):
            for alias in node.names:
                root_module = alias.name.split(".")[0]
                if root_module in FORBIDDEN_MODULES:
                    return f"Import interdit détecté : '{alias.name}'"
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                root_module = node.module.split(".")[0]
                if root_module in FORBIDDEN_MODULES:
                    return f"Import interdit détecté : '{node.module}'"

        # Vérification des fonctions built-in dangereuses
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
                return f"Appel de fonction interdit : '{node.func.id}()'"

    return None

def execute():
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input)
    except Exception as e:
        print(json.dumps({
            "status": "ERROR",
            "error": f"Payload JSON invalide : {str(e)}",
            "allPassed": False,
            "results": [],
            "medianCpuTimeMs": 0,
            "allCpuTimesMs": []
        }))
        return

    code = payload.get("code", "")
    entrypoint = payload.get("entrypoint", "sort_list")
    test_cases = payload.get("tests", [])
    runs_count = max(1, min(payload.get("runs", 5), 10))

    # 1. Analyse statique de sécurité
    security_error = analyze_ast(code)
    if security_error:
        print(json.dumps({
            "status": "SECURITY_VIOLATION",
            "error": security_error,
            "allPassed": False,
            "results": [],
            "medianCpuTimeMs": 0,
            "allCpuTimesMs": []
        }))
        return

    # 2. Compilation et chargement du code utilisateur dans un namespace isolé
    user_globals = {
        "__builtins__": {
            k: v for k, v in __builtins__.__dict__.items()
            if k not in FORBIDDEN_CALLS and not k.startswith("__")
        }
    }
    user_locals = {}

    try:
        compiled_code = compile(code, "<user_code>", "exec")
        exec(compiled_code, user_globals, user_locals)
    except Exception as e:
        print(json.dumps({
            "status": "RUNTIME_ERROR",
            "error": f"Erreur lors de la compilation/définition du code : {str(e)}",
            "allPassed": False,
            "results": [],
            "medianCpuTimeMs": 0,
            "allCpuTimesMs": []
        }))
        return

    target_func = user_locals.get(entrypoint) or user_globals.get(entrypoint)
    if not target_func or not callable(target_func):
        print(json.dumps({
            "status": "RUNTIME_ERROR",
            "error": f"La fonction '{entrypoint}' est introuvable ou n'est pas appelable.",
            "allPassed": False,
            "results": [],
            "medianCpuTimeMs": 0,
            "allCpuTimesMs": []
        }))
        return

    # 3. Exécution répétée pour mesurer le temps CPU médian (5 exécutions selon le spec)
    all_cpu_times_ms = []
    last_test_results = []
    all_passed = True

    for run_idx in range(runs_count):
        run_cpu_start = time.process_time()
        current_run_results = []

        for test in test_cases:
            test_id = test.get("id", f"test_{len(current_run_results)}")
            input_val = deepcopy(test.get("input"))
            expected = test.get("expected")
            is_hidden = test.get("isHidden", False)

            t0 = time.process_time()
            try:
                # Si input_val est une liste de paramètres ou une valeur unique
                if isinstance(input_val, dict) and "args" in input_val:
                    actual = target_func(*input_val["args"])
                elif isinstance(input_val, list) and not isinstance(expected, list):
                    actual = target_func(*input_val)
                else:
                    actual = target_func(input_val)

                t1 = time.process_time()
                duration_ms = (t1 - t0) * 1000.0
                passed = (actual == expected)
                error_msg = None
            except Exception as e:
                t1 = time.process_time()
                duration_ms = (t1 - t0) * 1000.0
                passed = False
                actual = None
                error_msg = f"{type(e).__name__}: {str(e)}"

            if not passed:
                all_passed = False

            current_run_results.append({
                "testId": test_id,
                "passed": passed,
                "durationMs": round(duration_ms, 4),
                "actual": "<résultat masqué>" if is_hidden else actual,
                "expected": "<attendu masqué>" if is_hidden else expected,
                "error": error_msg,
                "isHidden": is_hidden
            })

        run_cpu_end = time.process_time()
        total_run_cpu_ms = (run_cpu_end - run_cpu_start) * 1000.0
        all_cpu_times_ms.append(round(total_run_cpu_ms, 4))
        last_test_results = current_run_results

    median_cpu_time_ms = round(statistics.median(all_cpu_times_ms), 4)

    output = {
        "status": "SUCCESS" if all_passed else "FAILED",
        "allPassed": all_passed,
        "results": last_test_results,
        "medianCpuTimeMs": median_cpu_time_ms,
        "allCpuTimesMs": all_cpu_times_ms,
        "error": None if all_passed else "Certains tests ont échoué."
    }

    print(json.dumps(output))

if __name__ == "__main__":
    execute()
