using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SwipeDetection : MonoBehaviour
{
    private Vector2 startTouchPosition, currentTouchPosition, lastTouchPosition;
    private float minSwipeDistance = 50f; // スワイプと認識する最小距離
    private float diagonalTolerance = 0.4f; // 斜め判定の許容範囲（小さいほど厳密な方向判定）
    private float minMovementThreshold = 10f; // スワイプの途中でも動きを確認する最小移動距離

    void Update()
    {
        // スマホのタッチ操作
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);

            switch (touch.phase)
            {
                case TouchPhase.Began:
                    StartSwipe(touch.position);
                    break;

                case TouchPhase.Moved:
                    UpdateSwipe(touch.position);
                    break;

                case TouchPhase.Ended:
                    EndSwipe(touch.position);
                    break;
            }
        }

        // マウス操作
        if (Input.GetMouseButtonDown(0))
        {
            StartSwipe(Input.mousePosition);
        }

        if (Input.GetMouseButton(0)) // マウスが押されている間
        {
            UpdateSwipe(Input.mousePosition);
        }

        if (Input.GetMouseButtonUp(0))
        {
            EndSwipe(Input.mousePosition);
        }
    }

    void StartSwipe(Vector2 position)
    {
        startTouchPosition = position;
        lastTouchPosition = position; // 直前の位置を初期化
    }

    void UpdateSwipe(Vector2 position)
    {
        currentTouchPosition = position;
        Vector2 swipeVector = currentTouchPosition - lastTouchPosition;

        // スワイプの途中でも十分に動いているかをチェック
        if (swipeVector.magnitude > minMovementThreshold)
        {
            Vector2 totalSwipeVector = currentTouchPosition - startTouchPosition;

            // スワイプの全体距離が十分かどうか
            if (totalSwipeVector.magnitude > minSwipeDistance)
            {
                DetectSwipe(totalSwipeVector);
            }

            lastTouchPosition = currentTouchPosition; // 位置を更新して連続判定
        }
    }

    void EndSwipe(Vector2 position)
    {
        // スワイプが止まってもここでは何もしない
    }

    void DetectSwipe(Vector2 swipeVector)
    {
        // ベクトルを正規化してXとYの比率を使用
        swipeVector.Normalize();

        if (Mathf.Abs(swipeVector.x) > Mathf.Abs(swipeVector.y))
        {
            // 横方向のスワイプ
            if (swipeVector.x > diagonalTolerance)
            {
                Debug.Log("right");
            }
            else if (swipeVector.x < -diagonalTolerance)
            {
                Debug.Log("left");
            }
            else
            {
                Debug.Log("miss"); // 斜めスワイプを無効
            }
        }
        else
        {
            // 縦方向のスワイプ
            if (swipeVector.y > diagonalTolerance)
            {
                Debug.Log("up");
            }
            else if (swipeVector.y < -diagonalTolerance)
            {
                Debug.Log("down");
            }
            else
            {
                Debug.Log("miss"); // 斜めスワイプを無効
            }
        }
    }
}