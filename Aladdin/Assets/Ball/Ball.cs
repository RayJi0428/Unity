﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ball : MonoBehaviour
{

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("AAA");
    }

    // Update is called once per frame
    void Update()
    {
    }

    void OnDestroy()
    {
        Debug.Log("des");
    }
}