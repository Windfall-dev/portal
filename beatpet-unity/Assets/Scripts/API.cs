using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

[Serializable]
public class ApiMessage
{
    public string type;
    public string session_id;
    public string stage;
    public long start_time;
    public string api_url;
    public string token;
    public string game_id;
    public List<TapData> tap_data;
    public List<string> judgment_data;
    public long end_time;
    public long score;
    public string user_id;
    public long point;
}

public class API : MonoBehaviour
{
    public void StartGame()
    {
        DateTime now = DateTime.UtcNow;
        DateTime unixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        long unixTime = (long)(now - unixEpoch).TotalSeconds;
        string session_id = "beatpet-" + "-" + WebGLDataStore.userId + "-" + unixTime;
        WebGLDataStore.sessionId = session_id;
        // Create an instance of the ApiMessage class
        ApiMessage message = new ApiMessage
        {
            type = "StartAPI",
            session_id = session_id,
            stage = "stage-1",
            start_time = unixTime,
            api_url = WebGLDataStore.fastApiUrl,
            token = WebGLDataStore.token,
        };
        string jsonMessage = JsonUtility.ToJson(message);
        Application.ExternalEval("window.postMessage(" + jsonMessage + ", '*');");
    }

    public void EndGame()
    {
        int unixTime = (int)(System.DateTime.UtcNow.Subtract(new System.DateTime(1970, 1, 1))).TotalSeconds;

        ApiMessage message = new ApiMessage
        {
            type = "EndAPI",
            session_id = WebGLDataStore.sessionId,
            game_id = "beatpet",
            tap_data = OperationDataStore.tap_data,
            judgment_data = OperationDataStore.judgment_data,
            end_time = unixTime,
            api_url = WebGLDataStore.fastApiUrl,
            token = WebGLDataStore.token,
            score = WebGLDataStore.score,
            user_id = WebGLDataStore.userId
        };
        string jsonMessage = JsonUtility.ToJson(message);
        Debug.Log(jsonMessage);
        Application.ExternalEval("window.postMessage(" + jsonMessage + ", '*');");
    }

    public void GetRank()
    {
        // Create an instance of the ApiMessage class
        ApiMessage message = new ApiMessage
        {
            type = "RankAPI",
            api_url = WebGLDataStore.fastApiUrl,
            token = WebGLDataStore.token,
            point = WebGLDataStore.point,
        };
        string jsonMessage = JsonUtility.ToJson(message);
        Application.ExternalEval("window.postMessage(" + jsonMessage + ", '*');");
    }
}
