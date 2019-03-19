using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Range : MonoBehaviour
{
    public List<Image> list;

    // Start is called before the first frame update
    void Start()
    {
        this.SetIndex(-1);
    }

    // Update is called once per frame
    void Update()
    {

    }

    //顯示目前射程範圍
    public void SetIndex(int index)
    {
        for (int i = 0; i < list.Count; ++i)
        {
            list[i].gameObject.SetActive(i == index);
        }
    }
}
