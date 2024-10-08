using UnityEngine;
using System.Collections;

public class Character : MonoBehaviour
{
    private SpriteRenderer spriteRenderer;
    private Vector3 originalScale;
    public float scaleMultiplier = 1.2f;
    public float scaleDuration = 0.1f;

    // ルーレットステート管理
    public enum RouletteState
    {
        InActive,
        Preparate,
        Spin,
        Decelerate,
        SearchStopPoint,
        Slide,
        SlideInterval,
        Finish
    }
    RouletteState currentState = RouletteState.Preparate;

    // ルーレット関連変数
    [SerializeField, Header("ルーレットエフェクト")]
    private RouletteEffectAnimation rouletteEffect;
    [SerializeField, Header("TapToSpin")]
    private GameObject tapToSpinLabel;
    [SerializeField, Header("RouletteManager")]
    private RouletteManager rouletteManager;
    [SerializeField, Header("ResultPopUp")]
    private ResultPopUp resultPopUp;
    [SerializeField, Header("CharacterAnimator")]
    private Animator rouletteCharacterAnimator;

    [SerializeField, Header("Title")]
    private GameObject title;

    // スピン時間
    readonly float spinTime = 3f;
    float spinTimer = 0;

    // スライド関連変数
    float degree_slide1 = 45;
    float degree_slide2 = 30;
    float degree_slide3 = 25;
    float totalSlideValue;
    float slideTimer;
    float currentSlideCount = 0;
    float currentSlideValue;
    readonly float maxSlideCount = 3;
    float slideSpeed = 100;
    float slideIntervalTime = 1f;

    [SerializeField, Header("ルーレットキャラクター")]
    
    private readonly string JUMP = "Jump";
    private readonly string SPIN_START = "Spin_Start";
    private readonly string SPIN_STOP = "Spin_Stop";
    private readonly string SLIDE1 = "Slide1";
    private readonly string SLIDE2 = "Slide2";
    private readonly string SLIDE3 = "Slide3";
    private bool roulette_flg = false;

