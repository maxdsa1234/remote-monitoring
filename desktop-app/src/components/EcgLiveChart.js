import React, { useEffect, useState, useRef } from 'react';
import { generateClient } from "aws-amplify/api";
import { listEcgData } from '../graphql/queries';
import { onUpdateEcgData } from '../graphql/subscriptions';
import { LineChart, ResponsiveContainer, YAxis, CartesianGrid, Line, XAxis, ReferenceArea } from 'recharts';
import { onCreateEcgData } from '../graphql/subscriptions';

const EcgLiveChart = ({ pubsub, topic, patientId }) => {

    const client = React.useMemo(() => generateClient(), []);

    const [chartData, setChartData] = useState([]);
    const buffer = useRef([]);  
    const chartDataRef = useRef([]); 
    
    // batching to track if batch contains anomaly for flagging
    const [anomalyBatches, setAnomalyBatches] = useState(new Set());

    useEffect(() => {
        // Fetch History
        const fetchHistory = async () => {
            try {
                const response = await client.graphql({ query: listEcgData, 
                    variables: { 
                        filter: {patientId : {eq: patientId}},
                    },
                    limit: 10
                });
                const items = response.data.listEcgData.items;
                
                // Identify which items were anomalies
                const initialAnomalies = new Set(
                    items.filter(i => i.is_anomaly).map(i => i.id)
                );
                setAnomalyBatches(initialAnomalies);

                const initialPoints = items
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .flatMap(item => 
                        item.ecgWaveform.map(val => ({ val, batchId: item.id }))
                    );
                
                chartDataRef.current = initialPoints.slice(-500);
                setChartData(chartDataRef.current);
            } catch (err) {
                if (err.errors) {
                    err.errors.forEach(e => console.error("GraphQL Error Detail: ", e.message));
                } else {
                    console.error('ECG History Error: ', err);
                }
            }
        };

        fetchHistory();

        // Subscribe to end topic (pubsub)
        const sub = pubsub.subscribe({ topics: topic }).subscribe({
            next: data => {
                console.log("MQTT Data Received: ", data);
                const payload = data.value || data;
                if (payload.ecgWaveform && payload.id) {
                    // Tag every point with the batch ID
                    const pointsWithId = payload.ecgWaveform.map(val => ({ 
                        val,  
                        batchId: payload.id 
                    }));
                    buffer.current.push(...pointsWithId);
                }
            },
            error: error => console.error("MQTT Sub Error: ", error)
        });

        // Subscribe to appsync for real-time data
        const aiSub = client.graphql({ query: onCreateEcgData,
            variables: {
                filter: {
                    patientId : {eq: patientId}
                }
            }
         }).subscribe({
            next: (response) => {
                console.log("AppSync Subscription Payload: ", response);

                const created = response?.value?.data?.onCreateEcgData || response?.data?.onCreateEcgData;

                if (created) {
                    console.log("AppSync result received for batch: ", created.id, "Anomaly: ", created.is_anomaly);
                    
                    if (created.ecgWaveform) {
                        const pointsWithId = created.ecgWaveform.map(val => ({
                            val,
                            batchId: created.id
                        }));
                        buffer.current.push(...pointsWithId);
                        console.log("Buffer size now: ", buffer.current.length);
                    }

                    if (created.is_anomaly === true) {
                        console.log("ANOMALY IN BATCH", created.id);
                        setAnomalyBatches(prev => {
                            const newSet = new Set(prev); 
                            newSet.add(created.id);
                            return newSet;
                        });
                    }
                
                }
            },
            error: err => console.error("AppSync Subscription Error:", err)
        });

        // Ticker for buffer animation
        const ticker = setInterval(() => {
            if (buffer.current.length > 0) {
                // Adjust pullCount for smoothness
                const pullCount = buffer.current.length > 500 ? 20 : 5;
                const newPoints = buffer.current.splice(0, pullCount); 
                for (let i = 0; i < pullCount; i++) {
                    const point = buffer.current.shift();
                    if (point) newPoints.push(point);
                }
                const updated = [...chartDataRef.current, ...newPoints].slice(-500);
                chartDataRef.current = updated;
                setChartData(updated);
            }

            if (buffer.current.length > 1000) {
                buffer.current = buffer.current.slice(-500);
            }

        }, 60);

        return () => {
            sub.unsubscribe();
            aiSub.unsubscribe();
            clearInterval(ticker);
        };
    }, [pubsub, topic]);

    return (
        <div style={{ height: '350px', background: '#111', borderRadius: '8px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ color: '#00ff00', margin: '0 0 10px 0' }}>ECG Live Monitor</h3>
                {/* Visual Alert Indicator */}
                {chartData.some(p => anomalyBatches.has(p.batchId)) && (
                    <span style={{ color: 'red', fontWeight: 'bold', animation: 'blink 1s infinite' }}> ANOMALY DETECTED</span>
                )}
            </div>
            
            <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid stroke="#333" vertical={false} />
                    <XAxis hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={chartData.length>0 && anomalyBatches.has(chartData[chartData.length - 1].batchId) ? '#ff0000' : '#00ff00'}
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={false}
                    />


                </LineChart>
            </ResponsiveContainer>
            </div>
            <style>{`
                @keyframes blink { 0% {opacity: 1;} 50% {opacity: 0;} 100% {opacity: 1;} }
            `}</style>
        </div>
    );
};

export default EcgLiveChart;