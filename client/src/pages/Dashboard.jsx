import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CheckCircle, TrendingUp, Flame, Trophy } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MOCK_SUBMISSIONS_CHART = [
  { date: 'Mon', count: 2 },
  { date: 'Tue', count: 5 },
  { date: 'Wed', count: 3 },
  { date: 'Thu', count: 8 },
  { date: 'Fri', count: 4 },
  { date: 'Sat', count: 6 },
  { date: 'Sun', count: 7 },
];

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {
        // Use mock data if API unavailable
        setData({
          totalSolved: 42,
          acceptanceRate: 78,
          currentStreak: 7,
          globalRank: 1234,
          recentSubmissions: [],
          difficultyBreakdown: [
            { name: 'Easy', value: 20 },
            { name: 'Medium', value: 15 },
            { name: 'Hard', value: 7 },
          ],
          submissionsOverTime: MOCK_SUBMISSIONS_CHART,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <LoadingSpinner fullPage />
      </div>
    </div>
  );

  const diffBreakdown = data?.difficultyBreakdown || [
    { name: 'Easy', value: 20 },
    { name: 'Medium', value: 15 },
    { name: 'Hard', value: 7 },
  ];

  const chartData = data?.submissionsOverTime || MOCK_SUBMISSIONS_CHART;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
            <p className="page-subtitle">Here&apos;s your interview prep overview</p>
          </div>

          <div className="stats-grid">
            <StatsCard
              icon={<CheckCircle size={22} />}
              label="Problems Solved"
              value={data?.totalSolved ?? 0}
              color="#10B981"
              bg="rgba(16,185,129,0.15)"
            />
            <StatsCard
              icon={<TrendingUp size={22} />}
              label="Acceptance Rate"
              value={`${data?.acceptanceRate ?? 0}%`}
              color="#3B82F6"
              bg="rgba(59,130,246,0.15)"
            />
            <StatsCard
              icon={<Flame size={22} />}
              label="Current Streak"
              value={`${data?.currentStreak ?? 0} days`}
              color="#F59E0B"
              bg="rgba(245,158,11,0.15)"
            />
            <StatsCard
              icon={<Trophy size={22} />}
              label="Global Rank"
              value={data?.globalRank ? `#${data.globalRank}` : '—'}
              color="#8B5CF6"
              bg="rgba(139,92,246,0.15)"
            />
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Submissions This Week</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">By Difficulty</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={diffBreakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {diffBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Submissions</h3>
              <Link to="/questions" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {data?.recentSubmissions?.length > 0 ? (
              <div className="recent-submissions">
                {data.recentSubmissions.slice(0, 5).map((sub, i) => (
                  <div className="submission-item" key={i}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{sub.questionTitle || sub.question?.title || 'Problem'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {sub.language} · {new Date(sub.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`submission-status ${sub.status === 'Accepted' ? 'accepted' : sub.status === 'Wrong Answer' ? 'wrong' : 'error'}`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No submissions yet. <Link to="/questions">Start solving!</Link></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
