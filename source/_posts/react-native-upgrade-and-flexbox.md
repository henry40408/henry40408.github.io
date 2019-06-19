---
title: "React Native 從 0.28.x 升級與 flexbox"
date: 2016-07-29
categories: ['React Native']
---

React Native 雖然有 React 一詞，但與 React.js 的關係還是僅止於名稱而已。從 `0.28.x` 開始，flexbox 被調整地更接近 CSS3 標準。在 `0.28.x` 之前，對一個 `<View />` 填上 `flex: 1` 屬性並不會劇烈地改變 `<View />` 的呈現形式。但 `0.28.x` 之後，`flex` 屬性開始具備延展性。也就是說，**我們不能再隨意地為 `<View />` 添加 `flex` 屬性**。**否則在需要 inline 樣式的容器中，所有的元素將被延展**，導致元素與容器一起變形。

[#8691 [0.29] With flexWrap: 'wrap', unexpected margin appears between wrapped rows](https://github.com/facebook/react-native/issues/8691)

另外，像標籤這樣需要一個接著一個排成一列的樣式，在 `0.28.x` 之前只要加上 `flexDirection: 'row'` 與 `flexWrap: 'wrap'` 即可；但 `0.28.x` 之後，還需要加上 `alignItems: 'left'` (或 `alignItems: 'right'`，如果需要靠右對齊的話)，在此可以簡單地類比成網頁端的 `float: left` (或 `float: right`)。如果不加上這個屬性的話，容器內的元素將會在底部產生成因不明的空白，如 issue 中的截圖所示。
