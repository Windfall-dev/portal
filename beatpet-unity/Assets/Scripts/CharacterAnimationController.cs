using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CharacterAnimationController : MonoBehaviour
{
    // Animator コンポーネントの参照
    private Animator animator;
    //private int playCount = 0;  // 再生回数のカウンタ
    //private int previousLoopCount = 0;  // 前回のループ数
    //public GameObject circleEffect;

    void Start()
    {
        // Animator コンポーネントを取得
        animator = GetComponent<Animator>();
    }

    //void Update()
    //{
    //    // アニメーションのステート情報を取得
    //    AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);

    //    if (stateInfo.IsName("Idle"))
    //    {
    //        // アニメーションの再生回数を整数部分でカウント
    //        int currentLoopCount = Mathf.FloorToInt(stateInfo.normalizedTime);

    //        // ループが新しい回に入ったら再生回数を増加
    //        if (currentLoopCount > previousLoopCount)
    //        {
    //            if (!IsMultipleOfFive(previousLoopCount))
    //            {
    //                circleEffect.GetComponent<CircleGenerator>().OneGenerating();
    //            }

    //            playCount++;  // 再生回数を増加
    //            previousLoopCount = currentLoopCount;  // 前回のループ数を更新

    //        }
    //    }
    //}

    //bool IsMultipleOfFive(int num)
    //{
    //    return num % 5 == 0;
    //}

    public void UpAnim()
    {
        animator.SetTrigger("Up");
    }

    public void RightAnim()
    {
        animator.SetTrigger("Right");
    }

    public void LeftAnim()
    {
        animator.SetTrigger("Left");
    }

    public void DownAnim()
    {
        animator.SetTrigger("Down");
    }

    public void StopAnim()
    {
        animator.enabled = false;
    }
}
