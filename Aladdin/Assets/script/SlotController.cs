using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SlotController : MonoBehaviour
{
    static SlotController _Instance;

    public Reel[] reel;

    private int remainTimes = 0;

    private bool isSpin = false;

    public static SlotController Instance
    {
        get
        {
            if (_Instance != null)
            {
                return _Instance;      // 已經註冊的Singleton物件
            }
            _Instance = FindObjectOfType<SlotController>();
            //尋找已經在Scene的Singleton物件:
            if (_Instance != null)
            {
                return _Instance;
            }

            return _Instance;
        }
    }

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    public void Spin()
    {
        if (isSpin)
        {
            remainTimes = Mathf.Min(++remainTimes, 4);
        }
        else
        {
            remainTimes = Mathf.Max(--remainTimes, 0);

            isSpin = true;

            for (int i = 0; i < reel.Length; i++)
            {
                //一起spin
                reel[i].Spin();

                //依序spin
                //StartCoroutine("Spin2", i);
            }


            Invoke("Stop", 3.0f);
        }

        RemainTimeController.Instance.SetRemainTimes(remainTimes);
    }

    private IEnumerator Spin2(int index)
    {
        yield return new WaitForSeconds(index);

        reel[index].Spin();
    }

    public void Stop()
    {
        for (int i = 0; i < reel.Length; i++)
        {
            reel[i].Stop();
        }

        isSpin = false;

        if (remainTimes > 0)
        {
            Invoke("Spin", 1.0f);
        }
    }
}
