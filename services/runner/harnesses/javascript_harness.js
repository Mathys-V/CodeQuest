#!/usr/bin/env node
const vm = require('vm');
const fs = require('fs');

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function run() {
  let rawInput = '';
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', chunk => {
    rawInput += chunk;
  });

  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(rawInput);
    } catch (err) {
      console.log(JSON.stringify({
        status: 'ERROR',
        error: `Payload JSON invalide : ${err.message}`,
        allPassed: false,
        results: [],
        medianCpuTimeMs: 0,
        allCpuTimesMs: []
      }));
      return;
    }

    const code = payload.code || '';
    const entrypoint = payload.entrypoint || 'sortList';
    const testCases = payload.tests || [];
    const runsCount = Math.max(1, Math.min(payload.runs || 5, 10));

    // 1. Analyse statique basique anti-évasion
    const forbiddenPatterns = [
      /process\./,
      /require\s*\(/,
      /import\s*\(/,
      /child_process/,
      /fs\./,
      /global\./,
      /Function\s*\(/
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        console.log(JSON.stringify({
          status: 'SECURITY_VIOLATION',
          error: `Instruction potentiellement malveillante détectée : ${pattern.toString()}`,
          allPassed: false,
          results: [],
          medianCpuTimeMs: 0,
          allCpuTimesMs: []
        }));
        return;
      }
    }

    // 2. Préparation du contexte isolé (vm)
    const sandbox = {
      console: { log: () => {} },
      Math,
      Array,
      Object,
      Number,
      String,
      Boolean,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite
    };

    const context = vm.createContext(sandbox);

    try {
      vm.runInContext(code, context, { timeout: 1000 });
    } catch (err) {
      console.log(JSON.stringify({
        status: 'RUNTIME_ERROR',
        error: `Erreur d'exécution du code : ${err.message}`,
        allPassed: false,
        results: [],
        medianCpuTimeMs: 0,
        allCpuTimesMs: []
      }));
      return;
    }

    const targetFunc = sandbox[entrypoint];
    if (typeof targetFunc !== 'function') {
      console.log(JSON.stringify({
        status: 'RUNTIME_ERROR',
        error: `La fonction '${entrypoint}' est introuvable ou n'est pas une fonction.`,
        allPassed: false,
        results: [],
        medianCpuTimeMs: 0,
        allCpuTimesMs: []
      }));
      return;
    }

    // 3. Exécution répétée (5 fois) pour obtenir le temps CPU médian
    const allCpuTimesMs = [];
    let lastResults = [];
    let allPassed = true;

    for (let runIdx = 0; runIdx < runsCount; runIdx++) {
      const startCpu = process.cpuUsage();
      const currentRunResults = [];

      for (const test of testCases) {
        const testId = test.id || `test_${currentRunResults.length}`;
        const inputCopy = JSON.parse(JSON.stringify(test.input));
        const expected = test.expected;
        const isHidden = !!test.isHidden;

        const t0 = process.cpuUsage();
        let actual = null;
        let passed = false;
        let errorMsg = null;

        try {
          if (typeof inputCopy === 'object' && inputCopy !== null && Array.isArray(inputCopy.args)) {
            actual = targetFunc(...inputCopy.args);
          } else if (Array.isArray(inputCopy) && !Array.isArray(expected)) {
            actual = targetFunc(...inputCopy);
          } else {
            actual = targetFunc(inputCopy);
          }

          passed = deepEqual(actual, expected);
        } catch (err) {
          errorMsg = `${err.name}: ${err.message}`;
          passed = false;
        }

        const testCpu = process.cpuUsage(t0);
        const testDurationMs = Number((testCpu.user + testCpu.system) / 1000);

        if (!passed) allPassed = false;

        currentRunResults.append ? null : currentRunResults.push({
          testId,
          passed,
          durationMs: Math.round(testDurationMs * 1000) / 1000,
          actual: isHidden ? '<résultat masqué>' : actual,
          expected: isHidden ? '<attendu masqué>' : expected,
          error: errorMsg,
          isHidden
        });
      }

      const totalCpu = process.cpuUsage(startCpu);
      const runCpuMs = Number((totalCpu.user + totalCpu.system) / 1000);
      allCpuTimesMs.push(Math.round(runCpuMs * 1000) / 1000);
      lastResults = currentRunResults;
    }

    const medianCpu = Math.round(median(allCpuTimesMs) * 1000) / 1000;

    console.log(JSON.stringify({
      status: allPassed ? 'SUCCESS' : 'FAILED',
      allPassed,
      results: lastResults,
      medianCpuTimeMs: medianCpu,
      allCpuTimesMs,
      error: allPassed ? null : 'Certains tests ont échoué.'
    }));
  });
}

run();
