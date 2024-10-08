using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TitleEffect : MonoBehaviour
{
    private Image originalImage;
    private Vector3 originalScale;
    private GameObject overlayObject;
    private GameObject setObject;
    private Image overlayImage;
    private Image setImage;
    private Material originalMaterial;

    [Header("Transition Settings")]
    public Sprite targetSprite;
    public Sprite setSprite;
    public Vector3 setScale = Vector3.one;
    public float overlayScaleMultiplier = 1.5f;
    public float originalScaleMultiplier = 1.5f;
    public float fadeSpeed = 1f;
    

    private static readonly int BaseColor = Shader.PropertyToID("_BaseColor");

    private void Awake()
    {
        originalImage = GetComponent<Image>();
        originalScale = transform.localScale;
        originalMaterial = new Material(originalImage.material);
        originalImage.material = originalMaterial;
    }

    public void StartTransition()
    {
        CreateOverlayImage();
        StartCoroutine(TransitionCoroutine());
    }

    private void CreateOverlayImage()
    {
        // 既存のオーバーレイオブジェクトを削除（もしあれば）
        if (overlayObject != null)
        {
            Destroy(overlayObject);
        }

        // 既存のオーバーレイオブジェクトを削除（もしあれば）
        if (setObject != null)
        {
            Destroy(setObject);
        }

        RectTransform rect_transform = GetComponent<RectTransform>();

        // 新しいオーバーレイオブジェクトを作成
        setObject = new GameObject("SetImage");
        setObject.transform.SetParent(transform);
        setObject.transform.localRotation = Quaternion.identity;
        setObject.transform.localPosition = Vector3.zero;
        setObject.transform.localScale = Vector3.one;
        
        // オーバーレイイメージコンポーネントを設定
        setImage = setObject.AddComponent<Image>();
        setImage.sprite = setSprite;
        setImage.material = originalMaterial;

        // オーバーレイイメージの初期透明度を設定
        Color setColor = setImage.color;
        setColor.a = 0f;
        setImage.color = setColor;

        RectTransform targetRectTransform = setImage.rectTransform;
        targetRectTransform.sizeDelta = new Vector2(rect_transform.rect.width, rect_transform.rect.height);

        // 新しいオーバーレイオブジェクトを作成
        overlayObject = new GameObject("OverlayImage");
        overlayObject.transform.SetParent(transform);
        overlayObject.transform.localRotation = Quaternion.identity;
        overlayObject.transform.localPosition = Vector3.zero;
        overlayObject.transform.localScale = Vector3.one;

        // オーバーレイイメージコンポーネントを設定
        overlayImage = overlayObject.AddComponent<Image>();
        overlayImage.sprite = targetSprite;
        overlayImage.material = originalMaterial;

        // オーバーレイイメージの初期透明度を設定
        Color overlayColor = overlayImage.color;
        overlayColor.a = 0f;
        overlayImage.color = overlayColor;
        RectTransform overlayRectTransform = overlayImage.rectTransform;
        overlayRectTransform.sizeDelta = new Vector2(rect_transform.rect.width, rect_transform.rect.height);
    }

    private IEnumerator TransitionCoroutine()
    {
        // オーバーレイイメージのフェードイン
        float elapsedTime = 0f;
        // スケールの拡大とフェードアウト
        elapsedTime = 0f;
        Vector3 overlayTargetScale = Vector3.one * overlayScaleMultiplier;
        Vector3 originalTargetScale = originalScale * originalScaleMultiplier;

        Color originalBaseColor = originalMaterial.GetColor(BaseColor);

        while (elapsedTime < 1f)
        {
            elapsedTime += Time.deltaTime * fadeSpeed;
            float t = elapsedTime;

            // スケールの拡大
            overlayObject.transform.localScale = Vector3.Lerp(Vector3.one, overlayTargetScale, t);
            transform.localScale = Vector3.Lerp(setScale, originalTargetScale, t);

            float alpha = 1f - t;

            // フェードアウト
            Color setColor = setImage.color;
            //if (alpha < 0.5)
            //{
            //    setColor.a = alpha;
            //}
            //else
            //{
            //    setColor.a = t;
            //}
            setColor.a = alpha;

            setImage.color = setColor;

            // フェードアウト
            Color overlayColor = overlayImage.color;
            //if (alpha < 0.5)
            //{
            //    overlayColor.a = alpha;
            //}
            //else
            //{
            //    overlayColor.a = t;
            //}
            overlayColor.a = alpha;

            overlayImage.color = overlayColor;

            Color newBaseColor = originalBaseColor;
            newBaseColor.a = alpha;
            originalMaterial.SetColor(BaseColor, newBaseColor);

            yield return null;
        }

        // エフェクト終了後、オーバーレイオブジェクトを削除
        Destroy(overlayObject);
        Destroy(setObject);
    }

    // オリジナルの状態にリセットするメソッド
    public void ResetToOriginal()
    {
        if (overlayObject != null)
        {
            Destroy(overlayObject);
        }

        if (setObject != null)
        {
            Destroy(setObject);
        }

        transform.localScale = originalScale;
    }

    private void OnDestroy()
    {
        if (overlayObject != null)
        {
            Destroy(overlayObject);
        }

        if (setObject != null)
        {
            Destroy(setObject);
        }
    }
}