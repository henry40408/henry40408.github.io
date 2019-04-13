---
title: "去除 letter-spacing 行末的多餘空白"
date: 2016-06-04
---

## 問題

`letter-spacing` 會在 **所有字元的尾端** 都加上空白以達成字元間隔的效果。但事實上我們需要的只有 **在字元與字元間** 插入空白即可，最後的字元其實不需要加上空白。因此我們需要做一些 hack 來調整。

## 解法

善用 `margin-right`。`letter-spacing` 設定多少，就以多少的 `margin-right` 回補。舉個例子，如果 `letter-spacing` 設定 `2rem`，`margin-right` 就設定 `-2rem` 回補，就可以把文字的位置調整回視覺上應該出現的位置。

[letter-spacing on JSFiddle](https://jsfiddle.net/44ytqn81/)

上面的文字沒有進行調整，整串文字往左邊歪；下面的文字經過調整，看起來就有置中了。

## 結語

由於這是一個 CSS hack，不排除未來會有任何修正。但在 React Native 中，所有的樣式都會被轉譯成 native 的樣式，如果 native 的 API 沒有被修改，我們就可以確保這樣的 CSS hack 也不會有太劇烈的改變。
