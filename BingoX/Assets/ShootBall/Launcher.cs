using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Launcher : MonoBehaviour
{
    //生成Ball prefab物件
    public GameObject pfBall;

    private int frame = 10;

    private bool auto = false;

    public Range range;

    public NumberGroup group;

    private static Launcher _instance;
    public static Launcher getInstance()
    {
        return _instance;
    }
    // Start is called before the first frame update
    void Start()
    {
        _instance = GetComponent<Launcher>();
    }

    private int powerFrame = 20;
    private int powerIndex = 0;
    private float[] power = new float[] { 60f, 80f, 110f, 115f, 120f };
    // Update is called once per frame
    void Update()
    {
        //長壓左鍵調整力道
        if (Input.GetMouseButton(0))
        {
            powerFrame--;
            //切換力道
            if (powerFrame == 0)
            {
                Debug.Log("powerIndex = " + powerIndex);
                range.SetIndex(powerIndex);
                float min = this.power[this.powerIndex];
                float max = this.power[this.powerIndex + 1];
                Ball.power = Random.Range(min, max);

                powerFrame = 20;
                powerIndex++;
                if (powerIndex > 3)
                {
                    powerIndex = 0;
                }
            }
        }
        //點擊滑鼠左鍵，生成Ball
        if (Input.GetMouseButtonUp(0))
        {
            CreateBall();
        }

        if (auto)
        {
            //自動生成Ball
            if (frame == 0)
            {
                frame = 10;
                CreateBall();
            }
            frame--;
        }
    }

    void CreateBall()
    {
        //生成Ball物件並給予隨機座標
        Vector3 pos = new Vector3(this.transform.position.x, this.transform.position.y, this.transform.position.z);
        Instantiate(pfBall, pos, Quaternion.identity);
    }

    //球進洞
    public void OnBallEnter(int index)
    {
        Debug.Log("enter " + index);

        group.SetWinNumber(index + 1);

        Reset();
    }

    private void Reset()
    {
        powerFrame = 20;
        powerIndex = 0;
        range.SetIndex(-1);
    }
}
