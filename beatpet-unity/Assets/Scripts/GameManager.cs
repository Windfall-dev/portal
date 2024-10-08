using UnityEngine;
using System.Collections.Generic;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class GameManager : MonoBehaviour
{
    public GameObject circle_prefab;
    public GameObject arrow_prefab;
    public GameObject character_prefab;
    public GameObject spectrum;
    public GameObject title_text;
    public TextMeshProUGUI judgment_text;
    public Slider time_slider;
    public Slider score_slider;
    public Button start_button;
    public Button exit_button;
    public AudioSource music_source;
    public TextAsset song_data_json;
    public GameObject circle_effect;

    public Text point_text;
    public Text earned_point_text;
    public Text ranking_text;

    [Header("Judge Line Settings")]
    public Vector3 judge_line_position = Vector3.zero;
    public float judge_line_radius = 2f;
    public float judge_arrow_line_radius = 1.5f;
    public float judge_line_width = 0.1f;
    public Color judge_line_color = Color.green;
    public Sprite judge_line_background_sprite;
    public float background_scale_factor = 1.1f;
    public float rotation_speed = 30f;
    public Material line_renderer_material;
    public Material sprite_renderer_material;
    public Material outside_ring_material;
    public Sprite outside_ring_sprite;
    public float outside_ring_scale_factor = 1.1f;
    public GameObject circle_tap_ring_prefab;
    public GameObject result_prefab;
    public Vector3 result_scale = Vector3.one;
    public GameObject score_prefab;
    public GameObject combo_prefab;
    public GameObject max_combo_prefab;

    [Header("Score Star")]
    public GameObject score_star1_prefab;
    public GameObject score_star2_prefab;
    public GameObject score_star3_prefab;

    [Header("Judgment Sprites")]
    public Sprite perfect_sprite;
    public Sprite great_sprite;
    public Sprite good_sprite;
    public Sprite miss_sprite;
    public Image judgment_image;

    [Header("Judge Area Settings")]
    public GameObject tap_area_parent;
    public GameObject judge_arrow;

    [Header("Note Settings")]
    public Color note_color = Color.yellow;

    [Header("Character Settings")]
    public Vector3 character_position = Vector3.zero;

    [Header("UI Settings")]
    public Vector2 judgment_text_position = Vector2.zero;

    [Header("Background Flash Effect")]
    public GameObject background_object;
    public float flash_duration = 0.1f;
    public float fade_to_black_duration = 0.3f;

    [Header("Roulette")]
    public GameObject roulette_manager;
    public GameObject roulette_tilte;
    public GameObject roulette_canvas;
    public GameObject roulette;
    public GameObject roulette_outside;
    public GameObject roulette_stars;
    public GameObject roulette_tapToSpinLabel;


    [Header("Debug Flg")]
    public bool debug_flg = false;

    private SpriteRenderer background_renderer;
    private Color flash_color;
    private float last_beat_time = -1f;

    private int score = 0;
    private int score_star = 0;
    private int combo = 0;
    private int max_combo = 0;
    private float song_duration_beats;
    private List<Note> active_notes = new List<Note>();
    private Character character;
    private bool is_playing = false;
    private SongData song_data;
    private int current_note_index = 0;
    private const float NOTE_TRAVEL_BEATS = 4f;
    private GameObject judge_line;
    private Vector3 judge_line_center;
    private Coroutine hide_judgment_coroutine;
    private Vector2 touch_start_pos;
    private Vector2 touch_end_pos;
    private Vector2 mouse_start_pos;
    private Vector2 mouse_end_pos;
    private float min_swipe_distance = 50f;
    private bool is_mouse_dragging = false;
    private float tap_threshold = 0.2f;
    private float touch_start_time;
    private float mouse_start_time;
    private Vector2 tap_coords = Vector2.zero;
    private long unix_time;
    private GameObject outside_ring;
    private GameObject circle_tap_ring_object;

    private Collider2D up_tap_area;
    private Collider2D left_tap_area;
    private Collider2D right_tap_area;
    private Collider2D down_tap_area;

    private Camera main_camera;
    private Vector2 reusable_world_point;

    public SpriteTransitionEffect transition_effect;
    private const int MAX_SCORE = 2000;

    private bool fade_out_flg = false;

    void Start()
    {
        main_camera = Camera.main;

        up_tap_area = tap_area_parent.transform.Find("UpTapArea").GetComponent<Collider2D>();
        left_tap_area = tap_area_parent.transform.Find("LeftTapArea").GetComponent<Collider2D>();
        right_tap_area = tap_area_parent.transform.Find("RightTapArea").GetComponent<Collider2D>();
        down_tap_area = tap_area_parent.transform.Find("DownTapArea").GetComponent<Collider2D>();

        start_button.onClick.AddListener(StartGame);
        LoadSongData();
        HideGameElements();
        ShowStartUI();
        SetupJudgmentText();
        SetupJudgmentImage();
        CreateCharacter();
        CreateJudgeLine();
        ShowGameElements();
        HideRoulette();

    }

    void ShowStartUI()
    {
        start_button.gameObject.SetActive(true);
        title_text.SetActive(true);
        exit_button.gameObject.SetActive(true);
        spectrum.SetActive(false);
        result_prefab.SetActive(false);
        time_slider.gameObject.SetActive(false);
        score_slider.gameObject.SetActive(false);
        roulette_manager.SetActive(false);
        roulette_tapToSpinLabel.SetActive(false);
    }

    void ShowRoulette()
    {
        roulette_tilte.SetActive(true);
        roulette_canvas.SetActive(true);
        result_prefab.SetActive(false);
        judge_line.SetActive(false);
        roulette.SetActive(true);
        roulette_outside.SetActive(true);
        roulette_stars.SetActive(true);
        roulette_tapToSpinLabel.SetActive(true);
        circle_effect.GetComponent<CircleGenerator>().StopGenerating();
    }

    void HideRoulette()
    {
        roulette_tilte.SetActive(false);
        roulette_canvas.SetActive(false);
        roulette.SetActive(false);
        roulette_outside.SetActive(false);
        roulette_stars.SetActive(false);
    }

    void SetupJudgmentImage()
    {
        if (judgment_image != null)
        {
            judgment_image.gameObject.SetActive(false);
        }
    }

    void SetupJudgmentText()
    {
        if (judgment_text != null)
        {
            RectTransform rect_transform = judgment_text.GetComponent<RectTransform>();
            rect_transform.anchorMin = new Vector2(0.5f, 0.5f);
            rect_transform.anchorMax = new Vector2(0.5f, 0.5f);
            rect_transform.anchoredPosition = judgment_text_position;
            judgment_text.alignment = TextAlignmentOptions.Center;
        }
    }

    void HideGameElements()
    {
        //if (character != null) character.gameObject.SetActive(false);
        //if (judge_line != null) judge_line.SetActive(false);
        if (outside_ring != null) outside_ring.SetActive(false);
        
        judgment_text.gameObject.SetActive(false);
        time_slider.gameObject.SetActive(false);
        score_slider.gameObject.SetActive(false);
    }

    void ShowGameElements()
    {
        if (character != null) character.gameObject.SetActive(true);
        if (judge_line != null) judge_line.SetActive(true);
        judgment_text.gameObject.SetActive(true);
    }

    void CreateCharacter()
    {
        if (character == null)
        {
            //character = Instantiate(character_prefab, character_position, Quaternion.identity).GetComponent<Character>();
            character = character_prefab.GetComponent<Character>();
            character.transform.position = character_position;
            character.transform.rotation = Quaternion.identity;

            SpriteRenderer sprite_renderer = character.GetComponent<SpriteRenderer>();
            if (sprite_renderer != null)
            {
                sprite_renderer.sortingOrder = 2;
            }
        }

        character.gameObject.SetActive(true);
    }

    void CreateJudgeLine()
    {
        if (judge_line == null)
        {
            judge_line = new GameObject("JudgeLine");
            judge_line_center = judge_line_position;
            judge_line.transform.position = judge_line_position;
            LineRenderer line_renderer = judge_line.AddComponent<LineRenderer>();
            line_renderer.useWorldSpace = false;
            line_renderer.startWidth = judge_line_width;
            line_renderer.endWidth = judge_line_width;
            line_renderer.material = line_renderer_material;
            line_renderer.startColor = judge_line_color;
            line_renderer.endColor = judge_line_color;

            int segments = 60;
            line_renderer.positionCount = segments + 1;

            for (int i = 0; i <= segments; i++)
            {
                float angle = Mathf.Deg2Rad * (i * 360f / segments);
                float x = Mathf.Sin(angle) * judge_line_radius;
                float y = Mathf.Cos(angle) * judge_line_radius;
                line_renderer.SetPosition(i, new Vector3(x, y, 0));
            }

            GameObject background = new GameObject("BackgroundSprite");
            background.transform.SetParent(judge_line.transform);
            background.transform.localPosition = Vector3.zero;

            SpriteRenderer sprite_renderer = background.AddComponent<SpriteRenderer>();
            sprite_renderer.sprite = judge_line_background_sprite;
            sprite_renderer.material = sprite_renderer_material;
            sprite_renderer.sortingLayerName = "Effect";
            sprite_renderer.sortingOrder = 0;

            float scale_factor = judge_line_radius * 2f * background_scale_factor;
            background.transform.localScale = new Vector3(scale_factor, scale_factor, 1);

            outside_ring = new GameObject("OutsideRingSprite");
            outside_ring.transform.SetParent(judge_line.transform);
            outside_ring.transform.localPosition = Vector3.zero;
            outside_ring.SetActive(false);

            SpriteRenderer outside_ring_sprite_renderer = outside_ring.AddComponent<SpriteRenderer>();
            outside_ring_sprite_renderer.sprite = outside_ring_sprite;
            outside_ring_sprite_renderer.material = outside_ring_material;
            outside_ring_sprite_renderer.sortingLayerName = "Effect";
            outside_ring_sprite_renderer.sortingOrder = 0;

            scale_factor = judge_line_radius * 2f * outside_ring_scale_factor;
            outside_ring.transform.localScale = new Vector3(scale_factor, scale_factor, 1);

            circle_tap_ring_object = Instantiate(circle_tap_ring_prefab, judge_line_position, Quaternion.identity);
            circle_tap_ring_object.transform.SetParent(judge_line.transform);
            circle_tap_ring_object.transform.localPosition = Vector3.zero;
            circle_tap_ring_object.SetActive(false);
        }
        judge_line.SetActive(true);
    }

    void LoadSongData()
    {
        if (song_data_json != null)
        {
            song_data = JsonUtility.FromJson<SongData>(song_data_json.text);
        }
        else
        {
            song_data = new SongData
            {
                bpm = 120,
                preStartTime = 0.9f,
                notes = GenerateRandomNotes(20)
            };
        }
        song_duration_beats = GetSongDurationBeats();
    }

    List<NoteData> GenerateRandomNotes(int max_notes)
    {
        List<NoteData> notes = new List<NoteData>();
        float current_beat = 4f;

        string[] note_types = { "circle", "arrow_left", "arrow_down", "arrow_right", "arrow_up" };
        System.Random random = new System.Random();

        for (int i = 0; i < max_notes; i++)
        {
            string random_type = note_types[random.Next(note_types.Length)];
            notes.Add(new NoteData { beat = current_beat, type = random_type });

            float beat_increment = random.Next(1, 3) * 2;
            current_beat += beat_increment;
        }

        return notes;
    }

    float GetSongDurationBeats()
    {
        if (song_data.notes.Count == 0) return 0f;
        return song_data.notes[song_data.notes.Count - 1].beat + 8f;
    }

    float SecondsToBeats(float seconds)
    {
        return seconds / (60f / song_data.bpm);
    }

    void Update()
    {
        RotateJudgeLineBackground();
        if (!is_playing)
        {
            UpdateIdleUI();
            return;
        }

        float current_beat = SecondsToBeats(music_source.time - song_data.preStartTime);
        //Debug.Log("current_beat:"+ current_beat+ "song_duration_beats:"+ song_duration_beats);

        // music fade out
        if (current_beat + 6 > song_duration_beats && !fade_out_flg)
        {
            fade_out_flg = true;
            StartCoroutine(FadeOut(3));
        }

        if (current_beat < song_duration_beats)
        {
            SpawnAndUpdateNotes(current_beat);
            HandleUserInput();
            TriggerCharacterAnimation(current_beat);
            UpdateUI(current_beat);
        }
        else
        {
            EndGame();
        }

        CheckBeatAndTriggerEffects(current_beat);
    }

    private IEnumerator FadeOut(int fadeDuration)
    {
        float startVolume = music_source.volume;

        for (float t = 0; t < fadeDuration; t += Time.deltaTime)
        {
            music_source.volume = Mathf.Lerp(startVolume, 0, t / fadeDuration);
            yield return null;
        }

        music_source.volume = 0;
        //music_source.Stop(); // フェードアウト後に停止する場合
    }

    void SpawnAndUpdateNotes(float current_beat)
    {
        // 一度にノートの生成と更新を行う
        SpawnNotes(current_beat);
        UpdateNotes(current_beat);
    }

    void HandleUserInput()
    {
        // タッチとマウス入力をまとめて処理
        if (Input.touchCount > 0)
        {
            HandleTouchInput();
        }
        else if (Input.GetMouseButtonDown(0) || is_mouse_dragging)
        {
            HandleMouseInput();
        }
    }

    void RotateJudgeLineBackground()
    {
        // 回転処理を別メソッドに抽出
        if (judge_line != null)
        {
            Transform background_transform = judge_line.transform.Find("BackgroundSprite");
            if (background_transform != null)
            {
                background_transform.Rotate(Vector3.forward, -rotation_speed * Time.deltaTime);
            }
        }
    }

    void TriggerCharacterAnimation(float current_beat)
    {
        // キャラクターアニメーションの呼び出しをまとめる
        if (Mathf.Abs(current_beat % 1) < 0.1f)
        {
            character.TriggerScaleAnimation();
        }
    }

    void CheckBeatAndTriggerEffects(float current_beat)
    {
        // ビートの変化を1回だけチェックする
        float beat_fraction = current_beat % 1;
        if (beat_fraction < 0.1f && current_beat > last_beat_time + 0.9f)
        {
            TriggerBackgroundFlash();
            last_beat_time = current_beat;
        }
    }

    void UpdateIdleUI()
    {
        // ゲームが停止しているときのUI更新処理
        point_text.text = WebGLDataStore.point.ToString();
        earned_point_text.text = WebGLDataStore.userPoint.ToString();
        ranking_text.text = WebGLDataStore.targetRank.ToString();
    }

    void TriggerBackgroundFlash()
    {
        if (background_renderer != null)
        {
            StartCoroutine(FlashBackgroundCoroutine());
        }
    }

    IEnumerator FlashBackgroundCoroutine()
    {
        flash_color = GenerateRandomNeonColor();
        background_renderer.color = flash_color;
        yield return new WaitForSeconds(flash_duration);

        float elapsed_time = 0f;
        while (elapsed_time < fade_to_black_duration)
        {
            elapsed_time += Time.deltaTime;
            float t = elapsed_time / fade_to_black_duration;
            background_renderer.color = Color.Lerp(flash_color, Color.black, t);
            yield return null;
        }

        background_renderer.color = Color.black;
    }

    Color GenerateRandomNeonColor()
    {
        float hue = Random.Range(0f, 1f);
        float saturation = Random.Range(0.7f, 1f);
        float value = Random.Range(0.8f, 1f);

        return Color.HSVToRGB(hue, saturation, value);
    }

    void StartGame()
    {
        is_playing = true;
        score = 0;
        combo = 0;
        max_combo = 0;
        current_note_index = 0;
        music_source.volume = 1;
        active_notes.Clear();
        start_button.gameObject.SetActive(false);
        exit_button.gameObject.SetActive(false);
        result_prefab.GetComponent<ResultController>().HideResultSet();

        tap_area_parent.SetActive(true);
        result_prefab.SetActive(true);
        result_prefab.transform.localScale = result_scale;
        score_prefab.GetComponent<PercentNumberDisplay>().DisplayNumber(0);
        combo_prefab.GetComponent<ComboNumberDisplay>().DisplayNumber(0);
        max_combo_prefab.GetComponent<ComboNumberDisplay>().DisplayNumber(0);
        time_slider.gameObject.SetActive(true);
        score_slider.gameObject.SetActive(true);
        UpdateUI(0);
        judge_arrow.transform.rotation = Quaternion.Euler(0, 180, 0);
        judge_arrow.SetActive(true);
        
        StartCoroutine(Rotate180Degrees());
        StartCoroutine(RotateBackAndForth());

        Invoke("StartMusic", 1f);
    }

    void StartMusic()
    {
        circle_effect.GetComponent<CircleGenerator>().StartGenerating();
        spectrum.SetActive(true);
        
        circle_tap_ring_object.SetActive(true);
        music_source.Play();
        outside_ring.SetActive(true);


        if (debug_flg)
        {
            Invoke("EndGame", 5f);
        }
    }

    private IEnumerator LinkRoulette()
    {
        //  ゲーム終わり
        is_playing = false;
        music_source.Stop();
        spectrum.SetActive(false);
        SetRoulette();
        title_text.GetComponent<AnimationController>().DownAnim();
        yield return new WaitForSeconds(0.5f);
        roulette_stars.SetActive(true);
        judge_arrow.SetActive(false);
        HideGameElements();
    }

    void SetRoulette()
    {
        if (CalculatePercentage(score) == 100)
        {
            WebGLDataStore.score = 200;
        }
        else
        {
            WebGLDataStore.score = CalculatePercentage(score);
        }

        if (WebGLDataStore.score > 99)
        {
            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(true);
        }
        else if (WebGLDataStore.score > 66)
        {

            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(false);
        }
        else if (WebGLDataStore.score > 33)
        {

            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(false);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(false);
        }
        else
        {
            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(false);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(false);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(false);
        }
    }

    void EndGame()
    {
        Invoke("EndSet", 4.7f);
        StartCoroutine(LinkRoulette());


        GameObject[] arrows = GameObject.FindGameObjectsWithTag("Notes");

        foreach (GameObject arrow in arrows)
        {
            if (arrow.transform.parent == null)
            {
                Destroy(arrow);
            }
        }
    }

    void EndSet()
    {
        ShowRoulette();
        roulette_manager.SetActive(true);
        roulette_manager.GetComponent<RouletteManager>().AnimReset();
        character_prefab.GetComponent<Character>().PreparateRoulette();

    }

    void SpawnNotes(float current_beat)
    {
        while (current_note_index < song_data.notes.Count &&
            song_data.notes[current_note_index].beat <= current_beat + NOTE_TRAVEL_BEATS)
        {
            NoteData note_data = song_data.notes[current_note_index];

            if (note_data.beat - NOTE_TRAVEL_BEATS <= current_beat)
            {
                GameObject note_prefab = note_data.type.StartsWith("arrow") ? arrow_prefab : circle_prefab;
                GameObject note_object = Instantiate(note_prefab, Vector3.zero, Quaternion.identity);
                Note note = note_object.GetComponent<Note>();
                if (note != null)
                {
                    float spawn_angle = GetSpawnAngle(note_data.type);
                    float radius = note_data.type.StartsWith("arrow") ? judge_arrow_line_radius : judge_line_radius;
                    note.Initialize(note_data.type, note_data.beat, judge_line_center, radius, spawn_angle, note_color);

                    SpriteRenderer note_renderer = note_object.GetComponent<SpriteRenderer>();
                    if (note_renderer != null)
                    {
                        note_renderer.sortingOrder = 1;
                    }

                    active_notes.Add(note);
                }
                else
                {
                    Debug.LogError("Note component not found on instantiated prefab!");
                    Destroy(note_object);
                }
                current_note_index++;
            }
            else
            {
                break;
            }
        }
    }

    float GetSpawnAngle(string note_type)
    {
        switch (note_type)
        {
            case "arrow_left": return 90f;
            case "arrow_right": return 270f;
            case "arrow_up": return 0f;
            case "arrow_down": return 180f;
            default: return Random.Range(0f, 360f);
        }
    }

    void UpdateNotes(float current_beat)
    {
        for (int i = active_notes.Count - 1; i >= 0; i--)
        {
            Note note = active_notes[i];
            note.UpdatePosition(current_beat);
            note.UpdateVisuals(current_beat);

            if (note.IsOutOfBounds(current_beat))
            {
                Destroy(note.gameObject);
                active_notes.RemoveAt(i);
            }
        }
    }

    void HandleKeyboardInput()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            JudgeHit("circle");
        }
        else if (Input.GetKeyDown(KeyCode.LeftArrow))
        {
            JudgeHit("arrow_left");
        }
        else if (Input.GetKeyDown(KeyCode.RightArrow))
        {
            JudgeHit("arrow_right");
        }
        else if (Input.GetKeyDown(KeyCode.UpArrow))
        {
            JudgeHit("arrow_up");
        }
        else if (Input.GetKeyDown(KeyCode.DownArrow))
        {
            JudgeHit("arrow_down");
        }
    }

    void HandleTouchInput()
    {
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);

            if (touch.phase == TouchPhase.Began)
            {
                touch_start_pos = touch.position;
                touch_start_time = Time.time;
            }
            else if (touch.phase == TouchPhase.Ended)
            {
                touch_end_pos = touch.position;
                float touch_duration = Time.time - touch_start_time;

                if (touch_duration <= tap_threshold)
                {
                    string direction = GetTapDirection(touch_end_pos);

                    switch (direction)
                    {
                        case "up":
                            JudgeHit("arrow_up");
                            break;
                        case "left":
                            JudgeHit("arrow_left");
                            break;
                        case "right":
                            JudgeHit("arrow_right");
                            break;
                        case "down":
                            JudgeHit("arrow_down");
                            break;
                        default:
                            JudgeHit("circle");
                            break;
                    }
                }
            }
        }
    }

    void HandleMouseInput()
    {
        if (Input.GetMouseButtonDown(0))
        {
            mouse_start_pos = Input.mousePosition;
            mouse_start_time = Time.time;
            is_mouse_dragging = true;
            RecordTap();
        }
        else if (Input.GetMouseButtonUp(0))
        {
            mouse_end_pos = Input.mousePosition;
            float mouse_duration = Time.time - mouse_start_time;

            if (mouse_duration <= tap_threshold)
            {
                string direction = GetTapDirection(mouse_end_pos);

                switch (direction)
                {
                    case "up":
                        JudgeHit("arrow_up");
                        break;
                    case "left":
                        JudgeHit("arrow_left");
                        break;
                    case "right":
                        JudgeHit("arrow_right");
                        break;
                    case "down":
                        JudgeHit("arrow_down");
                        break;
                    default:
                        JudgeHit("circle");
                        break;
                }
            }
            is_mouse_dragging = false;
        }
    }

    void JudgeHit(string input_type)
    {
        CircleTapEffect circle_effect = circle_tap_ring_object.GetComponent<CircleTapEffect>();
        circle_effect.StartTransition();
        float current_beat = SecondsToBeats(music_source.time - song_data.preStartTime);
        Note hit_note = active_notes.Find(note =>
            Mathf.Abs(current_beat - note.hitBeat) < 0.25f &&
            ((note.type == "circle" && input_type == "tap") || note.type == input_type)
        );

        if (hit_note != null)
        {
            string judgment = JudgeHitTiming(hit_note, current_beat);
            int points = 0;
            switch (judgment)
            {
                case "Perfect":
                case "Great":
                case "Good":
                    OperationDataStore.judgment_data.Add(judgment);
                    if (hit_note.type != "circle")
                    {
                        SpriteTransitionEffect effect = hit_note.gameObject.GetComponent<SpriteTransitionEffect>();
                        effect.StartTransition();
                    }
                    Character character_anim = character.gameObject.GetComponentInChildren<Character>();
                    if (hit_note.type == "circle")
                    {
                        character_anim.UpAnim();
                    }
                    else if (hit_note.type == "arrow_up")
                    {
                        character_anim.UpAnim();
                    }
                    else if (hit_note.type == "arrow_left")
                    {
                        character_anim.LeftAnim();
                    }
                    else if (hit_note.type == "arrow_right")
                    {
                        character_anim.RightAnim();
                    }
                    else if (hit_note.type == "arrow_down")
                    {
                        character_anim.DownAnim();
                    }
                    break;
                default:
                    break;
            }

            switch (judgment)
            {
                case "Perfect":
                    points = 100;
                    break;
                case "Great":
                    points = 75;
                    break;
                case "Good":
                    points = 50;
                    break;
                default:
                    combo = 0;
                    break;
            }
            if (points > 0)
            {
                combo++;
                score += points;
                score_prefab.GetComponent<PercentNumberDisplay>().DisplayNumber(CalculatePercentage(score));
                combo_prefab.GetComponent<ComboNumberDisplay>().DisplayNumber(combo);
                if (max_combo <= combo) {
                    max_combo = combo;
                    max_combo_prefab.GetComponent<ComboNumberDisplay>().DisplayNumber(max_combo);
                }
                
            }
            ShowJudgment(judgment);
            if (hit_note.type == "circle")
            {
                Destroy(hit_note.gameObject);
            }
            active_notes.Remove(hit_note);

            UpdateScoreStars();
        }
        else
        {
            ShowJudgment("Miss");
            combo_prefab.GetComponent<ComboNumberDisplay>().DisplayNumber(0);
            combo = 0;
        }
    }

    void UpdateScoreStars()
    {
        int percentage = CalculatePercentage(score);
        if (percentage > 33 && score_star == 0)
        {
            score_star1_prefab.GetComponent<ImageSwitcher>().ChangeImage(1);
            score_star = 1;
            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(false);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(false);
        }
        else if (percentage > 66 && score_star == 1)
        {
            score_star2_prefab.GetComponent<ImageSwitcher>().ChangeImage(1);
            score_star = 2;
            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(false);
        }
        else if (percentage > 99 && score_star == 2)
        {
            score_star3_prefab.GetComponent<ImageSwitcher>().ChangeImage(1);
            score_star = 3;
            roulette_stars.transform.Find("Star_Left").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Center").gameObject.SetActive(true);
            roulette_stars.transform.Find("Star_Right").gameObject.SetActive(true);
        }
    }

    void ShowJudgment(string judgment)
    {
        if (hide_judgment_coroutine != null)
        {
            StopCoroutine(hide_judgment_coroutine);
        }

        switch (judgment)
        {
            case "Perfect":
                judgment_image.sprite = perfect_sprite;
                break;
            case "Great":
                judgment_image.sprite = great_sprite;
                break;
            case "Good":
                judgment_image.sprite = good_sprite;
                break;
            case "Miss":
                judgment_image.sprite = miss_sprite;
                break;
            default:
                judgment_image.sprite = null;
                break;
        }

        if (judgment_image.sprite != null)
        {
            judgment_image.gameObject.SetActive(true);
            judgment_image.transform.localScale = Vector3.one * 1.2f;
            judgment_image.color = new Color(1f, 1f, 1f, 1f);
            hide_judgment_coroutine = StartCoroutine(ShowAndFadeOutJudgment(0.5f, 0.5f));
        }
    }

    IEnumerator ShowAndFadeOutJudgment(float show_duration, float fade_duration)
    {
        yield return new WaitForSeconds(show_duration);

        float elapsed_time = 0f;
        Color start_color = judgment_image.color;
        Color end_color = new Color(start_color.r, start_color.g, start_color.b, 0f);

        while (elapsed_time < fade_duration)
        {
            elapsed_time += Time.deltaTime;
            float t = elapsed_time / fade_duration;
            judgment_image.color = Color.Lerp(start_color, end_color, t);
            judgment_image.transform.localScale = Vector3.Lerp(Vector3.one * 1.2f, Vector3.one, t);
            yield return null;
        }

        judgment_image.gameObject.SetActive(false);
    }

    string JudgeHitTiming(Note note, float current_beat)
    {
        float beat_diff = Mathf.Abs(current_beat - note.hitBeat);

        if (beat_diff <= 0.1f && beat_diff >= -0.1f)
        {
            return "Perfect";
        }

        if (beat_diff <= 0.18f && beat_diff >= -0.18f)
        {
            return "Great";
        }

        if (beat_diff <= 0.25f && beat_diff >= -0.25f)
        {
            return "Good";
        }

        return "Miss";
    }

    void UpdateUI(float current_beat)
    {
        time_slider.value = 1 - (current_beat / song_duration_beats);
        score_slider.value = (float)(1 - (CalculatePercentage(score) * 0.01));
    }

    private void RecordTap()
    {
        unix_time = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        Vector3 tap_position = Input.mousePosition;
        tap_coords.Set(tap_position.x, tap_position.y);
        TapData new_tap = new TapData
        {
            time = unix_time,
            position = tap_coords
        };
        OperationDataStore.tap_data.Add(new_tap);
    }

    string GetTapDirection(Vector2 tap_position)
    {
        reusable_world_point = main_camera.ScreenToWorldPoint(tap_position);

        if (up_tap_area != null && up_tap_area.OverlapPoint(reusable_world_point))
        {
            return "up";
        }
        if (left_tap_area != null && left_tap_area.OverlapPoint(reusable_world_point))
        {
            return "left";
        }
        if (right_tap_area != null && right_tap_area.OverlapPoint(reusable_world_point))
        {
            return "right";
        }
        if (down_tap_area != null && down_tap_area.OverlapPoint(reusable_world_point))
        {
            return "down";
        }

        return "none";
    }

    public int CalculatePercentage(int score)
    {
        return Mathf.FloorToInt((float)score / MAX_SCORE * 100);
    }

    public void GameReset()
    {
        time_slider.gameObject.SetActive(false);
        score_slider.gameObject.SetActive(false);
        start_button.gameObject.SetActive(true);
        exit_button.gameObject.SetActive(true);
        start_button.onClick.AddListener(StartGame);
        LoadSongData();
        HideGameElements();
        spectrum.SetActive(false);
        result_prefab.SetActive(false);
        SetupJudgmentText();
        SetupJudgmentImage();
        CreateCharacter();
        CreateJudgeLine();
        ShowGameElements();
        outside_ring.SetActive(false);
        DestroyUnusedObjects();
        roulette_manager.SetActive(false);
        roulette_tilte.SetActive(false);
        roulette_canvas.SetActive(false);
        roulette.SetActive(false);
        roulette_outside.SetActive(false);
        roulette_stars.SetActive(false);
        roulette_tapToSpinLabel.SetActive(false);
        title_text.GetComponent<AnimationController>().RebindAnim();
        character_prefab.GetComponent<Character>().ResetAnim();
        character.transform.rotation = Quaternion.identity;
    }

    void DestroyUnusedObjects()
    {
        GameObject[] all_objects = FindObjectsOfType<GameObject>();

        foreach (GameObject obj in all_objects)
        {
            if (obj.name == "CircleEffect(Clone)")
            {
                Destroy(obj);
            }
        }
    }

    private IEnumerator RotateBackAndForth()
    {
        // 初期の回転を保存
        Quaternion originalRotation = judge_line.transform.rotation;

        // y軸に-90度回転させる目標の回転を設定
        Quaternion targetRotation = Quaternion.Euler(judge_line.transform.eulerAngles.x, judge_line.transform.eulerAngles.y - 90, judge_line.transform.eulerAngles.z);

        // 0.5秒で-90度回転
        float duration = 0.5f;
        yield return RotateToTarget(targetRotation, duration);
        character.gameObject.GetComponentInChildren<Character>().UpAnim();
        // 元の回転に戻す目標を設定
        yield return RotateToTarget(originalRotation, duration);
    }

    private IEnumerator RotateToTarget(Quaternion targetRotation, float duration)
    {
        Quaternion startRotation = judge_line.transform.rotation;
        float elapsedTime = 0f;

        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            judge_line.transform.rotation = Quaternion.Lerp(startRotation, targetRotation, elapsedTime / duration);
            yield return null;
        }
        

        // 確実に最終目標に到達するようにする
        judge_line.transform.rotation = targetRotation;
    }

    private IEnumerator Rotate180Degrees()
    {
        // 初期の回転を保存
        Quaternion startRotation = judge_arrow.transform.rotation;

        // y軸に180度回転させる目標の回転を設定
        Quaternion targetRotation = startRotation * Quaternion.Euler(0, 180, 0);

        // 1秒間かけて回転させる
        float duration = 1f;
        float elapsedTime = 0f;

        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            judge_arrow.transform.rotation = Quaternion.Lerp(startRotation, targetRotation, elapsedTime / duration);
            yield return null;
        }

        // 最後に目標の回転角度に正確に設定
        judge_arrow.transform.rotation = targetRotation;
    }
}
