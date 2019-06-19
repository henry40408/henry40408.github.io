---
title: "React Native 手動關閉螢幕鍵盤"
date: 2016-06-04
categories: ['React Native']
---

## 問題

iOS app 雖然會在使用者不再輸入文字時自動隱藏螢幕鍵盤，但鍵盤隱藏時有過場動畫，如果鍵盤的過場動畫與自訂動畫同時發生，就會有螢幕卡頓的情形。

<!-- more -->

## 解法

目前 React Native 官方文件還沒有揭露，但 React Native 其實已經有實作手動關閉螢幕鍵盤的 API 了。

```javascript
import dismissKeyboard from 'dismissKeyboard';
...
dismissKeyboard();
```

如果螢幕鍵盤目前是開啟的狀態，在呼叫 `dismissKeyboard` 之後螢幕鍵盤就會被隱藏起來。

## 結語

React Native 更新的速度非常快，導致文件更新的速度遠遠落後程式碼。最快的方式還是直接 Google 關鍵字，然後回去參考原始碼。之所以要參考原始碼的原因在於有些程式碼可能會被標記為 `deprecated`，如此就必須另尋方法。

另外，React Native 不要追最新的版本，尤其是 0.24 到 0.25 如果有使用任何第三方程式碼請注意第三方使用者有追上最新版本再進行更新。
