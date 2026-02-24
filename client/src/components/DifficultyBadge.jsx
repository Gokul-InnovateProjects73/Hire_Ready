export default function DifficultyBadge({ difficulty }) {
  const map = {
    Easy: 'badge badge-easy',
    Medium: 'badge badge-medium',
    Hard: 'badge badge-hard',
  };
  return <span className={map[difficulty] || 'badge badge-gray'}>{difficulty}</span>;
}
