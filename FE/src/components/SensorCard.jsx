import React from 'react';

export default function SensorCard({ title, value, unit, icon, extra, actions }) {
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div style={styles.icon}>{icon}</div>
        <div>
          <div style={styles.title}>{title}</div>
          <div style={styles.value}>{value}{unit ? ` ${unit}` : ''}</div>
        </div>
      </div>

      {extra && <div style={styles.extra}>{extra}</div>}

      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 8, padding: 14, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', minWidth: 200 },
  row: { display: 'flex', gap: 12, alignItems: 'center' },
  icon: { fontSize: 22, color: '#555' },
  title: { fontSize: 13, color: '#666', marginBottom: 4 },
  value: { fontSize: 20, fontWeight: 600, color: '#111' },
  extra: { marginTop: 10, color: '#888', fontSize: 12 },
  actions: { marginTop: 12, display: 'flex', gap: 8 }
}
