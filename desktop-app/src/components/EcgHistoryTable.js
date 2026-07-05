import React, { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ecgDataByPatientIdAndTimestamp } from '../graphql/queries'; 

const client = generateClient();

const EcgHistoryTable = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextToken, setNextToken] = useState(null);
  const [tokenStack, setTokenStack] = useState([]); 
  const [currentPageToken, setCurrentPageToken] = useState(null);

  // fetch existing records
  const fetchHistory = useCallback(async (targetToken = null) => {
    setLoading(true);
    try {
      const result = await client.graphql({
        query: ecgDataByPatientIdAndTimestamp,
        variables: { 
          patientId: patientId,
          limit: 10,
          nextToken: targetToken,
          sortDirection: 'DESC' 
        }
      });

      const { items, nextToken: newNextToken } = result.data.ecgDataByPatientIdAndTimestamp;
      setRecords(items);
      setNextToken(newNextToken);
    } catch (err) {
      console.error("Error fetching ECG history:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Navigation Logic
  const handleNext = () => {
    if (nextToken) {
      setTokenStack(prev => [...prev, currentPageToken]);
      setCurrentPageToken(nextToken);
      fetchHistory(nextToken);
    }
  };

  const handlePrevious = () => {
    const prevToken = tokenStack.pop(); 
    setTokenStack([...tokenStack]); 
    setCurrentPageToken(prevToken);
    fetchHistory(prevToken);
  };

  const handleRefresh = () => {
    setTokenStack([]);
    setCurrentPageToken(null);
    fetchHistory(null);
  };


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h4 style={{ margin: 0 }}> Patient ECG History</h4>
          <button onClick={handleRefresh} style={styles.refreshBtn}>↻ Refresh Records</button>
        </div>
        
        <div style={styles.pagination}>
          <button disabled={tokenStack.length === 0} onClick={handlePrevious} style={styles.pageBtn}>← Previous</button>
          <button disabled={!nextToken} onClick={handleNext} style={styles.pageBtn}>Next →</button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {loading && <div style={styles.loader}>Fetching data...</div>}
        
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHead}>
              <th>Time</th>
              <th>Waveform Sample</th>
              <th>Anomaly Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id} style={{
                ...styles.row,
                backgroundColor: item.is_anomaly ? '#FFF5F5' : 'transparent'
              }}>
                <td>{(() => {
                    const timestamp = Number(item.timestamp);
                    const date = timestamp < 1000000000000 ? new Date(timestamp * 1000) : new Date(timestamp);
                    return date.toLocaleDateString();
                })()}
                </td>
              
                <td>{item.ecgWaveform?.[0]?.toFixed(2) || '0.00'}... ({item.ecgWaveform?.length} pts)</td>
                <td>{item.anomaly_score?.toFixed(4) || 'N/A'}</td>
                <td style={{ 
                  color: item.is_anomaly ? '#E74C3C' : '#2ECC71', 
                  fontWeight: 'bold' 
                }}>
                  {item.is_anomaly ? ' ANOMALY' : 'NORMAL'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { marginTop: '20px', padding: '10px', backgroundColor: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  refreshBtn: { padding: '5px 12px', borderRadius: '4px', border: '1px solid #3498DB', color: '#3498DB', cursor: 'pointer', background: 'white',  },
  refreshBtnHover: { backgroundColor: '#3498DB', color: 'white'},
  pagination: { display: 'flex', gap: '8px' },
  pageBtn: { padding: '5px 12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  tableHead: { borderBottom: '2px solid #F4F7F9', textAlign: 'left', color: '#7F8C8D' },
  row: { borderBottom: '1px solid #F4F7F9', height: '40px' },
  loader: { position: 'absolute', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.8)', padding: '20px', zIndex: 2 }
};

export default EcgHistoryTable;