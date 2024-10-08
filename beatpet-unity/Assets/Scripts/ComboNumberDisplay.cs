using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ComboNumberDisplay : MonoBehaviour
{
    // 数字のプレハブをアタッチする
    public GameObject numberPrefab;
    // 数字を表示する親オブジェクト
    public RectTransform numberParent;
    // 数字スプライトのリストをInspectorで設定
    public List<Sprite> numberSprites;
    // 数字間のスペース
    public float digitSpacing = 50f;

    // 左寄せの基準位置
    public float leftFixedPosition = 0f;

    // 数字を入力として受け取り、画像に変換して表示するメソッド
    public void DisplayNumber(int number)
    {
        // 既存の表示をクリア
        foreach (Transform child in numberParent)
        {
            Destroy(child.gameObject);
        }

        // 数字を1桁ずつ分解し、対応するスプライトを取得
        string numberString = number.ToString();
        int numDigits = numberString.Length;

        // 左寄せの開始位置を設定（左端は固定）
        float startX = leftFixedPosition;

        // 各桁の数字を配置
        for (int i = 0; i < numDigits; i++)
        {
            int digit = int.Parse(numberString[i].ToString());
            if (digit < 0 || digit >= numberSprites.Count)
            {
                Debug.LogError("Invalid digit or numberSprites list size.");
                continue;
            }

            // 新しい数字のオブジェクトを作成し、親に設定
            GameObject newNumber = Instantiate(numberPrefab, numberParent);
            newNumber.GetComponent<Image>().sprite = numberSprites[digit];

            // RectTransformを取得して位置を調整
            RectTransform rectTransform = newNumber.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                rectTransform.anchoredPosition = new Vector2(startX + i * digitSpacing, 0);
            }
        }
    }
}
