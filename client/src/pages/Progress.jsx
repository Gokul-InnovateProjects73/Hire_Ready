import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Flame, CheckCircle, Target, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

function Heatmap({ data }) {
  // Build a 52-week grid
  const weeks = [];
  const today = new Date();
  const countMap = {};
  (data || []).forEach((d) => {
    countMap[d.date] = d.count;
  });

  for (let w = 51; w >= 0; w--) {
    const days = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const key = date.toISOString().slice(0, 10);
      const count = countMap[key] || 0;
      const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 6 ? 3 : 4;
      days.push({ date: key, count, level });
    }
    weeks.push(days);
  }

  return (
    <div>
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-week">
            {week.map((day, di) => (
              <div
                key={di}
                className={`heatmap-cell level-${day.level}`}
                title={`${day.date}: ${day.count} submissions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`heatmap-cell level-${l}`} />
        ))}
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

const MOCK_CATEGORY_DATA = [
  { name: 'DSA', solved: 24, total: 40 },
  { name: 'HR', solved: 8, total: 15 },
  { name: 'Core', solved: 6, total: 20 },
  { name: 'System Design', solved: 4, total: 10 },
];

export default function Progress() {
  const [data, setData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/progress/dashboard').catch(() => null),
      api.get('/progress/heatmap').catch(() => null),
    ]).then(([dashRes, heatRes]) => {
      setData(dashRes?.data || {
        totalSolved: 42,
        acceptanceRate: 78,
        currentStreak: 7,
        longestStreak: 14,
        categoryBreakdown: MOCK_CATEGORY_DATA,
      });
      setHeatmapData(heatRes?.data?.heatmap || heatRes?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Progress" />
        <LoadingSpinner fullPage />
      </div>
    </div>
  );

  const categoryData = data?.categoryBreakdown || MOCK_CATEGORY_DATA;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Progress" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Progress Dashboard</h1>
            <p className="page-subtitle">Track your interview preparation journey</p>
          </div>

          {/* Streak Banner */}
          <div className="streak-banner">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <h3>{data?.currentStreak || 0} Day Streak!</h3>
              <p>Keep it up! Your longest streak is {data?.longestStreak || 0} days.</p>
            </div>
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
              icon={<Target size={22} />}
              label="Acceptance Rate"
              value={`${data?.acceptanceRate ?? 0}%`}
              color="#3B82F6"
              bg="rgba(59,130,246,0.15)"
            />
            <StatsCard
              icon={<Flame size={22} />}
              label="Current Streak"
              value={`${data?.currentStreak ?? 0}d`}
              color="#F59E0B"
              bg="rgba(245,158,11,0.15)"
            />
            <StatsCard
              icon={<Award size={22} />}
              label="Longest Streak"
              value={`${data?.longestStreak ?? 0}d`}
              color="#8B5CF6"
              bg="rgba(139,92,246,0.15)"
            />
          </div>

          {/* Activity Heatmap */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <h3 className="card-title">Submission Activity</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 52 weeks</span>
            </div>
            <Heatmap data={heatmapData} />
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Category Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="solved" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Solved" />
                <Bar dataKey="total" fill="rgba(59,130,246,0.2)" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
