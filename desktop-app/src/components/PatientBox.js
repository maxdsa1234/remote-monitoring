import React from 'react';

const PatientBox = ({ patient }) => {
  return (
    <div style={styles.container}>
      <div style={styles.identitySection}>
        <div style={styles.textDetails}>
          <div style={styles.nameRow}>
            <h2 style={styles.patientName}>Patient Name: {patient.name}</h2>
          </div>
          <p style={styles.idText}>Patient ID: {patient.id}</p>
        </div>
      </div>

    
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '20px 25px',
    borderRadius: '12px',
    border: '1px solid #E1E8ED',
    marginBottom: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  identitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#F0F4F8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #3498DB',
  },
  textDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  patientName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#000000',
  },
  idText: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#404040',
    fontFamily: 'monospace',
  },
};

export default PatientBox;