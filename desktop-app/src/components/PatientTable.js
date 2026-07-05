import React from 'react';

const PatientTable = ({ patients, onRowClick }) => {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Patient ID</th>
            <th style={styles.th}>Full Name</th>
            <th style={styles.th}>Email Address</th>
            <th style={styles.th}>Last Interaction</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((patient) => (
              <tr 
                key={patient.id} 
                onClick={() => onRowClick(patient)} 
                style={styles.tr}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fbfd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={styles.td}>
                  <code style={styles.idBadge}>{patient.id.slice(0, 8)}...</code>
                </td>
                <td style={styles.td}>
                  <span style={styles.patientName}>{patient.name}</span>
                </td>
                <td style={styles.td}>{patient.email}</td>
                <td style={styles.td}>
                  {new Date(patient.updatedAt).toLocaleDateString()} at {new Date(patient.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={styles.td}>
                  <button style={styles.viewBtn}>Analyze Data</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={styles.noData}>
                No patients found in your records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableWrapper: {
    overflowX: 'auto',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontFamily: '"Inter", sans-serif',
  },
  headerRow: {
    borderBottom: '2px solid #edf2f7',
    backgroundColor: '#f8fafc',
  },
  th: {
    padding: '16px 20px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#000000c6',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    cursor: 'pointer',
    borderBottom: '1px solid #ffffff',
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  idBadge: {
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#475569',
    fontSize: '12px',
  },
  patientName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  
  viewBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '16px',
  }
};

export default PatientTable;