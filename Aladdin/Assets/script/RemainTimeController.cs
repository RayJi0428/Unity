using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RemainTimeController : MonoBehaviour
{
    static RemainTimeController _Instance;

    public GameObject[] icons;
    public static RemainTimeController Instance
    {
        get
        {
            if (_Instance != null)
            {
                return _Instance;      // 已經註冊的Singleton物件
            }
            _Instance = FindObjectOfType<RemainTimeController>();
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
        SetRemainTimes(0);
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void SetRemainTimes(int times)
    {
        Debug.Log("剩餘次數" + times);

        for (int i = 0; i < icons.Length; ++i)
        {
            icons[i].SetActive(i < times);
        }
    }
}
