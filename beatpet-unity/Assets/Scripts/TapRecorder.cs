using UnityEngine;
using System;
using System.Collections.Generic;

public class TapRecorder : MonoBehaviour
{
    // 事前にメモリ確保（キャッシュ）しておくフィールド
    private Vector2 tapCoords = Vector2.zero; // 再利用するためにクラスフィールドとして宣言
    private long unixTime; // タップタイムを保存する変数

    void Update()
    {
        // マウスクリックまたはタップが検出された場合のみ処理を実行
        if (Input.GetMouseButtonDown(0))
        {
            RecordTap();
        }
    }

    // タップを記録する処理を関数化
    private void RecordTap()
    {
        // タイムスタンプを取得 (Unixタイム)
        unixTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        // タップ位置（画面上の座標）を取得
        Vector3 tapPosition = Input.mousePosition;
        Debug.Log(tapPosition);
        // 2Dのタップ座標（X, Y）を取得
        tapCoords.Set(tapPosition.x, tapPosition.y); // 新しいVector2を作成せずに再利用
        Debug.Log(tapCoords);
        // TapDataの作成と保存
        TapData newTap = new TapData
        {
            time = unixTime,
            position = tapCoords
        };
        Debug.Log(newTap.ToString());
        // データストアに保存
        OperationDataStore.tap_data.Add(newTap);
    }
}
