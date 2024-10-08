using System;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(menuName = "BeatPet/BonusPointDataSO", fileName = "BonusPointData")]
public class BonusPointDataSO : ScriptableObject
{
    public List<BonusPoint> BonusPointList = new List<BonusPoint>();

    [Serializable]
    public class BonusPoint
    {
        public RouletteType rouletteType;
        public int Point_Section1;
        public int Point_Section2;
        public int Point_Section3;
        public int Point_Section4;
        public int Point_Section5;
        public int Point_Section6;
        public int Point_Section7;
        public int Point_Section8;
    }
}
