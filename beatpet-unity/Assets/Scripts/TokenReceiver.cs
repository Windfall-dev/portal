using UnityEngine;

public class TokenReceiver : MonoBehaviour
{
    [System.Serializable]
    public class ReceivedData
    {
        public string token;
        public string apiUrl;
        public string userId;
    }

    public void ReceiveToken(string jsonData)
    {
        // JSON文字列をデシリアライズして、ReceivedDataオブジェクトに変換
        ReceivedData data = JsonUtility.FromJson<ReceivedData>(jsonData);

        // 取得したデータを使用する
        Debug.Log("Received Token: " + data.token);
        Debug.Log("Received API URL: " + data.apiUrl);
        Debug.Log("Received UserId: " + data.userId);

        // WebGLDataStoreにデータを保存
        WebGLDataStore.token = data.token;
        WebGLDataStore.fastApiUrl = data.apiUrl;
        WebGLDataStore.userId = data.userId;
    }
}
