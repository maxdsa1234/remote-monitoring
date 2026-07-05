package com.uol.bletest3.ble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.util.UUID



// Standard UUIDs
private val HEART_RATE_SERVICE_UUID = UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb")
private val HEART_RATE_MEASUREMENT_CHAR_UUID = UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb")
private val BODY_SENSOR_LOCATION_CHAR_UUID = UUID.fromString("00002a38-0000-1000-8000-00805f9b34fb")
private val CCC_DESCRIPTOR_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

@SuppressLint("MissingPermission")
class BleManager(
    private val context: Context,
    private val onHeartRateReceived: (Int) -> Unit,
    private val onConnectionStateChanged: (String?, Boolean) -> Unit
) {
    private val bluetoothAdapter: BluetoothAdapter by lazy {
        val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        manager.adapter
    }
    private val bleScanner by lazy { bluetoothAdapter.bluetoothLeScanner }
    private var bluetoothGatt: BluetoothGatt? = null

    private val scanSettings = ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build()

    // BLE SCANNING LOGIC
    fun startScan(scanCallback: ScanCallback){
        bleScanner?.startScan(null, scanSettings, scanCallback)
    }

    fun stopScan(scanCallback: ScanCallback){
        bleScanner?.stopScan(scanCallback)
    }

    // CONNECTION
    fun connect(device: BluetoothDevice){
        if (bluetoothGatt != null) return
        bluetoothGatt = device.connectGatt(context, false, gattCallback)
    }

    fun disconnect(){
        bluetoothGatt?.disconnect()
        bluetoothGatt?.close()
        bluetoothGatt = null
        onConnectionStateChanged(null,false)
    }

    private val gattCallback = object : BluetoothGattCallback(){
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int){
            val address = gatt.device.address
            if (status == BluetoothGatt.GATT_SUCCESS){
                if (newState == BluetoothProfile.STATE_CONNECTED){
                    onConnectionStateChanged(address, true)
                    Handler(Looper.getMainLooper()).post {
                        gatt.discoverServices()
                    }
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED){
                    disconnect()
                }
            } else{
                Log.e("BleManager", "GATT Error: $status")
                disconnect()
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int){
            if (status != BluetoothGatt.GATT_SUCCESS) return

            val hrService = gatt.getService(HEART_RATE_SERVICE_UUID)
            val hrChar = hrService?.getCharacteristic(HEART_RATE_MEASUREMENT_CHAR_UUID)

            hrChar?.let{ enableNotifications(it) }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray
        ) {
            if (characteristic.uuid == HEART_RATE_MEASUREMENT_CHAR_UUID) {
                Log.d("DEBUG", "Received raw value: $value")
                onHeartRateReceived(parseHeartRate(value))
                val parsed = parseHeartRate(value)
                Log.d("DEBUG", "Raw value parsed: $parsed")
            }
        }

        @Deprecated("Deprecated for API 33+")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            onCharacteristicChanged(gatt, characteristic, characteristic.value)
        }
    }


    private fun enableNotifications(characteristic: BluetoothGattCharacteristic) {
        val gatt = bluetoothGatt ?: return
        gatt.setCharacteristicNotification(characteristic, true)

        val descriptor = characteristic.getDescriptor(CCC_DESCRIPTOR_UUID)
        val payload = if (characteristic.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY != 0) {
            BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        } else{
            BluetoothGattDescriptor.ENABLE_INDICATION_VALUE
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            gatt.writeDescriptor(descriptor, payload)
        } else{
            descriptor.value = payload
            gatt.writeDescriptor(descriptor)
        }
    }

    private fun parseHeartRate(data: ByteArray): Int {
        if (data.isEmpty()) return 0
        val flags = data[0].toInt()
        val is16Bit = flags and 0x01 != 0
        return if (is16Bit) {
            ((data[2].toInt() and 0xFF) shl 8) or (data[1].toInt() and 0xFF)
        } else{
            data[1].toInt() and 0xFF
        }
    }
}