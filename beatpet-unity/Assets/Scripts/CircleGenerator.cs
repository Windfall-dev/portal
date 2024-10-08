using UnityEngine;
using System.Collections.Generic;
using System.Collections;

public class CircleGenerator : MonoBehaviour
{
    public GameObject circlePrefab;
    public float expandDuration = 1f;
    public float startScale = 0.1f;
    public float endScale = 1f;
    public float expandSpeed = 1f;
    public List<Color> colors = new List<Color> { Color.red, Color.green, Color.blue };
    public AnimationCurve fadeCurve = AnimationCurve.Linear(0, 1, 1, 0);

    public float generationInterval = 0.5f;
    public bool isGenerating = false;

    private int currentColorIndex = 0;
    private Coroutine generationCoroutine;

    public void StartGenerating()
    {
        if (!isGenerating)
        {
            isGenerating = true;
            generationCoroutine = StartCoroutine(GenerateCirclesPeriodically());
        }
    }

    public void StopGenerating()
    {
        if (isGenerating)
        {
            isGenerating = false;
            if (generationCoroutine != null)
            {
                StopCoroutine(generationCoroutine);
                generationCoroutine = null;
            }
        }
    }

    public void OneGenerating()
    {
        GenerateCircle();
    }

    private IEnumerator GenerateCirclesPeriodically()
    {
        while (isGenerating)
        {
            GenerateCircle();
            yield return new WaitForSeconds(generationInterval);
        }
    }

    private void GenerateCircle()
    {
        if (colors == null || colors.Count == 0)
        {
            Debug.LogError("No colors defined in the colors list!");
            return;
        }

        GameObject newCircle = Instantiate(circlePrefab, transform.position, Quaternion.identity);
        CircleExpander expander = newCircle.GetComponent<CircleExpander>();
        if (expander == null)
        {
            expander = newCircle.AddComponent<CircleExpander>();
        }

        Color selectedColor = colors[currentColorIndex];
        //Debug.Log($"Generating circle with color: {selectedColor}");
        expander.Initialize(expandDuration, startScale, endScale, expandSpeed, selectedColor, fadeCurve);
        expander.StartExpansion();

        currentColorIndex = (currentColorIndex + 1) % colors.Count;
    }

    public float GenerationInterval
    {
        get { return generationInterval; }
        set { generationInterval = Mathf.Max(0.1f, value); }
    }
}