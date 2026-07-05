package com.uol.bletest3.iot

import android.content.Context
import android.util.Log
import com.amazonaws.auth.CognitoCachingCredentialsProvider
import com.amazonaws.mobileconnectors.iot.AWSIotMqttClientStatusCallback
import com.amazonaws.mobileconnectors.iot.AWSIotMqttManager
import com.amazonaws.mobileconnectors.iot.AWSIotMqttQos
import com.amazonaws.regions.Region
import com.amazonaws.regions.Regions
import com.amplifyframework.auth.cognito.AWSCognitoAuthSession
import org.json.JSONArray
import org.json.JSONObject
import com.amplifyframework.core.Amplify
import com.amazonaws.services.lambda.AWSLambdaClient
import com.amazonaws.services.lambda.model.InvokeRequest
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets

class AwsMqttManager(private val context: Context) {

    private val endpoint = "YOUR_AWS_IOT_ENDPOINT"
    private var mqttManager: AWSIotMqttManager? = null
    private var isConnected = false
    private var isConnecting = false
    private val identityPoolId = "YOUR_IDENTITY_POOL_ID"
    private var currentIdentityId: String? = null
    private var userSubId: String? = null

    fun PatientId(){
        Amplify.Auth.fetchUserAttributes(
            { attributes ->
                val sub = attributes.find { it.key.keyString == "sub" }?.value
                userSubId = sub
                Log.i("AWS_MQTT", "Patient Sub ID: $sub")
            },
            {Log.e("AWS_MQTT", "Failed to sub", it)}
        )
    }

    // To get credentials from AWS
    private fun buildCredentialsProvider(idToken:String) : CognitoCachingCredentialsProvider{
        val provider = CognitoCachingCredentialsProvider (
            context,
            identityPoolId,
            Regions.EU_WEST_2
        )

        val loginKey = "YOUR_COGNITO_LOGIN_KEY"

        provider.clear()
        provider.logins = mapOf(loginKey to idToken)
        return provider
    }

    // To disconnect for MQTT
    private fun safeDisconnectMqtt() {
        try {
            mqttManager?.disconnect()
        } catch (e: Exception) {
            Log.w("AWS_MQTT", "Error during disconnection for MQTT", e)

        } finally {
            mqttManager = null
            isConnected = false
        }
    }

    // Publish Heart Rate
    fun publishHeartRate(heartRate: Int) {
        val topic = "YOUR_IOT_TOPIC"

        if (!isConnected) {
            Log.w("AWS_MQTT", "Not published, no connected")
            return
        }

        try {
            val timestamp = System.currentTimeMillis()

            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
            sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
            val isoDate = sdf.format(java.util.Date(timestamp))

            val jsonPayload = JSONObject()
            jsonPayload.put("patientId", userSubId)
            jsonPayload.put("heartRate", heartRate)
            // Need to divide by 1000 to get Unix seconds which is standard for IoT and web
            jsonPayload.put("timestamp", timestamp/1000)
            jsonPayload.put("createdAt", isoDate)
            jsonPayload.put("updatedAt", isoDate)

            val payloadString = jsonPayload.toString()

            mqttManager?.publishString(payloadString, topic, AWSIotMqttQos.QOS0)
            Log.i("AWS_MQTT", "Published: $payloadString")
        } catch (e: Exception) {
            Log.e("AWS_MQTT", "Publish failed", e)
        }
    }

    // Publish Ecg Batch
    fun publishEcgBatch(ecgBatch: List<Double>) {

        val topic = "YOUR_IOT_TOPIC"

        if (!isConnected) {
            Log.w("AWS_MQTT", "Not published, no connected")
            return
        }

        try {
            val jsonPayload = JSONObject()
            jsonPayload.put("patientId", userSubId)

            val ecgArray = JSONArray(ecgBatch)
            jsonPayload.put("ecgWaveform", ecgArray)

            jsonPayload.put("timestamp", System.currentTimeMillis())

            val payloadString = jsonPayload.toString()
            mqttManager?.publishString(payloadString, topic, AWSIotMqttQos.QOS0)

            Log.i("AWS_MQTT_ECG", "Successfully published batch of ${ecgBatch.size} points")
        } catch (e: Exception) {
            Log.e("AWS_MQTT_ECG", "Failed to publish ECG batch", e)
        }
    }

    // Disconnect MQTT
    fun disconnect() {
        safeDisconnectMqtt()
        isConnecting = false
        Log.i("AWS_MQTT", "Disconnected")
    }

