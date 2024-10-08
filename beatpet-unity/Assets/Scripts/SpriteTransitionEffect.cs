using UnityEngine;
using System.Collections;

public class SpriteTransitionEffect : MonoBehaviour
{
    private SpriteRenderer originalSpriteRenderer;
    private Vector3 originalScale;
    private GameObject overlayObject;
    private GameObject setObject;
    private SpriteRenderer overlaySpriteRenderer;
    private SpriteRenderer setSpriteRenderer;
    private Material originalMaterial;

    [Header("Transition Settings")]
    public Sprite targetSprite;
    public Sprite  setSprite;
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
        if (overlayObject != null)
        {
            Destroy(overlayObject);
        }

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

        // 新しいオーバーレイオブジェクトを作成
        overlayObject = new GameObject("OverlaySprite");
        overlayObject.transform.SetParent(transform);
        overlayObject.transform.localRotation = Quaternion.identity;
        overlayObject.transform.localPosition = Vector3.zero;
        overlayObject.transform.localScale = Vector3.one;

        // オーバーレイスプライトレンダラーを設定
        overlaySpriteRenderer = overlayObject.AddComponent<SpriteRenderer>();
        overlaySpriteRenderer.sprite = targetSprite;
        overlaySpriteRenderer.sortingLayerName = originalSpriteRenderer.sortingLayerName;
        overlaySpriteRenderer.sortingOrder = originalSpriteRenderer.sortingOrder + 2;

        // オーバーレイスプライトの初期透明度を設定
        Color overlayColor = overlaySpriteRenderer.color;
        overlayColor.a = 0f;
        overlaySpriteRenderer.color = overlayColor;
    }

    private IEnumerator TransitionCoroutine()
    {
        // オーバーレイスプライトのフェードイン
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
            Color setColor = setSpriteRenderer.color;
            if (alpha < 0.5)
            {
                setColor.a = alpha;
            }
            else
            {
                setColor.a = t;
            }
            
            setSpriteRenderer.color = setColor;

            // フェードアウト
            Color overlayColor = overlaySpriteRenderer.color;
            if (alpha < 0.5)
            {
                overlayColor.a = alpha;
            }
            else
            {
                overlayColor.a = t;
            }


            overlaySpriteRenderer.color = overlayColor;

            Color newBaseColor = originalBaseColor;
            newBaseColor.a = alpha;
            originalMaterial.SetColor(BaseColor, newBaseColor);


            yield return null;
        }

        // エフェクト終了後、オーバーレイオブジェクトを削除
        Destroy(overlayObject);
        Destroy(setObject);
        Destroy(gameObject);
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