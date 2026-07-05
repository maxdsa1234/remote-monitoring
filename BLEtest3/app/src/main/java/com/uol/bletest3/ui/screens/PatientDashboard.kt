package com.uol.bletest3.ui.screens

import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanResult
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.uol.bletest3.ui.components.BleDeviceList
import androidx.compose.ui.Modifier
import com.uol.bletest3.ui.components.ScanButton

@Composable
fun PatientDashboard(
    isScanning: Boolean,
    scanResults: List<ScanResult>,
    connectedDeviceAddress: String?,
    onScanToggle: () -> Unit,
    onSimulateHealthy: () -> Unit,
    onSimulateAnomaly: () -> Unit,
    onStopSim: () -> Unit,
    onConnect: (BluetoothDevice) -> Unit,
    onDisconnect: () -> Unit,
    onSignOut: () -> Unit
){
    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            Text("Patient Portal", style = MaterialTheme.typography.headlineMedium)

            ScanButton(isScanning = isScanning, onScanClick = onScanToggle)

            Spacer(modifier = Modifier.height(16.dp))

            Button(onClick = onSimulateHealthy, modifier = Modifier.fillMaxWidth()){
                Text("Healthy ecg demo (1 min)")
            }

            Button(onClick = onSimulateAnomaly, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)){
                Text("Anomaly ECG Demo (1 min)")
            }

            Button( onClick = onStopSim, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary)){
                Text("Stop Simulation")
            }

            BleDeviceList(
                scanResults = scanResults,
                connectedDeviceAddress = connectedDeviceAddress,
                onConnectClick = onConnect,
                onDisconnectClick = onDisconnect
            )

            Spacer(modifier = Modifier.weight(1f))

            Button(onClick = onSignOut, modifier = Modifier.fillMaxWidth()){
                Text("Sign Out")
            }
        }
    }


}