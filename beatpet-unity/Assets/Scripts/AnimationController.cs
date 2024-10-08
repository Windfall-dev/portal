using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class AnimationController : MonoBehaviour
{
    // Animator コンポーネントの参照
    private Animator animator;
    private Image image;
    private int playCount = 0;  // 再生回数のカウンタ
    private int previousLoopCount = 0;  // 前回のループ数
    public GameObject circleEffect;
    public GameObject result_object;
    private SpriteRenderer originalSpriteRenderer;

    private static readonly int BaseColor = Shader.PropertyToID("_BaseColor");

    void Start()
    {
        // Animator コンポーネントを取得
        animator = GetComponent<Animator>();
        image = GetComponent<Image>();
        originalSpriteRenderer = GetComponent<SpriteRenderer>();
    }

    void Update()
    {
        // アニメーションのステート情報を取得
        AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);

        if (stateInfo.IsName("Idle"))
        {
            // アニメーションの再生回数を整数部分でカウント
            int currentLoopCount = Mathf.FloorToInt(stateInfo.normalizedTime);

            // ループが新しい回に入ったら再生回数を増加
            if (currentLoopCount > previousLoopCount)
            {
                if (!IsMultipleOfFive(previousLoopCount))
                {
                    circleEffect.GetComponent<CircleGenerator>().OneGenerating();
                }
                
                playCount++;  // 再生回数を増加
                previousLoopCount = currentLoopCount;  // 前回のループ数を更新

            }
        }
    }
    
    bool IsMultipleOfFive(int num)
    {
        return num %  5 == 0;
    }

    public void UpAnim()
    {
        animator.SetTrigger("Up");
        Invoke("StopAnim", 2f);
    }

    public void  DownAnim()
    {
        animator.enabled = true;
        image.color = new Color(0f, 0f, 0f, 1f);

        animator.SetTrigger("Down");
        Invoke("StopAnim", 5f);

    }

    public void StopAnim()
    {
        animator.enabled = false;
    }

    public void RebindAnim()
    {
        animator.enabled = true;
        image.color = new Color(0f, 0f, 0f, 0f);
        animator.Rebind();
        
    }

    public void MaxComboSet()
    {
        result_object.GetComponent<ResultController>().MaxComboSet();
    }


    
}
