/**
 * Mock code executor that simulates running code against test cases.
 * In production this would integrate with Judge0 or a sandboxed execution engine.
 */

const LANGUAGE_RUNTIMES = {
  javascript: { baseTime: 80, memBase: 40000 },
  python: { baseTime: 120, memBase: 45000 },
  java: { baseTime: 200, memBase: 60000 },
  cpp: { baseTime: 50, memBase: 35000 },
  c: { baseTime: 45, memBase: 32000 },
};

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Determine pass/fail for a test case using basic heuristics on user code.
 * Real execution is sandboxed; this is a simulation only.
 */
const evaluateTestCase = (code, language, testCase) => {
  const lowerCode = code.toLowerCase();
  // Heuristic: empty or trivial code fails
  if (!code.trim() || code.trim().length < 10) return false;
  // Heuristic: code containing obvious wrong patterns
  if (lowerCode.includes('return null') && !lowerCode.includes('if')) return false;
  // 80% pass rate simulation for non-trivial code
  return Math.random() < 0.8;
};

const runCode = async (code, language, testCases, isSubmit = false) => {
  const langConfig = LANGUAGE_RUNTIMES[language] || LANGUAGE_RUNTIMES.javascript;

  // Simulate execution delay
  await new Promise((resolve) => setTimeout(resolve, randomInRange(200, 600)));

  const visibleCases = isSubmit ? testCases : testCases.filter((tc) => !tc.isHidden);
  const results = visibleCases.map((tc) => {
    const passed = evaluateTestCase(code, language, tc);
    return {
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: passed ? tc.output : generateWrongOutput(tc.output),
      passed,
      explanation: tc.explanation || '',
    };
  });

  const passedCount = results.filter((r) => r.passed).length;
  const runtime = randomInRange(langConfig.baseTime, langConfig.baseTime + 150);
  const memory = randomInRange(langConfig.memBase, langConfig.memBase + 5000);

  const status = determineStatus(passedCount, results.length, code);

  return {
    status,
    runtime,
    memory,
    testCasesPassed: passedCount,
    totalTestCases: results.length,
    results: isSubmit ? results.slice(0, 3) : results, // show limited results for submit
    errorMessage: status === 'Runtime Error' ? generateErrorMessage(language) : '',
  };
};

const determineStatus = (passed, total, code) => {
  if (!code.trim() || code.trim().length < 10) return 'Runtime Error';
  if (code.toLowerCase().includes('while(true)') || code.toLowerCase().includes('while (true)')) {
    return 'Time Limit Exceeded';
  }
  if (passed === total) return 'Accepted';
  if (passed === 0) return Math.random() < 0.3 ? 'Runtime Error' : 'Wrong Answer';
  return 'Wrong Answer';
};

const generateWrongOutput = (expectedOutput) => {
  if (!isNaN(Number(expectedOutput))) {
    return String(Number(expectedOutput) + randomInRange(-2, 2) || 0);
  }
  if (expectedOutput === 'true') return 'false';
  if (expectedOutput === 'false') return 'true';
  return expectedOutput.split('').reverse().join('').substring(0, expectedOutput.length);
};

const generateErrorMessage = (language) => {
  const errors = {
    javascript: 'TypeError: Cannot read properties of undefined',
    python: 'AttributeError: NoneType object has no attribute',
    java: 'NullPointerException at Solution.solve(Solution.java:5)',
    cpp: 'Segmentation fault (core dumped)',
    c: 'Segmentation fault (core dumped)',
  };
  return errors[language] || 'Runtime Error occurred';
};

module.exports = { runCode };
