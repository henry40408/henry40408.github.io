---
title: React Native 動畫初體驗
date: 2016-06-04 15:10
slug: react-native-animations
tags: react native, animations, animated
layout: post
---

## 前言

開發 app，你必須有 **總有一天一定要處理轉場動畫** 的覺悟。死拖活拖幾個月後，我還是迎來了第一個 React Native 動畫。

[Expanding and Collapsing Elements Using Animations in React Native](http://moduscreate.com/expanding-and-collapsing-elements-using-animations-in-react-native/)

雖然 **React Native 沒有 CSS**，但它們也不是真的被完全拿掉，而是以另外一種形式借屍還魂。

## 舉例

在此推薦一項對於 React Native 開發者來說非常好用的服務 [React Native Playground](https://rnplay.org/)，這項服務可以說是 React Native 開發者的 [codepen](https://codepen.io/)。

先來看靜態的例子：[React Native Animation (Static)](https://rnplay.org/apps/IruZMA)

再來看動態的例子：[React Native Animation (Animated)](https://rnplay.org/apps/Evz0WQ)

從結構上看起來一模一樣。兩組程式最大的差別如下：

1. 動畫版新增了一個 state `opacity`，值是 `Animated.Value`。這個 `Animated.Value` 會隨著不同的動畫函數被呼叫、依據相對應的函數產生不同的數值變動。唯一的參數是動畫函數的起始值。
2. 在 `render` callback 中，直接將 `opacity` state 做為 style 的屬性直接傳入。當 `opacity` 值一變動就會觸發 `render` 重新繪製畫面，完成動畫效果。
3. 在 **適當的時機** 呼叫動畫函數以啟動動畫，在我提供的例子中是 `componentDidMount` callback。React Native 支援 `spring`、`decay`、`timing` 等動畫變數。`toValue` 指動畫函數的最終數值，另外可以傳入 `duration` 來控制動畫的長度，至於動畫的函數變動情形 `Animated.Value` 會自動計算，不需要開發者操心。

## 結語

動畫效果在數學上的定義就是一個以時間做為參數傳入的函數，輸出是座標值或是對應位置的一個數字。React Native 把開發者最頭痛的動畫函數寫好了，開發者只需要傳入必要的參數剩下的就交給 React Native 去煩惱即可。唯一還要注意的是 app 與網頁最大的不同在於 app 為了增進使用者體驗有許多內建的過場 (transition) 與回饋 (feeback) 動畫，在啟動自訂動畫的同時，必須注意這些過場動畫會不會與自訂動畫同時啟動，造成畫面卡頓。
