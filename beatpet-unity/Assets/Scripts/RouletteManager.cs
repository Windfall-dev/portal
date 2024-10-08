using System;
using Unity.VisualScripting;
using UnityEngine;

/// <summary>
/// 星の数によって変わるルーレットの種類
/// </summary>
public enum RouletteType
{
    Star1,
    Star2,
    Star3,
}

/// <summary>
/// ルーレットを8分割した時の区画
/// 反時計回りに8分割
/// </summary>
public enum RouletteSection
{
    Section1,
    Section2,
    Section3,
    Section4,
    Section5,
    Section6,
    Section7,
    Section8,
}

public class RouletteManager : MonoBehaviour
{
    // ボーナスポイント
    int bonusPoint = 0;
    public int BonusPoint => bonusPoint;

    // ルーレットが止まる角度
    float resultDegree;
    public float ResultDegree => resultDegree;

    [SerializeField, Header("ルーレットタイプ（テスト用でインスペクターに表示）")]
    private RouletteType rouletteType;
    public RouletteType RouletteType => rouletteType;

    [SerializeField, Header("星のアニメーション")]
    private Animator starAnim;
    // 星アニメーションパラメーター
    private readonly string STAR1 = "Star1";
    private readonly string STAR2 = "Star2";
    private readonly string STAR3 = "Star3";

    [SerializeField, Header("タイトルアニメーション")]
    private Animator titleAnim;
    // タイトルアニメーションパラメーター
    private readonly string SHOW = "Show";

    [SerializeField, Header("ルーレットアニメーション")]
    private Animator rouletteAnim;
    [SerializeField, Header("ルーレット外側アニメーション")]
    private Animator rouletteOutsideAnim;
    private readonly string SCALEUP = "ScaleUp";

    [SerializeField, Header("ルーレットSpriteRenderer")]
    private SpriteRenderer rouletteSprite;
    [SerializeField, Header("ルーレット星1バージョン画像")]
    private Sprite roulette_star1;
    [SerializeField, Header("ルーレット星2バージョン画像")]
    private Sprite roulette_star2;
    [SerializeField, Header("ルーレット星3バージョン画像")]
    private Sprite roulette_star3;

    [SerializeField, Header("ボーナスポイントのデータベース")]
    private BonusPointDataSO bonusPointData;

    [SerializeField, Header("ルーレットキャラクター")]
    private Character character;


    [SerializeField, Header("リザルトポップアップ")]
    private ResultPopUp resultPopUp;



    private void Start()
    {
        
    }

    /// <summary>
    /// TODO: 呼ぶタイミングはゲームの得点によって決まった時
    /// </summary>
    /// <param name="type"></param>
    public void SetRouletteType(RouletteType type)
    {
        this.rouletteType = type;
    }

    /// <summary>
    /// ルーレット画面の要素をアニメーションで表示
    /// </summary>
    /// <param name="type"></param>
    /// <exception cref="Exception"></exception>
    private void ShowRouletteScreen(RouletteType type)
    {
        // タイトル表示
        titleAnim.Play(SHOW);
        // ルーレット表示
        rouletteAnim.Play(SCALEUP);
        rouletteOutsideAnim.Play(SCALEUP);
        // 星表示
        switch (type)
        {
            case RouletteType.Star1:

                rouletteSprite.sprite = roulette_star1;
                starAnim.Play(STAR3);
                break;
            case RouletteType.Star2:
                rouletteSprite.sprite = roulette_star2;
                starAnim.Play(STAR3);
                break;
            case RouletteType.Star3:
                rouletteSprite.sprite = roulette_star3;
                starAnim.Play(STAR3);
                break;
            default:
                throw new Exception("例外発生");
        }
    }

    /// <summary>
    /// ボーナスポイントを登録
    /// </summary>
    public void SetBonusPoint()
    {
        // ルーレットが止まる角度を決定
        resultDegree = UnityEngine.Random.Range(0f, 360f);
        Debug.Log($"ルーレットは{resultDegree}°で止まります");
        // ボーナスポイント決定
        bonusPoint = GetBonusPointValue(resultDegree);

        WebGLDataStore.point = bonusPoint + WebGLDataStore.score;
        Debug.Log($"結果は+{bonusPoint}ポイント");
        API api_script = GetComponent<API>();

        if (api_script != null)
        {
            api_script.GetRank();
            api_script.EndGame();
        }
        // リザルトポップアップの表示を更新しておく
        resultPopUp.UpdateGetPointText(bonusPoint);
    }

    /// <summary>
    /// ルーレットの角度からボーナスポイントを取得する
    /// </summary>
    /// <param name="resultDegree"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    private int GetBonusPointValue(float resultDegree)
    {
        var data = bonusPointData.BonusPointList.Find(x => x.rouletteType == rouletteType);
        var section = GetRouletteSection(resultDegree);
        Debug.Log($"ルーレットは{section}°で止まります");
        switch (section)
        {
            case RouletteSection.Section1:
                return data.Point_Section1;
            case RouletteSection.Section2:
                return data.Point_Section2;
            case RouletteSection.Section3:
                return data.Point_Section3;
            case RouletteSection.Section4:
                return data.Point_Section4;
            case RouletteSection.Section5:
                return data.Point_Section5;
            case RouletteSection.Section6:
                return data.Point_Section6;
            case RouletteSection.Section7:
                return data.Point_Section7;
            case RouletteSection.Section8:
                return data.Point_Section8;
            default:
                throw new Exception("例外発生");
        }
    }

    /// <summary>
    /// ルーレットで止まる角度からルーレットの区画を取得する
    /// </summary>
    /// <param name="resultDegree"></param>
    /// <returns></returns>
    /// <exception cref="Exception"></exception>
    private RouletteSection GetRouletteSection(float resultDegree)
    {
        if (resultDegree >= 0 && resultDegree < 45) return RouletteSection.Section1;
        else if (resultDegree >= 45 && resultDegree < 90) return RouletteSection.Section2;
        else if (resultDegree >= 90 && resultDegree < 135) return RouletteSection.Section3;
        else if (resultDegree >= 135 && resultDegree < 180) return RouletteSection.Section4;
        else if (resultDegree >= 180 && resultDegree < 225) return RouletteSection.Section5;
        else if (resultDegree >= 225 && resultDegree < 270) return RouletteSection.Section6;
        else if (resultDegree >= 270 && resultDegree < 315) return RouletteSection.Section7;
        else if (resultDegree >= 315 && resultDegree <= 360) return RouletteSection.Section8;
        else throw new Exception("例外発生");
    }

    /// <summary>
    ///  アニメーションリセット
    /// </summary>
    public void AnimReset()
    {
        if (WebGLDataStore.score > 99)
        {
            SetRouletteType(RouletteType.Star3);
        }
        else if (WebGLDataStore.score > 66)
        {
            SetRouletteType(RouletteType.Star2);
        }
        else
        {// WebGLDataStore.score > 33
            SetRouletteType(RouletteType.Star1);
        }

        // ボーナスポイントを決定
        SetBonusPoint();
        // ルーレット画面表示
        ShowRouletteScreen(rouletteType);
        // キャラクターの回転準備を完了する（タップで回転できる状態に）
        character.PreparateRoulette();

        //starAnim.Rebind();
        //titleAnim.Rebind();
        //rouletteAnim.Rebind();
        //rouletteOutsideAnim.Rebind();
        //starAnim.enabled = true;
        //titleAnim.enabled = true;
        //rouletteAnim.enabled = true;
        //rouletteOutsideAnim.enabled = true;
    }
}
