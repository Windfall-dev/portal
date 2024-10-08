using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ResultController : MonoBehaviour
{
    [SerializeField] private GameObject result_object;
    [SerializeField] private Vector2 result_position = Vector2.zero;
    [SerializeField] private Vector3 result_scale = Vector3.one;

    [SerializeField] private GameObject combo_l;
    [SerializeField] private GameObject combo_in;
    [SerializeField] private GameObject clear_l;

    [SerializeField] private GameObject max_combo_l;
    [SerializeField] private GameObject max_combo_in;

    void Start()
    {

    }

    public void HideResultSet()
    {
        result_object.SetActive(false);
        MaxComboUnSet();
        result_object.transform.localScale = Vector3.one;
    }

    public void MaxComboSet()
    {
        Animator anim = GetComponent<Animator>();
        anim.enabled = false;

        RectTransform rect_transform = result_object.GetComponent<RectTransform>();
        rect_transform.anchoredPosition = result_position;
        result_object.transform.localScale = result_scale;
        combo_l.SetActive(false);
        combo_in.SetActive(false);
        clear_l.SetActive(false);
        max_combo_l.SetActive(true);
        max_combo_in.SetActive(true);
    }

    public void MaxComboUnSet()
    {
        Animator anim = GetComponent<Animator>();
        anim.Rebind();
        anim.enabled = true;
        combo_l.SetActive(true);
        combo_in.SetActive(true);
        clear_l.SetActive(true);
        max_combo_l.SetActive(false);
        max_combo_in.SetActive(false);
    }
}
