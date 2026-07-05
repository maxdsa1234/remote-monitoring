package com.uol.bletest3

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import android.app.AlertDialog
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.util.Log
import androidx.annotation.RequiresPermission
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.uol.bletest3.ble.BleManager
import com.uol.bletest3.ble.ECGSimulator
import com.uol.bletest3.iot.AwsMqttManager
import com.uol.bletest3.ui.screens.PatientDashboard
import com.uol.bletest3.ui.theme.BLEtest3Theme
import java.util.UUID
import kotlinx.coroutines.launch
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import com.amplifyframework.ui.authenticator.ui.Authenticator
import com.amplifyframework.ui.authenticator.enums.AuthenticatorStep




private const val PERMISSION_REQUEST_CODE = 1

class MainActivity : AppCompatActivity() {

    private lateinit var awsMqttManager: AwsMqttManager
    private lateinit var bleManager: BleManager

    private var isScanning by mutableStateOf(false)
    private val scanResults = mutableStateListOf<ScanResult>()
    private var connectedDeviceAddress by mutableStateOf<String?>(null)

    private lateinit var ecgSimulator: ECGSimulator // simulation for demo

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        awsMqttManager = AwsMqttManager(this)

        // initialising ecgSimulator
        ecgSimulator = ECGSimulator(this, awsMqttManager)

        // initialising BleManager
        bleManager = BleManager(
            context = this,
            onHeartRateReceived = { hr ->
                Log.i("MainActivity", "HR: $hr")
                awsMqttManager.publishHeartRate(hr)
            },
            onConnectionStateChanged = { address, isConnected ->
                connectedDeviceAddress = if (isConnected) address else null
            }
        )

        enableEdgeToEdge()
        setContent {
            BLEtest3Theme {
                Authenticator { state ->
                    val scope = rememberCoroutineScope()
                    var hasConnected by remember { mutableStateOf(false) }
                    LaunchedEffect(state.step) {
                        if (state.step is AuthenticatorStep.SignedIn && !hasConnected){
                            hasConnected = true
                            awsMqttManager.attachPolicyAndConnect()
                        }
                    }

                    PatientDashboard(
                        isScanning = isScanning,
                        scanResults = scanResults,
                        connectedDeviceAddress = connectedDeviceAddress,
                        onScanToggle = { if(isScanning) stopBleScan() else startBleScan()},
                        onSimulateHealthy = { ecgSimulator.startSimulation("healthy_demo.json")},
                        onSimulateAnomaly = { ecgSimulator.startSimulation("unhealthy_demo.json")},
                        onStopSim = { ecgSimulator.stopSimulation()},
                        onConnect = { bleManager.connect(it) },
                        onDisconnect = {bleManager.disconnect()},
                        onSignOut = {
                            scope.launch { state.signOut() } }
                    )

                }
            }
        }
    }


    override fun onDestroy() {
        super.onDestroy()
        ecgSimulator.stopSimulation()
        awsMqttManager.disconnect()
    }

    // BLE START
    @SuppressLint("MissingPermission")
    private fun startBleScan(){
        if (!hasRequiredBluetoothPermissions()) {
            requestRelevantRuntimePermissions()
        } else{
            scanResults.clear()
            bleManager.startScan(scanCallback)
            isScanning = true
        }
    }


    @SuppressLint("MissingPermission")
    private fun stopBleScan(){
        bleManager.stopScan(scanCallback)
        isScanning = false
    }

    private val scanCallback = object : ScanCallback(){
        @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
        override fun onScanResult(callbackType: Int, result : ScanResult){
            val deviceName = result.device.name ?: "Unknown"

            val serviceUuids = result.scanRecord?.serviceUuids
            val isHeartRateDevice = serviceUuids?.any {
                it.uuid == UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb")
            } ?: false

            // Since Simulated device from LightBlue does not advertise 180D UUID
            val isDemoDevice = deviceName.contains("Heart", ignoreCase = true)

            // Filtering heart rate devices
            if (isHeartRateDevice || isDemoDevice) {
                val index = scanResults.indexOfFirst { it.device.address == result.device.address }
                if (index != -1) scanResults[index] = result else scanResults.add(result)
            }

        }
    }


    // To check permissions
    fun Context.hasPermission(permissionType: String): Boolean {
        return ContextCompat.checkSelfPermission(this, permissionType) == PackageManager.PERMISSION_GRANTED
    }

    fun Context.hasRequiredBluetoothPermissions(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            hasPermission(Manifest.permission.BLUETOOTH_SCAN) && hasPermission(Manifest.permission.BLUETOOTH_CONNECT)
        } else{
            hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }



    private fun Activity.requestRelevantRuntimePermissions(){
        if (hasRequiredBluetoothPermissions()){ return }
        when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.S -> {
                requestLocationPermission()
            }
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
                requestBluetoothPermissions()
            }
        }
    }

    private fun requestLocationPermission() = runOnUiThread{
        AlertDialog.Builder(this)
            .setTitle("Location permission required")
            .setMessage(
                "Starting from Android M (6.0), the system requires apps to be granted " +
                        "location access in order to scan for BLE devices."
            )
            .setCancelable(false)
            .setPositiveButton(android.R.string.ok){ _, _ ->
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                    PERMISSION_REQUEST_CODE
                )
            }.show()
    }

    @RequiresApi(Build.VERSION_CODES.S)
    private fun requestBluetoothPermissions() = runOnUiThread {
        AlertDialog.Builder(this)
            .setTitle("Bluetooth permission required")
            .setMessage(
                "Starting from Android 12, the system requires apps to be granted " +
                        "Bluetooth access in order to scan for and connect to BLE devices."
            )
            .setCancelable(false)
            .setPositiveButton(android.R.string.ok) { _, _ ->
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(
                        Manifest.permission.BLUETOOTH_SCAN,
                        Manifest.permission.BLUETOOTH_CONNECT
                    ),
                    PERMISSION_REQUEST_CODE
                )
            }
            .show()
    }
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ){
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if(requestCode != PERMISSION_REQUEST_CODE) return

        val containsPermanentDenial = permissions.zip(grantResults.toTypedArray()).any {
            it.second == PackageManager.PERMISSION_DENIED && !ActivityCompat.shouldShowRequestPermissionRationale(this, it.first)
        }

        val containsDenial = grantResults.any {it == PackageManager.PERMISSION_DENIED}
        val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
        when {
            containsPermanentDenial -> {
            }

            containsDenial -> {
                requestRelevantRuntimePermissions()
            }

            allGranted && hasRequiredBluetoothPermissions() -> {
                startBleScan()
            }

            else ->{
                // Unexpected scenario encountered when handling permissions
                ActivityCompat.recreate(this)
            }
        }
    }

}









