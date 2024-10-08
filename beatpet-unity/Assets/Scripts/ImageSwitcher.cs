using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ImageSwitcher : MonoBehaviour
{
    // 差し替えたい画像を設定するためのSpriteを配列で管理
    public Sprite[] sprites;

    // 対象のImageコンポーネント
    public Image targetImage;

    // 最初の設定
    void Start()
    {
        // Imageコンポーネントが設定されていない場合、アタッチされたオブジェクトから取得
        if (targetImage == null)
        {
            targetImage = GetComponent<Image>();
        }

        // 初期画像を設定（sprites[0]を初期画像として設定）
        if (sprites.Length > 0)
        {
            targetImage.sprite = sprites[0];
        }
    }

    // 画像を差し替えるメソッド
    public void ChangeImage(int index)
    {
        // indexが範囲内かどうかをチェック
        if (index >= 0 && index < sprites.Length)
        {
            targetImage.sprite = sprites[index];
        }
    }
}