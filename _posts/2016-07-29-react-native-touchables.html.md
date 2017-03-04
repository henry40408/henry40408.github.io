---
title: React Native 的觸控區域
date: 2016-07-29 23:30
slug: react-native-touchables
tags: react-native touchables
layout: post
---

## 樣式上的差異

在 React Native，如果需要觸控區域，我們有兩個選擇：`<TouchableWithoutFeedback />` 與 `<TouchableHighlight />`。根據文件，官方並不希望我們使用前者，原因基於前者不會對觸控產生回饋，會讓使用者對觸控是否有效產生不必要的誤解。

實際使用之後，我發現兩者另外一項區別在於 `<TouchableWithoutFeedback />` 沒有預設樣式，實際使用起來就像是一個隱形的容器，包住內部的元素，但又不會與內部的容器互相影響；而 `<TouchableHighlight />` 本身則會形成一個區塊，會與內部的元素相互影響。至於之前的版本曾經有使用者提出 `<TouchableHighlight />` 可能是為了產生回饋的視覺效果，而有效能上的問題。但在 `0.28.x` 之後，至少我實際使用到現在還沒有遇到嚴重的效能問題，即使是在最複雜的編輯履歷頁面也沒有。

## `<View />` 與自訂 component 的規格差異

官方文件建議如果要在 `Touchable` 系列裡使用多個 component，如以下的形式，直接寫是行不通的。

```javascript
<TouchableHighlight>
  <ChildOne />
  <ChildTwo />
</TouchableHighlight>
```

必須改寫成以下形式。

```javascript
<TouchableHighlight>
  <View>
    <ChildOne />
    <ChildTwo />
  </View>
</TouchableHighlight>
```

而重點就在這個 `<View />`。這個 `<View />` 在 `0.28.x` 時不能以自訂的 component 取代。例如以下的程式碼，在 `0.28.x` 有一定的機率造成 `Touchable` 失去效果。

```javascript
const MyComp = ({children}) => (
  <View>
    {children}
  </View>
);

const Touchable = () => (
  <TouchableHighlight>
    <MyComp>
      <ChildOne />
      <ChildTwo />
    </MyComp>
  </TouchableHighlight>
);
```

如果寫成以上的形式，則 React Native 在執行的時候會展開成以下形式。

```javascript
const Touchable = () => (
  <TouchableHighlight>
    <MyComp>
      <View>
        <ChildOne />
        <ChildTwo />
      </View>
    </MyComp>
  </TouchableHighlight>
);
```

這時候會發生錯誤導致 React Native 無法執行。原因是 `<MyComp />` 並不是一個 native component，因此當 `Touchable` 在為這個 component 注入一些屬性時，會發生某些 `<View />` 有定義 function 在自訂 component 中沒有被定義 (`[函數名稱] is undefined`) 的錯誤。

根據 [Direct Manipulation](https://facebook.github.io/react-native/docs/direct-manipulation.html) 中的說明，如果要將一個自訂的 component **偽裝** 成 native component，則需要實作 `setNativeProps` 這個 function，然後把 native props 傳遞給要自訂的 component。

但實際測試之後，`setNativeProps` 的效果並不如預期地是 100% 正常運作。因此建議如果沒有特別的需求，盡量還是直接使用 `<View />` 來包裝 child component。

我知道畫面上一堆 `<View />` 會讓可讀性變得非常差，否則我們也不需要自己實作自己的 component，但這是目前已知唯一 100% 有效的實作方法。
