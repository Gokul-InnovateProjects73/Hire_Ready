import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
];

const STARTER_CODE = {
  javascript: '// Write your JavaScript solution here\nfunction solution() {\n  \n}\n',
  python: '# Write your Python solution here\ndef solution():\n    pass\n',
  java: '// Write your Java solution here\npublic class Solution {\n    public void solve() {\n        \n    }\n}\n',
  cpp: '// Write your C++ solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
};

const MOCK_QUESTION = {
  _id: 'mock',
  title: 'Two Sum',
  difficulty: 'Easy',
  category: 'DSA',
  subcategory: 'Arrays',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Constraints:
• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
  ],
};

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [aiFeedback, setAiFeedback] = useState('');
  const [activeResultTab, setActiveResultTab] = useState('tests');

  useEffect(() => {
    api.get(`/questions/${id}`)
      .then((res) => setQuestion(res.data?.question || res.data))
      .catch(() => setQuestion(MOCK_QUESTION))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    setRunning(true);
    setActiveResultTab('tests');
    try {
      const res = await api.post('/submissions/run', {
        questionId: id,
        code,
        language,
      });
      const results = res.data?.results || res.data?.testResults || [];
      setTestResults(results);
      if (results.length === 0) {
        setTestResults([{ passed: true, input: 'Test', expected: 'OK', output: 'OK', message: 'Code executed successfully' }]);
      }
      toast.success('Code executed!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Execution failed';
      setTestResults([{ passed: false, message: msg, input: '', expected: '', output: '' }]);
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    setSubmitting(true);
    setActiveResultTab('feedback');
    try {
      const res = await api.post('/submissions/submit', {
        questionId: id,
        code,
        language,
      });
      const { feedback, status, testResults: tr } = res.data;
      if (tr) setTestResults(tr);
      setAiFeedback(feedback || 'Submission received. No AI feedback available.');
      if (status === 'Accepted') {
        toast.success('Accepted! Great job! 🎉');
      } else {
        toast.error(`${status || 'Wrong Answer'}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed';
      setAiFeedback(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ marginLeft: 'var(--sidebar-width)' }}>
        <LoadingSpinner fullPage />
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="editor-layout">
          {/* Problem Panel */}
          <div className="problem-panel">
            <div className="problem-panel-header">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/questions')}>
                <ChevronLeft size={16} /> Back
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{question?.title}</div>
              </div>
              <DifficultyBadge difficulty={question?.difficulty} />
            </div>
            <div className="problem-panel-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="badge badge-gray">{question?.category}</span>
                {question?.subcategory && <span className="badge badge-gray">{question.subcategory}</span>}
              </div>
              <div className="problem-description">
                {question?.description || 'No description available.'}
              </div>

              {question?.examples?.length > 0 && (
                <div className="problem-examples">
                  <div style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>Examples</div>
                  {question.examples.map((ex, i) => (
                    <div key={i} className="example-block">
                      <div><strong>Input:</strong> {ex.input}</div>
                      <div><strong>Output:</strong> {ex.output}</div>
                      {ex.explanation && <div><strong>Explanation:</strong> {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {question?.constraints && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Constraints</div>
                  <div className="example-block">
                    {Array.isArray(question.constraints)
                      ? question.constraints.map((c, i) => <div key={i}>{c}</div>)
                      : question.constraints}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="editor-toolbar">
              <div className="editor-toolbar-left">
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="editor-toolbar-right">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleRun}
                  disabled={running || submitting}
                >
                  <Play size={14} />
                  {running ? 'Running...' : 'Run'}
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleSubmit}
                  disabled={running || submitting}
                >
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            <div className="editor-body">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Results Panel */}
            <div className="results-panel">
              <div className="results-tabs">
                <button
                  className={`results-tab ${activeResultTab === 'tests' ? 'active' : ''}`}
                  onClick={() => setActiveResultTab('tests')}
                >
                  Test Results
                </button>
                <button
                  className={`results-tab ${activeResultTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setActiveResultTab('feedback')}
                >
                  AI Feedback
                </button>
              </div>
              <div className="results-body">
                {activeResultTab === 'tests' ? (
                  testResults.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>Run your code to see test results...</span>
                  ) : (
                    testResults.map((r, i) => (
                      <div key={i} className={`test-case-result ${r.passed ? 'pass' : 'fail'}`}>
                        <div style={{ fontWeight: 600 }}>{r.passed ? '✓ Passed' : '✗ Failed'} — Test {i + 1}</div>
                        {r.input && <div>Input: {r.input}</div>}
                        {r.expected && <div>Expected: {r.expected}</div>}
                        {r.output && <div>Output: {r.output}</div>}
                        {r.message && <div>{r.message}</div>}
                      </div>
                    ))
                  )
                ) : (
                  aiFeedback ? (
                    <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {aiFeedback}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Submit your code to get AI feedback...</span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
