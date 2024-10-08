using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class APICallbackReceiver : MonoBehaviour
{
    [System.Serializable]
    public class ReceivedData
    {
        public int targetRank;
        public long userPoint;
    }

    public void OnAPICallback(string jsonData)
    {
        // JSON文字列をデシリアライズして、ReceivedDataオブジェクトに変換
        ReceivedData data = JsonUtility.FromJson<ReceivedData>(jsonData);

        // 取得したデータを使用する
        Debug.Log("Received target_rank: " + data.targetRank);
        Debug.Log("Received user_point: " + data.userPoint);

        // WebGLDataStoreにデータを保存
        WebGLDataStore.targetRank = data.targetRank;
        WebGLDataStore.userPoint = data.userPoint;
    }
}
