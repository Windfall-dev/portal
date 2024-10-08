using UnityEngine;
using System.Collections;

public class RouletteCharacter : MonoBehaviour
{
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
    RouletteState curretnState = RouletteState.Preparate;

    [SerializeField, Header("ルーレットエフェクト")]
    private RouletteEffectAnimation rouletteEffect;
    [SerializeField, Header("TapToSpin")]
    private GameObject tapToSpinLabel;
    [SerializeField, Header("RouletteManager")]
    private RouletteManager rouletteManager;
    [SerializeField, Header("ResultPopUp")]
    private ResultPopUp resultPopUp;

    // currentState => Spin
    readonly float spinTime = 3f;
    float spinTimer = 0;

    // currentState => Slide
    //[SerializeField, Header("1回目のスライド回転角度")]
    float degree_slide1 = 45;
    //[SerializeField, Header("2回目のスライド回転角度")]
    float degree_slide2 = 30;
    //[SerializeField, Header("3回目のスライド回転角度")]
    float degree_slide3 = 25;
    float totalSlideValue;
    float slideTimer;
    float currentSlideCount = 0;
    float currentSlideValue;
    //スライドの回数
    readonly float maxSlideCount = 3;
    //スライドの速さ
    float slideSpeed = 100;
    //スライド間のインターバル
    float slideIntervalTime = 1f;

    [SerializeField,Header("ルーレットキャラクター")]
    private Animator rouletteCharacterAnimator;
    // キャラクターアニメーションパラメーター
    private readonly string JUMP = "Jump";
    private readonly string SPIN_START = "Spin_Start";
    private readonly string SPIN_STOP = "Spin_Stop";
    private readonly string SLIDE1 = "Slide1";
    private readonly string SLIDE2 = "Slide2";
    private readonly string SLIDE3 = "Slide3";

    void Start()
    {
        rouletteCharacterAnimator = GetComponent<Animator>();
        SetSlideRandomValue();
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

    void Update()
    {
        switch (curretnState)
        {
            case RouletteState.Preparate:
                // ルーレットが止まっている時にタップをしたら
                if (Input.GetMouseButtonDown(0))
                {
                    // TAP TO SPIN を消す
                    tapToSpinLabel.SetActive(false);

                    // ルーレットを回転させる
                    curretnState = RouletteState.Spin;
                    rouletteCharacterAnimator.SetTrigger(SPIN_START);
                    rouletteEffect.PlaySpinEffect();
                }
                break;

            case RouletteState.Spin:
                spinTimer += Time.deltaTime;
                if (spinTimer >= spinTime)
                {
                    // 最終的に止まる場所よりもSlideの合計値分だけ前で止めます
                    // Slideを3回して、最終的な位置に止まります
                    gameObject.transform.eulerAngles = new Vector3(0, 0, Mathf.Repeat(rouletteManager.ResultDegree + totalSlideValue, 360));
                    rouletteCharacterAnimator.SetTrigger(SPIN_STOP);

                }
                break;
           
            case RouletteState.Slide:
                transform.Rotate(0, 0, slideSpeed * Time.deltaTime * -1);
                // 現在回転している角度
                currentSlideValue += slideSpeed * Time.deltaTime;
                if (currentSlideValue >= MaxSlideValue())
                {
                    if (currentSlideCount >= maxSlideCount) StartCoroutine(FinishRoulette());
                    else curretnState = RouletteState.SlideInterval;
                }
                break;

            case RouletteState.SlideInterval:
                slideTimer += Time.deltaTime;
                if (slideTimer > slideIntervalTime)
                {
                    currentSlideCount++;
                    // スライドさせる速さをスライド毎に少し遅くしていく
                    slideSpeed *= 0.7f;
                    // スライド停止時間を少し長くしていく
                    slideIntervalTime *= 1.1f;
                    slideTimer = 0;
                    currentSlideValue = 0;
                    if (currentSlideCount == 2) rouletteCharacterAnimator.SetTrigger(SLIDE2);
                    else if (currentSlideCount == 3) rouletteCharacterAnimator.SetTrigger(SLIDE3);
                    curretnState = RouletteState.Slide;
                }
                break;

            case RouletteState.Finish:
                gameObject.transform.eulerAngles = new Vector3(0, 0, Mathf.Repeat(rouletteManager.ResultDegree, 360));
                break;
        }
    }

    /// <summary>
    /// ルーレットを回す準備
    /// </summary>
    public void PreparateRoulette()
    {
        curretnState = RouletteState.Preparate;
        rouletteCharacterAnimator.SetTrigger(JUMP);
        tapToSpinLabel.SetActive(true);
        //rouletteEffect.PlayScaleUpRoulette();
    }

    /// <summary>
    /// ストップアニメーションが終了次第スライドアニメーションに遷移
    /// </summary>
    public void OnFinishSpin()
    {
        Debug.Log($"これよりスライドフェーズ");
        currentSlideCount++;
        curretnState = RouletteState.Slide;
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
        curretnState = RouletteState.Finish;
        rouletteEffect.PlayStopEffect();
        yield return new WaitForSeconds(3f);
        resultPopUp.PlayPopUpAnimation();
    }

}