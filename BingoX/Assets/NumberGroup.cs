using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class NumberGroup : MonoBehaviour
{
    public List<Number> list;
    // Start is called before the first frame update
    void Start()
    {
        List<int> numbers = new List<int>();
        for (int i = 0; i < 16; ++i)
        {
            numbers.Add(i + 1);
        }
        for (int i = 0; i < list.Count; ++i)
        {
            int idx = Random.Range(0, numbers.Count - 1);
            int number = numbers[idx];
            Debug.Log("num " + number);
            list[i].SetNumber(number);
            numbers.RemoveAt(idx);
        }
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void SetWinNumber(int number)
    {
        for (int i = 0; i < list.Count; ++i)
        {
            if (list[i].GetNumber() == number)
            {
                list[i].SetIsWin(true);
            }
        }
    }
}
