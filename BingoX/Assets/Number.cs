using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Number : MonoBehaviour
{
    public List<Sprite> normal;
    public List<Sprite> win;

    private int number = 0;

    private bool isWin = false;

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }

    public void SetNumber(int v)
    {
        number = v;
        Refresh();
    }

    public int GetNumber()
    {
        return number;
    }

    public void SetIsWin(bool v)
    {
        isWin = v;
        Refresh();
    }

    private void Refresh()
    {
        int idx = number - 1;
        if (isWin)
        {
            gameObject.GetComponent<Image>().sprite = win[idx];
        }
        else
        {
            gameObject.GetComponent<Image>().sprite = normal[idx];
        }
    }
}
