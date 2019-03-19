using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ball : MonoBehaviour
{
    //發射(77,85,110,120)
    public static float power = 77f;

    //Rigidbody目標
    private Rigidbody rb;

    //
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
    }
}
