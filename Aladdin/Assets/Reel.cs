using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Reel : MonoBehaviour
{
    private GameObject container;

    public float speed = 5.0f;
    // Start is called before the first frame update
    void Start()
    {
        this.container = this.gameObject.transform.GetChild(1).gameObject;
    }

    // Update is called once per frame
    void Update()
    {
        this.container.transform.Translate(0, this.speed * -1 * Time.deltaTime, 0);
        if (this.container.transform.localPosition.y < -5.0f)
        {
            this.container.transform.localPosition = Vector3.zero;
        }
    }
}
