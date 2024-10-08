using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RouletteEffectAnimation : MonoBehaviour
{
    [SerializeField,Header("SpinEffect")]
    private Animator spinEffectYellowAnim, spinEffectPurpleAnim;
    [SerializeField, Header("BackEffect")]
    private Animator backEffectAnim,overEffectAnim;

    // エフェクトアニメーションパラメーター
    private readonly string INACTIVE = "InActive";
    private readonly string SPIN = "Spin";
    private readonly string SCALEUP1 = "ScaleUp1";
    private readonly string SCALEUP2 = "ScaleUp2";

    public void PlaySpinEffect()
    {
        spinEffectYellowAnim.Play(SPIN);
        spinEffectPurpleAnim.Play(SPIN);
        backEffectAnim.Play(SCALEUP1);
    }
    public void PlayStopEffect()
    {
        spinEffectYellowAnim.Play(INACTIVE);
        spinEffectPurpleAnim.Play(INACTIVE);
        backEffectAnim.Play(SCALEUP2);
        overEffectAnim.Play(SPIN);
    }

}
