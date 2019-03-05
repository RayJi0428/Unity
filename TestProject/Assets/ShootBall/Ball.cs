using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ball : MonoBehaviour
{
    //Rigidbody目標
    private Rigidbody rb;

    //力道
    public float power = 20f;

    // Start is called before the first frame update
    void Start()
    {
        //取得此物件Rigidbody
        rb = GetComponent<Rigidbody>();

        //給予一次性的力道
        rb.AddForce(Vector3.up * power, ForceMode.Impulse);
    }

    // Update is called once per frame
    void Update()
    {
        if (this.transform.position.y < 0)
        {
            Destroy(this.gameObject);
        }
    }
}
