import './App.css';
import React, { useEffect, useState, useMemo } from 'react';
import { PubSub } from '@aws-amplify/pubsub';
import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { listPatients } from './graphql/queries';
import Sidebar from './components/Sidebar';
import PatientTable from './components/PatientTable';
import PatientBox from './components/PatientBox';
import EcgLiveChart from './components/EcgLiveChart';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'; 
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import '@aws-amplify/ui-react/styles.css';
import HeartRateChart from './components/HeartRateChart';
import EcgHistoryTable from './components/EcgHistoryTable';

// Configure Amplify
Amplify.configure(awsconfig);
const client = generateClient();

// attachIoTPolicy function
const attachIoTPolicy = async (session) => {
  try {
    const identityId = session.identityId
    const credentials = session.credentials

    if (!identityId){
      console.warn("No IdentityId found. Cannot attach IoT polic");
      return;
    }

    const lambdaClient = new LambdaClient({
      region: 'eu-west-2',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      },
    });

    const payload = JSON.stringify({
      identityId,
      policyName: 'AndroidPolicy',
    });

    const command = new InvokeCommand({
      FunctionName: 'AuthAttachIoTPolicy',
      Payload: new TextEncoder().encode(payload),
    });

    const response = await lambdaClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));
    console.log('IoT Policy Attach result: ', result);
  } catch (err){
    console.error('Failed to attach IoT policy: ', err);
  }
}

// Dashboard function
function DashboardContent({ user, signOut }) {
  const [isDoctor, setIsDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('live'); // New: 'live' or 'history'

  // pubsub for connection with IoT Core
  const pubsub = useMemo(() => new PubSub({
    region: "eu-west-2",
    endpoint: "YOUR_IOT_ENDPOINT_HERE" // Replace with your actual IoT endpoint
  }), []);

  // Handlers
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('patients');
    setViewMode('live'); 
  };


  useEffect(() => {
    setIsDoctor(null);
    setPatients([]);
    setSelectedPatient(null);
    setActiveTab('home');
  }, [user?.userId]);

  // useEffect for authorisation (to check if user belongs to doctor group)
  useEffect(() => {
    if (isDoctor !== null) return;

    const checkAccessAndFetch = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload?.['cognito:groups'] || [];
        const hasAccess = groups.includes('Doctors');
        
        setIsDoctor(hasAccess);
        
        // attach policy to cognito ID
        await attachIoTPolicy(session);

        if (hasAccess) {
          const response = await client.graphql({
            query: listPatients,
            variables: { filter: { doctorId: { eq: user.userId } } }
          });
          setPatients(response.data.listPatients.items);
        }
      } catch (err) {
        console.error("Auth Error: ", err);
        setIsDoctor(false);
      }
    };

    checkAccessAndFetch();
  }, [isDoctor, user?.userId]);

  if (isDoctor === null){
    return <div style={{ padding: '50px', textAlign: 'center' }}>Verifying Medical Credentials...</div>;
  }

  if (!isDoctor) {
    return(
      <div style={styles.errorPage}>
        <h2>Access Denied</h2>
        <p>User "{user?.username}" is not a Doctor.</p>
        <button onClick={signOut} style={styles.logoutBtn}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={styles.appWrapper}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleSignOut={signOut} />

      <main style={styles.mainArea}>

        <div style={styles.contentPadding}>
          {activeTab === 'home' ? (
            <div>
              <div style={styles.welcomeBox}>
                <h2 style={styles.heading}>Welcome back Dr., {user?.username}</h2>
                <p style={{ color: '#7F8C8D' }}>You have {patients.length} patients assigned to you.</p>
              </div>
              <div style={styles.tableContainer}>
                <PatientTable patients={patients} onRowClick={handlePatientClick} />
              </div>
            </div>
          ) : (
            <div>
              {selectedPatient ? (
                <>
                  <div style={styles.controlsRow}>
                    <button onClick={() => setSelectedPatient(null)} style={styles.backBtn}> ← Back to List </button>
                    
                    <div style={styles.tabGroup}>
                      <button 
                        onClick={() => setViewMode('live')} 
                        style={viewMode === 'live' ? styles.activeTabBtn : styles.tabBtn}
                      >
                        Real-time Monitor
                      </button>
                      <button 
                        onClick={() => setViewMode('history')} 
                        style={viewMode === 'history' ? styles.activeTabBtn : styles.tabBtn}
                      >
                        Audit Logs
                      </button>
                    </div>
                  </div>

                  <PatientBox patient={{
                    id: selectedPatient.id,
                    name: selectedPatient.name,
                  }} />

                  {viewMode === 'live' ? (
                    <div style={styles.chartGrid}>
                      
                        <EcgLiveChart 
                          pubsub={pubsub} 
                          topic={`patients/${selectedPatient.id}/ecgData`} 
                          patientId={selectedPatient.id} 
                        />
                      

                      <div style={styles.card}>
                        <h3 style={styles.cardTitle}> Heart Rate Monitor</h3>
                        <HeartRateChart 
                          pubsub={pubsub} 
                          topic={`patients/${selectedPatient.id}/heartRate`} 
                          patientId={selectedPatient.id} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={styles.tableContainer}>
                      <EcgHistoryTable patientId={selectedPatient.id} />
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.tableContainer}>
                  <h2 style={styles.heading}>Patient Records</h2>
                  <PatientTable patients={patients} onRowClick={handlePatientClick} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App(){
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <DashboardContent user={user} signOut={signOut} />
      )}
    </Authenticator>
  )
}

const styles = {
  appWrapper: { display: 'flex', minHeight: '100vh', backgroundColor: '#F4F7F9', fontFamily: 'sans-serif' },
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  contentPadding: { padding: '40px' },
  heading: { fontSize: '24px', fontWeight: '700', marginBottom: '20px' },
  welcomeBox: { marginBottom: '30px' },
  tableContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #E1E8ED' },
  chartGrid: { display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' },
  card: { backgroundColor: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #E1E8ED' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#34495E', marginBottom: '20px', marginTop: 0 },
  controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  backBtn: { padding: '8px 15px', backgroundColor: '#0a2e52', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  tabGroup: { display: 'flex', gap: '10px' },
  tabBtn: { padding: '8px 16px', backgroundColor: '#fff', color: '#7F8C8D', border: '1px solid #D1D8DD', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  activeTabBtn: { padding: '8px 16px', backgroundColor: '#3498DB', color: 'white', border: '1px solid #646464', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  errorPage: { textAlign: 'center', padding: '100px' },
  logoutBtn: { padding: '10px 20px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};