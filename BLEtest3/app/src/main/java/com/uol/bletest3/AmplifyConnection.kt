package com.uol.bletest3

import android.app.Application
import android.util.Log
import com.amazonaws.mobile.client.AWSMobileClient
import com.amazonaws.mobile.client.UserStateDetails
import com.amplifyframework.AmplifyException
import com.amplifyframework.auth.cognito.AWSCognitoAuthPlugin
import com.amplifyframework.core.Amplify
import com.amazonaws.mobile.client.Callback

class AmplifyConnection : Application() {
    override fun onCreate() {
        super.onCreate()

        try {
            Amplify.addPlugin(AWSCognitoAuthPlugin())
            Amplify.configure(applicationContext)
            Log.i("Amplify", "Initialized Amplify")
        } catch (error: AmplifyException){
            Log.e("Amplify", "Could not initialize Amplify", error)
        }

        AWSMobileClient.getInstance().initialize(applicationContext, object: Callback<UserStateDetails> {
            override fun onResult(result: UserStateDetails){
                Log.i("Amplify", "AWSMobileClient intialised: ${result.userState}")
            }
            override fun onError(e:Exception){
                Log.e("Amplify", "AWSMobileClient error", e)
            }
        })
    }
}