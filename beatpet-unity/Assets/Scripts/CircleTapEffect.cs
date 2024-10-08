using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CircleTapEffect : MonoBehaviour
{
    private SpriteRenderer originalSpriteRenderer;
    private Vector3 originalScale;
    private GameObject setObject;
    private SpriteRenderer setSpriteRenderer;
    private Material originalMaterial;

    [Header("Transition Settings")]
    public Sprite setSprite;
    public Vector3 setScale = Vector3.one;
    public float overlayScaleMultiplier = 1.5f;
    public float originalScaleMultiplier = 1.5f;
    public float fadeSpeed = 1f;

    private static readonly int BaseColor = Shader.PropertyToID("_BaseColor");

    private void Awake()
    {
        originalSpriteRenderer = GetComponent<SpriteRenderer>();
        originalScale = transform.localScale;
        originalMaterial = new Material(originalSpriteRenderer.material);
        originalSpriteRenderer.material = originalMaterial;
    }

    public void StartTransition()
    {
        CreateOverlaySprite();
        StartCoroutine(TransitionCoroutine());
    }

    private void CreateOverlaySprite()
    {
        // 既存のオーバーレイオブジェクトを削除（もしあれば）
        if (setObject != null)
        {
            Destroy(setObject);
        }

        // 新しいオーバーレイオブジェクトを作成
        setObject = new GameObject("SetSprite");
        setObject.transform.SetParent(transform);
        setObject.transform.localRotation = Quaternion.identity;
        setObject.transform.localPosition = Vector3.zero;
        setObject.transform.localScale = Vector3.one;

        // オーバーレイスプライトレンダラーを設定
        setSpriteRenderer = setObject.AddComponent<SpriteRenderer>();
        setSpriteRenderer.sprite = setSprite;
        setSpriteRenderer.sortingLayerName = originalSpriteRenderer.sortingLayerName;
        setSpriteRenderer.sortingOrder = originalSpriteRenderer.sortingOrder + 1;

        // オーバーレイスプライトの初期透明度を設定
        Color setColor = setSpriteRenderer.color;
        setColor.a = 0f;
        setSpriteRenderer.color = setColor;
    }

    private IEnumerator TransitionCoroutine()
    {
        // オーバーレイスプライトのフェードイン
        float elapsedTime = 0f;
        Vector3 originalTargetScale = originalScale * originalScaleMultiplier;

        Color originalBaseColor = originalMaterial.GetColor(BaseColor);

        while (elapsedTime < 1f)
        {
            elapsedTime += Time.deltaTime * fadeSpeed;
            float t = elapsedTime /2f;

            transform.localScale = Vector3.Lerp(setScale, originalTargetScale, t);

            float alpha = 0.5f - t;

            // フェードアウト
            Color setColor = setSpriteRenderer.color;
            setColor.a = alpha;
            
            setSpriteRenderer.color = setColor;

            Color newBaseColor = originalBaseColor;
            newBaseColor.a = alpha;
            originalMaterial.SetColor(BaseColor, newBaseColor);


            yield return null;
        }

        // エフェクト終了後、オーバーレイオブジェクトを削除
        Destroy(setObject);
    }

    // オリジナルの状態にリセットするメソッド
    public void ResetToOriginal()
    {
        if (setObject != null)
        {
            Destroy(setObject);
        }

        transform.localScale = originalScale;
    }

    private void OnDestroy()
    {

        if (setObject != null)
        {
            Destroy(setObject);
        }
    }
}