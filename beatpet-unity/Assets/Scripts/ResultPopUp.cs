using UnityEngine;
using UnityEngine.UI;

public class ResultPopUp : MonoBehaviour
{
    private Animator anim;
    // ポップアップアニメーションパラメーター
    private readonly string OPEN = "Open";

    [SerializeField,Header("GetPointText")]
    private Text getPointText;
    [SerializeField, Header("EarnedPointsText")]
    private Text earnedPointsText;
    [SerializeField, Header("RankingText")]
    private Text rankingText;

    private void Start()
    {
        anim = GetComponent<Animator>();

        // TODO: テスト用の値を入れてます
        UpdateEarnedPointsText(9999);
        UpdateRankingText(1234);
    }

    public void PlayPopUpAnimation()
    {
        Debug.Log($"ポップアップ表示");
        anim.Play(OPEN);
    }

    public void UpdateGetPointText(int getPoint)
    {
        getPointText.text = getPoint.ToString();
    }

    public void UpdateEarnedPointsText(int earnedPoints)
    {
        earnedPointsText.text = earnedPoints.ToString("#,#");
    }

    public void UpdateRankingText(int ranking)
    {
        rankingText.text = ranking.ToString("#,#");
    }

}
