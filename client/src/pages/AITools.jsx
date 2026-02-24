import { useState } from 'react';
import { FileText, Code, Lightbulb, MessageSquare, Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TOPICS = ['Data Structures', 'Algorithms', 'System Design', 'Behavioral', 'Operating Systems', 'Networking', 'Databases'];

export default function AITools() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Tab 1: Resume
  const [resume, setResume] = useState('');
  const [resumeFeedback, setResumeFeedback] = useState('');

  // Tab 2: Code Review
  const [codeInput, setCodeInput] = useState('');
  const [codeFeedback, setCodeFeedback] = useState('');

  // Tab 3: Interview Tips
  const [tipTopic, setTipTopic] = useState(TOPICS[0]);
  const [tips, setTips] = useState('');

  // Tab 4: Mock Questions
  const [mockTopic, setMockTopic] = useState(TOPICS[0]);
  const [mockQuestions, setMockQuestions] = useState([]);

  const analyzeResume = async () => {
    if (!resume.trim()) { toast.error('Please paste your resume text'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/resume', { resumeText: resume });
      setResumeFeedback(res.data?.feedback || res.data?.analysis || JSON.stringify(res.data));
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed';
      setResumeFeedback(`[Demo Mode] Your resume looks good! Consider adding more quantitative metrics to your achievements. Make sure to highlight relevant technologies. Tailor the resume to the specific job description.\n\nError: ${msg}`);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reviewCode = async () => {
    if (!codeInput.trim()) { toast.error('Please paste some code'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/feedback', { code: codeInput, questionId: 'review' });
      setCodeFeedback(res.data?.feedback || JSON.stringify(res.data));
    } catch (err) {
      const msg = err.response?.data?.message || 'Review failed';
      setCodeFeedback(`[Demo Mode] Code review:\n- Time complexity looks reasonable\n- Consider adding input validation\n- Variable names could be more descriptive\n- Overall structure is clean\n\nError: ${msg}`);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getTips = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/interview-tip', { topic: tipTopic });
      setTips(res.data?.tip || res.data?.tips || JSON.stringify(res.data));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get tips';
      setTips(`[Demo Mode] Interview tips for ${tipTopic}:\n\n1. Understand the fundamentals thoroughly\n2. Practice explaining concepts clearly\n3. Use real-world examples\n4. Think out loud during the interview\n5. Ask clarifying questions before solving\n\nError: ${msg}`);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const generateMockQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/mock-questions', { params: { topic: mockTopic } });
      const qs = res.data?.questions || res.data || [];
      setMockQuestions(Array.isArray(qs) ? qs : [qs]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate';
      setMockQuestions([
        `Explain the core concepts of ${mockTopic}.`,
        `What are the main challenges in ${mockTopic}?`,
        `Describe a real-world application of ${mockTopic}.`,
        `How would you optimize a solution involving ${mockTopic}?`,
        `What are best practices for ${mockTopic}?`,
      ]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'Resume Analyzer', icon: <FileText size={16} /> },
    { label: 'Code Review', icon: <Code size={16} /> },
    { label: 'Interview Tips', icon: <Lightbulb size={16} /> },
    { label: 'Mock Questions', icon: <MessageSquare size={16} /> },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="AI Tools" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">AI-Powered Tools</h1>
            <p className="page-subtitle">Leverage AI to supercharge your interview preparation</p>
          </div>

          <div className="tabs">
            {tabs.map((t, i) => (
              <button
                key={i}
                className={`tab-btn ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t.icon}{t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tab 1: Resume Analyzer */}
          {activeTab === 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Resume Analyzer</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Paste your resume text</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '200px' }}
                  placeholder="Paste your resume content here..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={analyzeResume} disabled={loading}>
                {loading ? <><Loader size={14} className="spinner" style={{ animation: 'spin 0.8s linear infinite' }} /> Analyzing...</> : 'Analyze Resume'}
              </button>
              {resumeFeedback && (
                <div style={{ marginTop: '16px' }}>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Analysis Result</div>
                  <div className="ai-feedback-box">{resumeFeedback}</div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Code Review */}
          {activeTab === 1 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Code Review</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Paste your code</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '200px', fontFamily: 'monospace' }}
                  placeholder="Paste your code here for AI review..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={reviewCode} disabled={loading}>
                {loading ? 'Reviewing...' : 'Review Code'}
              </button>
              {codeFeedback && (
                <div style={{ marginTop: '16px' }}>
                  <div className="form-label" style={{ marginBottom: '8px' }}>AI Feedback</div>
                  <div className="ai-feedback-box">{codeFeedback}</div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Interview Tips */}
          {activeTab === 2 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Interview Tips</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Select Topic</label>
                <select
                  className="form-select"
                  value={tipTopic}
                  onChange={(e) => setTipTopic(e.target.value)}
                >
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={getTips} disabled={loading}>
                {loading ? 'Generating...' : 'Get Tips'}
              </button>
              {tips && (
                <div style={{ marginTop: '16px' }}>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Interview Tips</div>
                  <div className="ai-feedback-box">{tips}</div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Mock Questions */}
          {activeTab === 3 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Mock Interview Questions</h3>
              </div>
              <div className="form-group">
                <label className="form-label">Select Topic</label>
                <select
                  className="form-select"
                  value={mockTopic}
                  onChange={(e) => setMockTopic(e.target.value)}
                >
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={generateMockQuestions} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
              {mockQuestions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div className="form-label" style={{ marginBottom: '12px' }}>Generated Questions</div>
                  {mockQuestions.map((q, i) => (
                    <div key={i} className="card" style={{ marginBottom: '10px', padding: '14px 16px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600, marginRight: '8px' }}>Q{i + 1}.</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{typeof q === 'string' ? q : q.question || JSON.stringify(q)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
