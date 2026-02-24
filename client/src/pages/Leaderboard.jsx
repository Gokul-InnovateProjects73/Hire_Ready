import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MOCK_LEADERBOARD = [
  { rank: 1, username: 'alice_codes', totalSolved: 324, acceptanceRate: 92, currentStreak: 45 },
  { rank: 2, username: 'bob_dev', totalSolved: 298, acceptanceRate: 88, currentStreak: 32 },
  { rank: 3, username: 'carol_tech', totalSolved: 275, acceptanceRate: 85, currentStreak: 28 },
  { rank: 4, username: 'dave_algo', totalSolved: 241, acceptanceRate: 81, currentStreak: 21 },
  { rank: 5, username: 'eve_prog', totalSolved: 210, acceptanceRate: 79, currentStreak: 15 },
  { rank: 6, username: 'frank_ds', totalSolved: 198, acceptanceRate: 76, currentStreak: 12 },
  { rank: 7, username: 'grace_ai', totalSolved: 187, acceptanceRate: 74, currentStreak: 10 },
  { rank: 8, username: 'henry_sys', totalSolved: 165, acceptanceRate: 71, currentStreak: 8 },
  { rank: 9, username: 'irene_ml', totalSolved: 143, acceptanceRate: 69, currentStreak: 6 },
  { rank: 10, username: 'jack_web', totalSolved: 120, acceptanceRate: 65, currentStreak: 4 },
];

function getMedal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then((res) => {
        const list = res.data?.leaderboard || res.data || [];
        setData(list);
        if (res.data?.myRank) setMyRank(res.data.myRank);
      })
      .catch(() => {
        setData(MOCK_LEADERBOARD);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Leaderboard" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Global Leaderboard</h1>
            <p className="page-subtitle">Top performers in the HireReady community</p>
          </div>

          {myRank && (
            <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Trophy size={24} style={{ color: 'var(--warning)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Your Rank: #{myRank.rank}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {myRank.totalSolved} solved · {myRank.acceptanceRate}% acceptance
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Username</th>
                      <th>Problems Solved</th>
                      <th>Acceptance Rate</th>
                      <th>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((entry, i) => {
                      const isCurrentUser = entry.username === user?.username;
                      const medal = getMedal(entry.rank || i + 1);
                      return (
                        <tr key={i} className={isCurrentUser ? 'current-user-row' : ''}>
                          <td>
                            {medal ? (
                              <span className="rank-medal">{medal}</span>
                            ) : (
                              <span className="rank-number">#{entry.rank || i + 1}</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                {entry.username?.slice(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: isCurrentUser ? 600 : 400 }}>
                                {entry.username}
                                {isCurrentUser && (
                                  <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '10px' }}>You</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{entry.totalSolved ?? entry.problemsSolved ?? 0}</td>
                          <td>
                            <span style={{ color: entry.acceptanceRate >= 80 ? 'var(--success)' : entry.acceptanceRate >= 60 ? 'var(--warning)' : 'var(--error)' }}>
                              {entry.acceptanceRate ?? 0}%
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🔥 {entry.currentStreak ?? entry.streak ?? 0}d
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
