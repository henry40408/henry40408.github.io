---
title: 在 React Native 中使用 moment.js 無法載入語系檔案
date: 2016-07-20 15:11
slug: react-native-moment-locale
tags: react native, moment, locale
layout: post
---

[moment.js](http://momentjs.com/) 是很常見的日期時間 library，友善的 API 與極佳的執行效率是它的兩大賣點。例如 `(new Date()).getFullYear()`，如果使用 moment.js 我可以只寫 `moment().get('year')`，可讀性增強許多。

## 問題

React Native 0.29.x 預設使用 ES6，並支援 `import` 語法。問題出在如果遵照官方網站的說明去載入語系檔，會發生找不到模組 (cannot find module) 的錯誤。推測可能是 moment.js 從 ES5 移植到 ES6 沒有轉換完全。

```javascript
import moment from 'moment';
moment.locale('zh-tw'); // 這一行會出錯
console.log(moment.months());
```

## 解法

GitHub 上已經有人回報相關錯誤，參考 [facebook/react-native#1629](https://github.com/facebook/react-native/issues/1629) 得出以下解法。

```javascript
import moment from 'moment';
import momentLocale from 'moment/locale/zh-tw'; // 多這一行
moment.updateLocale('zh-tw', momentLocale); // 改這一行
console.log(moment.months());
```

原理是使用 ES6 的語法將語系檔案手動載入之後使用 `updateLocale` 手動覆寫。issue 中的 `locale([locale_name], [locale_hash])` 已經被 deprecated，必須改用 `updateLocale`。
