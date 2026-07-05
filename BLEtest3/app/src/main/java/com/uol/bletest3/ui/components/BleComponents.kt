package com.uol.bletest3.ui.components

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanResult
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ScanButton(
    modifier: Modifier = Modifier,
    isScanning: Boolean,
    onScanClick: () -> Unit
) {
    Button(onClick = onScanClick, modifier = modifier){
        Text(if (isScanning) "Stop BLE scan" else "Start BLE scan")
    }
}

@Composable
fun BleDeviceList(
    scanResults: List<ScanResult>,
    connectedDeviceAddress: String?,
    onConnectClick: (BluetoothDevice) -> Unit,
    onDisconnectClick: () -> Unit
){
    LazyColumn {
        items(items = scanResults, key = { it.device.address }) { result ->
            BleDeviceItem(
                result = result,
                onConnectClick = onConnectClick,
                onDisconnectClick = onDisconnectClick,
                isConnected = result.device.address == connectedDeviceAddress
            )
        }
    }
}

@SuppressLint("MissingPermission")
@Composable
fun BleDeviceItem(
    result: ScanResult,
    onConnectClick: (BluetoothDevice) -> Unit,
    onDisconnectClick: () -> Unit,
    isConnected: Boolean
){
    val device = result.device
    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)){
        Column(modifier = Modifier.padding(16.dp)){
            Text(text = device.name ?: "Unknown Device",  style = MaterialTheme.typography.titleMedium)
            Text(text = "MAC: ${device.address}", style = MaterialTheme.typography.bodySmall)

            if (!isConnected){
                Button(onClick = { onConnectClick(device) }) { Text("Connect") }
            } else{
                Button(onClick = onDisconnectClick, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)){
                    Text("Disconnect")
                }
            }
        }
    }

}