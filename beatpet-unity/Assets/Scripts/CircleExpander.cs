using UnityEngine;
using System.Collections;

[RequireComponent(typeof(SpriteRenderer))]
public class CircleExpander : MonoBehaviour
{
    private float expandDuration;
    private float startScale;
    private float endScale;
    private float expandSpeed;
    private Color circleColor;
    private AnimationCurve fadeCurve;

    private Renderer rendererComponent;
    private MaterialPropertyBlock propBlock;
    private Vector3 originalScale;

    public void Initialize(float expandDuration, float startScale, float endScale, float expandSpeed, Color color, AnimationCurve fadeCurve)
    {
        this.expandDuration = expandDuration;
        this.startScale = startScale;
        this.endScale = endScale;
        this.expandSpeed = expandSpeed;
        this.circleColor = color;
        this.fadeCurve = fadeCurve;

        rendererComponent = GetComponent<Renderer>();
        if (rendererComponent == null)
        {
            Debug.LogError("Renderer component not found!");
            return;
        }

        propBlock = new MaterialPropertyBlock();
        originalScale = transform.localScale;
        ApplyColor();
    }

    private void ApplyColor()
    {
        if (rendererComponent != null)
        {
            rendererComponent.GetPropertyBlock(propBlock);
            propBlock.SetColor("_BaseColor", circleColor);
            rendererComponent.SetPropertyBlock(propBlock);
            //Debug.Log($"Applied color to circle material: {circleColor}");
        }
        else
        {
            Debug.LogError("Renderer is null when trying to apply color!");
        }
    }

    public void StartExpansion()
    {
        StartCoroutine(ExpandAndFadeCoroutine());
    }

    private IEnumerator ExpandAndFadeCoroutine()
    {
        float elapsedTime = 0f;
        while (elapsedTime < expandDuration)
        {
            elapsedTime += Time.deltaTime * expandSpeed;
            float normalizedTime = Mathf.Clamp01(elapsedTime / expandDuration);

            float currentScale = Mathf.Lerp(startScale, endScale, normalizedTime);
            transform.localScale = originalScale * currentScale;

            float alpha = fadeCurve.Evaluate(normalizedTime);
            UpdateAlpha(alpha);

            yield return null;
        }

        Destroy(gameObject);
    }

    private void UpdateAlpha(float alpha)
    {
        rendererComponent.GetPropertyBlock(propBlock);
        Color currentColor = propBlock.GetColor("_BaseColor");
        currentColor.a = alpha;
        propBlock.SetColor("_BaseColor", currentColor);
        rendererComponent.SetPropertyBlock(propBlock);
    }
}