    // Attaching policy through lambda function and connecting to IoT
    @Synchronized
    fun attachPolicyAndConnect() {

        if (isConnected || isConnecting) {
            Log.d("AWS_MQTT", "Already connected or in progress")
            return
        }

        isConnecting = true

        Amplify.Auth.fetchAuthSession(
            { session ->

                Amplify.Auth.fetchUserAttributes(
                    { attributes ->
                        userSubId = attributes.find { it.key.keyString == "sub" }?.value
                        Log.i("AWS_MQTT", "Patient Sub ID: $userSubId")

                        val cognitoSession = session as AWSCognitoAuthSession
                        val idToken = cognitoSession.userPoolTokensResult.value?.idToken

                        if (idToken == null){
                            val error = cognitoSession.userPoolTokensResult.error
                            Log.e("AWS_MQTT", "Token missing: ${error?.message}")
                            isConnecting = false
                            return@fetchUserAttributes
                        }

                        try {

                            context.getSharedPreferences("com.amazonaws.auth.CognitoCachingCredentialsProvider", Context.MODE_PRIVATE).edit().clear().commit()
                            
                            val credentialsProvider = buildCredentialsProvider(idToken)

                            credentialsProvider.refresh()
                            val identityId = try {
                                credentialsProvider.identityId
                            } catch (e:Exception){
                                Log.e("AWS_MQTT", "Failed to get identityId", e)
                                isConnecting = false
                                return@fetchUserAttributes
                            }

                            this.currentIdentityId = identityId

                            try {
                                credentialsProvider.credentials
                            } catch(e: Exception){
                                Log.e("AWS_MQTT", "Failed to get AWS Credentials", e)
                                isConnecting = false
                                return@fetchUserAttributes
                            }

                            if (identityId == null){
                                Log.e("AWS_MQTT", "Identity ID is null")
                                isConnecting = false
                                return@fetchUserAttributes
                            }

                            Log.i("AWS_MQTT", "Authenticated Identity ID: $identityId")

                            safeDisconnectMqtt()

                            // IOT POLICY SERVICE
                            val lambdaClient = AWSLambdaClient(credentialsProvider)
                            lambdaClient.setRegion(Region.getRegion(Regions.EU_WEST_2))
                            val jsonPayload = "{\"identityId\" : \"$identityId\"}"
                            val payloadBuffer =
                                ByteBuffer.wrap(jsonPayload.toByteArray(StandardCharsets.UTF_8))
                            val request = InvokeRequest().withFunctionName("AuthAttachIoTPolicy")
                                .withPayload(payloadBuffer)

                            val result = lambdaClient.invoke(request)
                            if (result.statusCode != 200){
                                Log.e("AWS_MQTT", "Lambda failed: ${result.functionError}")
                                isConnecting = false
                                return@fetchUserAttributes
                            }
                            Log.i("AWS_MQTT", "Policy attached successfully")

                            try{
                                Log.i("AWS_MQTT", "Waiting for AWS Policy propagation...")
                                Thread.sleep(1000)
                            } catch(e: Exception){
                                Log.w("AWS_MQTT", "Sleep interrupted", e)
                            }


                
                            val clientId = identityId
                            val manager = AWSIotMqttManager(clientId, endpoint)

                            manager.isAutoReconnect = false
                            manager.keepAlive = 30
                            manager.setOfflinePublishQueueEnabled(true)

                            mqttManager = manager


                            manager.connect(credentialsProvider) { status, throwable ->
                                when (status) {
                                    AWSIotMqttClientStatusCallback.AWSIotMqttClientStatus.Connected -> {
                                        isConnected = true
                                        isConnecting = false
                                        Log.i("AWS_MQTT", "AWS SUCCESSFUL CONNECTION")
                                    }

                                    AWSIotMqttClientStatusCallback.AWSIotMqttClientStatus.Connecting -> {
                                        Log.i("AWS_MQTT", "AWS CONNECTING")
                                    }

                                    AWSIotMqttClientStatusCallback.AWSIotMqttClientStatus.ConnectionLost -> {
                                        isConnecting = false
                                        isConnected = false
                                        Log.e("AWS_MQTT", "AWS Connection LOST")
                                    }

                                    AWSIotMqttClientStatusCallback.AWSIotMqttClientStatus.Reconnecting -> {
                                        Log.i("AWS_MQTT", "AWS RECONNECTING")
                                    }

                                    else -> {
                                        isConnecting = false
                                        isConnected = false
                                        Log.d("AWS_MQTT", "Status change: $status")
                                    }
                                }
                                if (throwable != null){
                                    Log.e("AWS_MQTT", "MQTT error: ${throwable.message}", throwable)
                                }
                            }

                        } catch (e: Exception) {
                            isConnecting = false
                            Log.e("AWS_MQTT", "Provider refresh failed", e)
                        }
                    },
                    {Log.e("AWS_MQTT", "Failed to sub", it)}
                )



            },
            { error ->
                isConnecting =  false
                Log.e("AWS_MQTT", "Fetch session failed", error) }
        )
    }



}