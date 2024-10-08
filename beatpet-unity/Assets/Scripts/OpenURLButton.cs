using UnityEngine;

public class OpenURLButton : MonoBehaviour
{
    // URLを指定する変数
    public string url = "https://windfall-prototype.vercel.app/game";

    // ボタンが押された時に呼び出されるメソッド
    public void OpenURL()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        // WebGLビルド時はJavaScriptの関数を呼び出してURLに遷移
        Application.ExternalEval($"OpenURL('{url}')");
#else
        // エディタや他のプラットフォームでは通常のURLを開く方法を使用
        Application.OpenURL(url);
#endif
    }
}
