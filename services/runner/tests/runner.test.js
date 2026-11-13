const assert = require('assert');
const { executeCode } = require('../src/runner');

async function runTests() {
  console.log('🧪 Lancement des tests unitaires du Runner...\n');
  let passedCount = 0;

  // Test 1: Python - Tri valide
  {
    process.stdout.write('1. Python - Tri valide : ');
    const res = await executeCode({
      language: 'python',
      code: 'def sort_list(lst):\n    return sorted(lst)',
      entrypoint: 'sort_list',
      tests: [
        { id: 't1', input: [5, 1, 4, 2], expected: [1, 2, 4, 5], isHidden: false },
        { id: 't2', input: [], expected: [], isHidden: false }
      ],
      runs: 3
    });
    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.allPassed, true);
    assert.strictEqual(res.results.length, 2);
    console.log('✅ PASS (Médiane CPU: ' + res.medianCpuTimeMs + ' ms)');
    passedCount++;
  }

  // Test 2: Python - Tri erroné
  {
    process.stdout.write('2. Python - Tri erroné détecté : ');
    const res = await executeCode({
      language: 'python',
      code: 'def sort_list(lst):\n    return lst', // Ne trie pas
      entrypoint: 'sort_list',
      tests: [
        { id: 't1', input: [5, 1], expected: [1, 5], isHidden: false }
      ],
      runs: 1
    });
    assert.strictEqual(res.status, 'FAILED');
    assert.strictEqual(res.allPassed, false);
    assert.strictEqual(res.results[0].passed, false);
    console.log('✅ PASS');
    passedCount++;
  }

  // Test 3: Python - Sécurité / Import interdit
  {
    process.stdout.write('3. Python - Blocage import interdit (sécurité) : ');
    const res = await executeCode({
      language: 'python',
      code: 'import subprocess\ndef sort_list(lst):\n    return lst',
      entrypoint: 'sort_list',
      tests: [],
      runs: 1
    });
    assert.strictEqual(res.status, 'SECURITY_VIOLATION');
    assert.strictEqual(res.allPassed, false);
    console.log('✅ PASS (' + res.error + ')');
    passedCount++;
  }

  // Test 4: Python - Timeout / Boucle infinie
  {
    process.stdout.write('4. Python - Timeout sur boucle infinie : ');
    const res = await executeCode({
      language: 'python',
      code: 'def sort_list(lst):\n    while True: pass',
      entrypoint: 'sort_list',
      tests: [{ id: 't1', input: [1], expected: [1] }],
      runs: 1,
      timeoutMs: 1000
    });
    assert.strictEqual(res.status, 'TIMEOUT');
    assert.strictEqual(res.allPassed, false);
    console.log('✅ PASS');
    passedCount++;
  }

  // Test 5: JavaScript - Tri valide
  {
    process.stdout.write('5. JavaScript - Tri valide : ');
    const res = await executeCode({
      language: 'javascript',
      code: 'function sortList(arr) { return [...arr].sort((a,b) => a - b); }',
      entrypoint: 'sortList',
      tests: [
        { id: 't1', input: [9, 3, 7], expected: [3, 7, 9], isHidden: false }
      ],
      runs: 3
    });
    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.allPassed, true);
    console.log('✅ PASS (Médiane CPU: ' + res.medianCpuTimeMs + ' ms)');
    passedCount++;
  }

  // Test 6: JavaScript - Sécurité
  {
    process.stdout.write('6. JavaScript - Blocage require/fs : ');
    const res = await executeCode({
      language: 'javascript',
      code: 'const fs = require("fs"); function sortList(a) { return a; }',
      entrypoint: 'sortList',
      tests: [],
      runs: 1
    });
    assert.strictEqual(res.status, 'SECURITY_VIOLATION');
    console.log('✅ PASS (' + res.error + ')');
    passedCount++;
  }

  console.log(`\n🎉 Tous les tests du Runner ont réussi avec succès (${passedCount}/${passedCount}) !`);
}

runTests().catch((err) => {
  console.error('\n❌ Échec du test :', err);
  process.exit(1);
});
