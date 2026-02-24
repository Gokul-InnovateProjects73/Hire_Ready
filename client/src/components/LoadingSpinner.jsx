export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loading-full">
        <div className="spinner" />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</span>
      </div>
    );
  }
  return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  );
}
