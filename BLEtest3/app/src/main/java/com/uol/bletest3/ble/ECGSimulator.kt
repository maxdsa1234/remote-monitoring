package com.uol.bletest3.ble

import com.google.gson.reflect.TypeToken
import java.io.InputStreamReader
import java.util.concurrent.ScheduledExecutorService
import android.content.Context
import com.google.gson.Gson
import com.uol.bletest3.iot.AwsMqttManager
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class ECGSimulator(private val context: Context, private val awsMqttManager: AwsMqttManager) {
    private var data : List<Double> = listOf()
    private val buffer : MutableList<Double> = mutableListOf()
    private var executor: ScheduledExecutorService? = null
    private var sampleIndex: Int = 0
    private var totalSamplesProcessed: Int = 0  // number of points total points to be sent is 140 X 60 = 8,400

    // Sample rate, batch and duration settings
    private val SAMPLING_RATE_MS = 7L // 7L means Long type instead of int, teh timer requires Long. It is ~140 Hz because 140 Hz ~ 7ms
    private val BATCH_SIZE = 500   // Points to collect before sending
    private val MAX_DURATION_S = 60  // stop after 1 min

    fun startSimulation( fileName: String){
        try{
            val inputStream = context.assets.open(fileName)
            val reader = InputStreamReader(inputStream)
            val itemType = object: TypeToken<List<Double>>() {}.type

            data = Gson().fromJson(reader, itemType) // Parser translates String into Kotlin List<Double>
            reader.close()
        } catch (e: Exception){
            e.printStackTrace()
            return
        }

        // Reset everything
        stopSimulation()
        sampleIndex = 0
        totalSamplesProcessed = 0
        buffer.clear()

        // Assign executor
        executor = Executors.newSingleThreadScheduledExecutor()

        executor?.scheduleWithFixedDelay({
            runSimulation()
        }, 0, SAMPLING_RATE_MS, TimeUnit.MILLISECONDS)

    }

    private fun runSimulation(){
        if (data.isEmpty()) return

        val currentPoint = data[sampleIndex % data.size]  // loops back to 0 140 % 140 = 0
        buffer.add(currentPoint)

        sampleIndex++
        totalSamplesProcessed++

        // Buffer size check
        if (buffer.size >= BATCH_SIZE){
            val batchToSend = ArrayList(buffer)
            buffer.clear()
            uploadToCloud(batchToSend)
        }

        // total samples check
        if (totalSamplesProcessed >= (140 * MAX_DURATION_S)) {
            stopSimulation()
        }

    }

    private fun uploadToCloud(dataBatch: List<Double>) {
        println("SIMULATOR: Uploading batch of ${dataBatch.size} points to AWS....")
        awsMqttManager.publishEcgBatch(dataBatch)
    }

    fun stopSimulation(){
        executor?.shutdownNow()
        executor = null
        println("SIMULATOR: STOPPED.")
    }
}