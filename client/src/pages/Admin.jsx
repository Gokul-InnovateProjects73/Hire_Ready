import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Users, BarChart2, BookOpen, Shield } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['DSA', 'HR', 'Core', 'System Design'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const emptyQuestion = {
  title: '',
  description: '',
  difficulty: 'Easy',
  category: 'DSA',
  subcategory: '',
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyQuestion);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stats') loadStats();
  }, [activeTab]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions');
      setQuestions(res.data?.questions || res.data || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch {
      setStats({
        totalUsers: 0,
        totalQuestions: 0,
        totalSubmissions: 0,
        activeUsers: 0,
        acceptanceRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.subcategory) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/questions', form);
      toast.success('Question added!');
      setShowAddForm(false);
      setForm(emptyQuestion);
      loadQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      setQuestions(questions.filter((q) => q._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateUserRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}`, { role });
      toast.success('Role updated');
      setUsers(users.map((u) => u._id === id ? { ...u, role } : u));
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const tabs = [
    { key: 'questions', label: 'Questions', icon: <BookOpen size={16} /> },
    { key: 'users', label: 'Users', icon: <Users size={16} /> },
    { key: 'stats', label: 'Stats', icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin Panel" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={22} style={{ color: 'var(--primary)' }} /> Admin Panel
            </h1>
            <p className="page-subtitle">Manage platform content and users</p>
          </div>

          <div className="admin-tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t.icon}{t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus size={16} /> Add Question
                </button>
              </div>

              {showAddForm && (
                <div className="admin-form">
                  <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Add New Question</h3>
                  <form onSubmit={handleAddQuestion}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Question title" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subcategory *</label>
                        <input className="form-input" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="e.g. Arrays, Sorting" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Difficulty</label>
                        <select className="form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                          {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description *</label>
                      <textarea className="form-textarea" style={{ minHeight: '120px' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Problem description..." />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Question'}</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? <LoadingSpinner /> : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Difficulty</th>
                          <th>Subcategory</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No questions found</td></tr>
                        ) : (
                          questions.map((q) => (
                            <tr key={q._id}>
                              <td style={{ fontWeight: 500 }}>{q.title}</td>
                              <td><span className="badge badge-gray">{q.category}</span></td>
                              <td><DifficultyBadge difficulty={q.difficulty} /></td>
                              <td style={{ color: 'var(--text-muted)' }}>{q.subcategory}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="btn btn-ghost btn-sm" title="Edit">
                                    <Edit size={14} />
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteQuestion(q._id)} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            loading ? <LoadingSpinner /> : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No users found</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                  {u.username?.slice(0, 2).toUpperCase()}
                                </div>
                                {u.username}
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                            <td>
                              <select
                                className="form-select"
                                style={{ width: 'auto', padding: '4px 28px 4px 8px' }}
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            loading ? <LoadingSpinner /> : (
              <div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--primary)' }}>
                      <Users size={22} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                      <div className="stat-label">Total Users</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>
                      <BookOpen size={22} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats?.totalQuestions ?? 0}</div>
                      <div className="stat-label">Total Questions</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
                      <BarChart2 size={22} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats?.totalSubmissions ?? 0}</div>
                      <div className="stat-label">Total Submissions</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                      <Users size={22} />
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stats?.activeUsers ?? 0}</div>
                      <div className="stat-label">Active Users (7d)</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