    void Awake()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
        originalScale = transform.localScale;  // Store the original scale
        SetSlideRandomValue();
    }

    void Update()
    {
        if (roulette_flg)
        {
            HandleRouletteState();
        }
    }

    /// <summary>
    /// ルーレットステートの管理
    /// </summary>
    void HandleRouletteState()
    {
        switch (currentState)
        {
            case RouletteState.Preparate:
                if (Input.GetMouseButtonDown(0))
                {
                    tapToSpinLabel.SetActive(false);
                    currentState = RouletteState.Spin;
                    rouletteCharacterAnimator.SetTrigger(SPIN_START);
                    rouletteEffect.PlaySpinEffect();
                }
                break;

            case RouletteState.Spin:
                spinTimer += Time.deltaTime;
                if (spinTimer >= spinTime)
                {
                    gameObject.transform.eulerAngles = new Vector3(0, 0, Mathf.Repeat(rouletteManager.ResultDegree + totalSlideValue, 360));
                    rouletteCharacterAnimator.SetTrigger(SPIN_STOP);
                }
                break;

            case RouletteState.Slide:
                transform.Rotate(0, 0, slideSpeed * Time.deltaTime * -1);
                currentSlideValue += slideSpeed * Time.deltaTime;
                if (currentSlideValue >= MaxSlideValue())
                {
                    if (currentSlideCount >= maxSlideCount) StartCoroutine(FinishRoulette());
                    else currentState = RouletteState.SlideInterval;
                }
                break;

            case RouletteState.SlideInterval:
                slideTimer += Time.deltaTime;
                if (slideTimer > slideIntervalTime)
                {
                    currentSlideCount++;
                    slideSpeed *= 0.7f;
                    slideIntervalTime *= 1.1f;
                    slideTimer = 0;
                    currentSlideValue = 0;
                    if (currentSlideCount == 2) rouletteCharacterAnimator.SetTrigger(SLIDE2);
                    else if (currentSlideCount == 3) rouletteCharacterAnimator.SetTrigger(SLIDE3);
                    currentState = RouletteState.Slide;
                }
                break;

            case RouletteState.Finish:
                gameObject.transform.eulerAngles = new Vector3(0, 0, Mathf.Repeat(rouletteManager.ResultDegree, 360));
                break;
        }
    }

    /// <summary>
    /// カラー変更処理
    /// </summary>
    public void UpdateColor(Color newColor)
    {
        spriteRenderer.color = newColor;
    }

    /// <summary>
    /// スケールアニメーションのトリガー
    /// </summary>
    public void TriggerScaleAnimation()
    {
        StopAllCoroutines(); // Stop any ongoing scaling animations
        StartCoroutine(ScaleCharacter());
    }

    /// <summary>
    /// スケールアニメーション処理
    /// </summary>
    private IEnumerator ScaleCharacter()
    {
        Vector3 targetScale = originalScale * scaleMultiplier;
        float elapsedTime = 0f;

        // Scale up
        while (elapsedTime < scaleDuration)
        {
            transform.localScale = Vector3.Lerp(originalScale, targetScale, elapsedTime / scaleDuration);
            elapsedTime += Time.deltaTime;
            yield return null;
        }

        transform.localScale = targetScale;

        elapsedTime = 0f;

        // Scale down
        while (elapsedTime < scaleDuration)
        {
            transform.localScale = Vector3.Lerp(targetScale, originalScale, elapsedTime / scaleDuration);
            elapsedTime += Time.deltaTime;
            yield return null;
        }

        transform.localScale = originalScale; // Ensure it resets to original scale
    }

    /// <summary>
    /// 止まる際のスライド値をランダムで設定
    /// </summary>
    private void SetSlideRandomValue()
    {
        degree_slide1 = Random.Range(40, 45);
        degree_slide2 = Random.Range(25, 35);
        degree_slide3 = Random.Range(20, 25);
        totalSlideValue = degree_slide1 + degree_slide2 + degree_slide3;
    }

    /// <summary>
    /// ルーレットを回す準備
    /// </summary>
    public void PreparateRoulette()
    {
        roulette_flg = true;
        currentState = RouletteState.Preparate;
        rouletteCharacterAnimator.Rebind();
        rouletteCharacterAnimator.SetTrigger(JUMP);
        tapToSpinLabel.SetActive(true);
    }

    /// <summary>
    /// ストップアニメーションが終了次第スライドアニメーションに遷移
    /// </summary>
    public void OnFinishSpin()
    {
        Debug.Log($"これよりスライドフェーズ");
        currentSlideCount++;
        currentState = RouletteState.Slide;
        rouletteCharacterAnimator.SetTrigger(SLIDE1);
    }

    /// <summary>
    /// スライドの回数に応じて回転させる角度の最大値を変える
    /// </summary>
    /// <returns></returns>
    float MaxSlideValue()
    {
        if (currentSlideCount == 1) return degree_slide1;       // 1回目のスライド角度
        else if (currentSlideCount == 2) return degree_slide2;  // 2回目のスライド角度
        else return degree_slide3;                              // 3回目のスライド角度
    }

    /// <summary>
    /// ルーレット終了
    /// </summary>
    /// <returns></returns>
    private IEnumerator FinishRoulette()
    {
        Debug.Log($"ルーレット終了");
        currentState = RouletteState.Finish;
        rouletteEffect.PlayStopEffect();
        yield return new WaitForSeconds(3f);
        resultPopUp.PlayPopUpAnimation();
    }

    public void UpAnim()
    {
        rouletteCharacterAnimator.SetTrigger("Up");
    }

    public void RightAnim()
    {
        rouletteCharacterAnimator.SetTrigger("Right");
    }

    public void LeftAnim()
    {
        rouletteCharacterAnimator.SetTrigger("Left");
    }

    public void DownAnim()
    {
        rouletteCharacterAnimator.SetTrigger("Down");
    }

    public void StopAnim()
    {
        rouletteCharacterAnimator.enabled = false;
    }

    public void TitleEffect()
    {
        title.GetComponent<TitleEffect>().StartTransition();
    }

    public void ResetAnim()
    {
        spinTimer = 0;
        degree_slide1 = 45;
        degree_slide2 = 30;
        degree_slide3 = 25;
        totalSlideValue = 0;
        slideTimer = 0;
        currentSlideCount = 0;
        currentSlideValue = 0;
        slideSpeed = 100;
        slideIntervalTime = 1f;
        SetSlideRandomValue();

        roulette_flg = false;
        currentState = RouletteState.Preparate;
        rouletteCharacterAnimator.SetTrigger("Idle");
    }
}
