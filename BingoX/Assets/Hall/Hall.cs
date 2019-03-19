using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Hall : MonoBehaviour
{
    private int number = 0;
    // Start is called before the first frame update
    void Start()
    {
        number = int.Parse(this.gameObject.name.Substring(5));
    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnTriggerEnter(Collider other)
    {
        Destroy(other.gameObject);

        //要怎麼用callback? 直接call launcher有點越權
        Launcher.getInstance().OnBallEnter(number);
    }
}
