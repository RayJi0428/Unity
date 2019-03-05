using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Launcher : MonoBehaviour
{
    //生成Ball prefab物件
    public GameObject pfBall;

    private int frame = 10;
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        //點擊滑鼠左鍵，生成Ball
        if (frame == 0 || Input.GetMouseButtonUp(0))
        {
            frame = 10;
            CreateBall();
        }
        frame--;
    }

    void CreateBall()
    {
        //生成Ball物件並給予隨機座標
        Vector3 pos = new Vector3(this.transform.position.x + Random.Range(0f, 1f), this.transform.position.y, this.transform.position.z + Random.Range(0f, 1f));
        Instantiate(pfBall, pos, Quaternion.identity);
    }
}
