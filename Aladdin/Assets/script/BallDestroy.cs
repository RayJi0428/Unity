using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BallDestroy : MonoBehaviour
{
    public int type = 0;
    // Start is called before the first frame update

    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    void OnTriggerEnter(Collider col)
    {
        //碰撞到彈珠，移除彈珠
        if (col.gameObject.tag == "ball")
        {
            Destroy(col.gameObject);
        }

        //才觸發spin
        if (type == 1)
        {
            

            SlotController.Instance.Spin();
        }
    }
}
