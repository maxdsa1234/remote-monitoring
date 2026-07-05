import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listHeartRateData } from '../graphql/queries';
import {
  LineChart, ResponsiveContainer, YAxis,
  CartesianGrid, Line, XAxis, Tooltip
} from 'recharts';

const HeartRateChart = ({ pubsub, patientId }) => {
  const [chartData, setChartData] = useState([]);
  const client = React.useMemo(() => generateClient({ authMode: 'apiKey'}), []);

  useEffect(() => {
    if (!patientId){
      console.warn("HeartRateChart: Patient Id is undefined, skipping");
      return;
    }

    const connectionSub = pubsub.connectionStateMonitor?.connectionStateObservable?.subscribe({
      next: state => {
        console.log('IoT COnnectionstate chagned: ', state);
      }
    });
    
    const fetchHistory = async () => {
      try {
        let allItems = [];
        let nextToken = null;

        do {
          const response = await client.graphql({
            query: listHeartRateData,
            variables: {
              filter: { patientId: { eq: patientId } },
              limit: 100,
              ...(nextToken ? { nextToken } : {}),
            },
          });

          const page = response.data.listHeartRateData;
          allItems = [...allItems, ...page.items];
          nextToken = page.nextToken;
        } while (nextToken);

        const history = allItems
          .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
          .map(item => {
            const ts = Number(item.timestamp);
            // Android sends Unix seconds (ms/1000), so always multiply by 1000
            const date = new Date(ts * 1000);
            return {
              time: date.toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              }),
              heartRate: item.heartRate,
            };
          });

        setChartData(history.slice(-20));
      } catch (err) {
        console.error('Error fetching HR history:',
          JSON.stringify(err?.errors ?? err, null, 2)
        );
      }
    };

    fetchHistory();
    
    console.log('pubsub object: ', pubsub);
    console.log('patientId:', patientId);
    console.log('Subscribing to: ', `patients/${patientId}/heartRate`);

    const sub = pubsub.subscribe({
      topics: `patients/${patientId}/heartRate`,
    }).subscribe({
      next: data => {
        console.log("Raw PubSub Data: ", JSON.stringify(data));

        const payload = data.value || data;
        const newPoint = {
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          }),
          heartRate: payload.heartRate,
        };
        setChartData(prev => [...prev.slice(-19), newPoint]);
      },
      error: err => console.error('PubSub error:', err),
      complete: () => console.log('PubSub Completed')
    });

    return () => sub.unsubscribe();
  }, [client, pubsub, patientId]);

  return (
    <div style={{ width: '100%', height: 200, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" vertical={false} />
          <XAxis dataKey="time" />
          <YAxis domain={[40, 180]} orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="stepAfter"
            dataKey="heartRate"
            stroke="#e74c3c"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#e74c3c' }}>
        {chartData.length > 0 ? chartData[chartData.length - 1].heartRate : '--'} BPM
      </div>
    </div>
  );
};

export default HeartRateChart;