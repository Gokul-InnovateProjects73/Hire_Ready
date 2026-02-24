import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'DSA', 'HR', 'Core', 'System Design'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const MOCK_QUESTIONS = [
  { _id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'DSA', subcategory: 'Arrays', solved: false },
  { _id: '2', title: 'Binary Search', difficulty: 'Easy', category: 'DSA', subcategory: 'Searching', solved: false },
  { _id: '3', title: 'Merge Sort', difficulty: 'Medium', category: 'DSA', subcategory: 'Sorting', solved: false },
  { _id: '4', title: 'System Design: URL Shortener', difficulty: 'Hard', category: 'System Design', subcategory: 'Design', solved: false },
  { _id: '5', title: 'Tell Me About Yourself', difficulty: 'Easy', category: 'HR', subcategory: 'Behavioral', solved: false },
  { _id: '6', title: 'OS Process Management', difficulty: 'Medium', category: 'Core', subcategory: 'OS', solved: false },
];

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  useEffect(() => {
    const params = {};
    if (category !== 'All') params.category = category;
    if (difficulty !== 'All') params.difficulty = difficulty;
    if (search) params.search = search;

    api.get('/questions', { params })
      .then((res) => {
        const q = res.data?.questions || res.data || [];
        setQuestions(q);
      })
      .catch(() => {
        setQuestions(MOCK_QUESTIONS);
      })
      .finally(() => setLoading(false));
  }, [category, difficulty, search]);

  const filtered = questions.filter((q) => {
    const matchSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || q.category === category;
    const matchDiff = difficulty === 'All' || q.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Question Bank" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Question Bank</h1>
            <p className="page-subtitle">{questions.length} problems available</p>
          </div>

          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={15} />
              <input
                className="form-input"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '130px' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '120px' }}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="questions-container">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <p>No questions found matching your filters.</p>
                </div>
              ) : (
                filtered.map((q, i) => (
                  <Link key={q._id} to={`/questions/${q._id}`} className="question-item">
                    <span className="question-number">{i + 1}</span>
                    <span className="question-title">{q.title}</span>
                    <div className="question-meta">
                      <span className="badge badge-gray">{q.category}</span>
                      <DifficultyBadge difficulty={q.difficulty} />
                      {q.solved && <CheckCircle2 size={16} className="solved-check" style={{ color: 'var(--success)' }} />}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
