const { spawn } = require('child_process');
const path = require('path');

const HARNESS_DIR = path.resolve(__dirname, '../harnesses');

/**
 * Exécute le code utilisateur dans le bac à sable approprié
 * @param {Object} options
 * @param {'python' | 'javascript'} options.language
 * @param {string} options.code
 * @param {string} options.entrypoint
 * @param {Array} options.tests
 * @param {number} [options.runs=5]
 * @param {number} [options.timeoutMs=5000]
 * @returns {Promise<Object>}
 */
async function executeCode({
  language,
  code,
  entrypoint,
  tests,
  runs = 5,
  timeoutMs = 5000
}) {
  return new Promise((resolve) => {
    let command;
    let args = [];

    if (language === 'python') {
      command = process.platform === 'win32' ? 'python' : 'python3';
      args = [path.join(HARNESS_DIR, 'python_harness.py')];
    } else if (language === 'javascript') {
      command = 'node';
      args = [path.join(HARNESS_DIR, 'javascript_harness.js')];
    } else {
      return resolve({
        status: 'UNSUPPORTED_LANGUAGE',
        error: `Langage '${language}' non supporté. Supportés : python, javascript.`,
        allPassed: false,
        results: [],
        medianCpuTimeMs: 0,
        allCpuTimesMs: []
      });
    }

    const payload = JSON.stringify({
      code,
      entrypoint: entrypoint || (language === 'python' ? 'sort_list' : 'sortList'),
      tests,
      runs
    });

    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (codeExit) => {
      clearTimeout(timer);

      if (isTimedOut) {
        return resolve({
          status: 'TIMEOUT',
          error: `Délai d'exécution dépassé (${timeoutMs} ms). Risque de boucle infinie.`,
          allPassed: false,
          results: [],
          medianCpuTimeMs: 0,
          allCpuTimesMs: []
        });
      }

      if (stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout.trim());
          return resolve(parsed);
        } catch (e) {
          // Si la sortie n'est pas du JSON valide
          return resolve({
            status: 'RUNTIME_ERROR',
            error: stderr || stdout || 'Erreur inconnue dans le bac à sable.',
            allPassed: false,
            results: [],
            medianCpuTimeMs: 0,
            allCpuTimesMs: []
          });
        }
      }

      resolve({
        status: codeExit === 0 ? 'SUCCESS' : 'RUNTIME_ERROR',
        error: stderr || `Processus terminé avec le code ${codeExit}`,
        allPassed: false,
        results: [],
        medianCpuTimeMs: 0,
        allCpuTimesMs: []
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        status: 'RUNNER_ERROR',
        error: `Échec de lancement du runner : ${err.message}`,
        allPassed: false,
        results: [],
        medianCpuTimeMs: 0,
        allCpuTimesMs: []
      });
    });

    // Envoi du payload sur stdin puis fermeture
    child.stdin.write(payload);
    child.stdin.end();
  });
}

module.exports = { executeCode };
