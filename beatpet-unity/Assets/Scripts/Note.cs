using UnityEngine;

public class Note : MonoBehaviour
{
    public string type;
    public float hitBeat;
    private Vector3 centerPosition;
    private float judgeLineRadius;

    private const float NOTE_TRAVEL_BEATS = 2f;
    private SpriteRenderer spriteRenderer;
    private float spawnBeat;
    private Color noteColor;

    private void Awake()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
    }

    public void Initialize(string noteType, float hitBeat, Vector3 centerPos, float judgeLineRadius, float spawnAngle, Color color)
    {
        type = noteType;
        this.hitBeat = hitBeat;
        this.centerPosition = centerPos;
        this.judgeLineRadius = judgeLineRadius;
        spawnBeat = hitBeat - NOTE_TRAVEL_BEATS;
        noteColor = color;

        transform.position = centerPosition;

        if (type.StartsWith("arrow"))
        {
            SetArrowRotation(spawnAngle);
        }
        else if (type == "circle")
        {
            transform.localScale = Vector3.zero;
        }

        SetColor(noteColor);
    }

    private void SetArrowRotation(float spawnAngle)
    {
        transform.rotation = Quaternion.Euler(0, 0, spawnAngle);
    }

    public void UpdatePosition(float currentBeat)
    {
        float t = (currentBeat - spawnBeat) / NOTE_TRAVEL_BEATS;
        t = Mathf.Clamp01(t);

        if (type.StartsWith("arrow"))
        {
            // Move arrow from center to judge line
            Vector3 direction = Quaternion.Euler(0, 0, transform.eulerAngles.z) * Vector3.up;
            transform.position = centerPosition + direction * (judgeLineRadius * t);
        }
        else if (type == "circle")
        {
            UpdateCircleScale(t);
        }
    }

    public void UpdateVisuals(float currentBeat)
    {
        if (spriteRenderer != null)
        {
            // Calculate how close the note is to the judge line
            float distanceToJudge = Mathf.Abs(hitBeat - currentBeat);
            // Alpha will decrease as the note gets closer to the judge line
            float alpha = Mathf.Clamp01(1f - (distanceToJudge / NOTE_TRAVEL_BEATS));
            spriteRenderer.color = new Color(noteColor.r, noteColor.g, noteColor.b, alpha);
        }
    }

    public void SetColor(Color color)
    {
        noteColor = color;
        if (spriteRenderer != null)
        {
            spriteRenderer.color = noteColor;
        }
    }

    public bool IsOutOfBounds(float currentBeat)
    {
        return currentBeat > hitBeat + 0.5f;
    }

    private void UpdateCircleScale(float t)
    {
        // Calculate the target scale for the circle to touch the judge line
        float targetDiameter = judgeLineRadius * 2f; // Since scale is diameter, multiply by 2
        Vector3 targetScale = new Vector3(targetDiameter, targetDiameter, 1);

        // Interpolate between zero scale and target scale
        transform.localScale = Vector3.Lerp(Vector3.zero, targetScale, t);
    }
}
