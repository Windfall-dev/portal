using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class NoteData
{
    public float beat;
    public string type;
}

[Serializable]
public class SongData
{
    public float bpm;
    public float preStartTime;
    public List<NoteData> notes;
}

[Serializable]
public static class WebGLDataStore
{
    public static string fastApiUrl;
    public static string token;
    public static string sessionId;
    public static string stage;
    public static string tapDataJson;
    public static string judgmentDataJson;
    public static long score = 0;
    public static string userId;
    public static long point = 0;
    public static int targetRank = 0;
    public static long  userPoint = 0;
}

[System.Serializable]
public class TapData
{
    public long time;
    public Vector2 position;
}

[Serializable]
public static class OperationDataStore
{
    public static List<TapData> tap_data = new List<TapData>();
    public static List<string> judgment_data = new List<string>();
}