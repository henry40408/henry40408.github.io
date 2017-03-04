---
title: React Native, react-native-fbsdk 與 Facebook SDK
date: 2016-08-08 14:26
slug: react-native-fbsdk-and-facebook-sdk
tags: react native, facebook sdk, facebook
layout: post
---

由於 app 需要 Facebook 第三方登入的功能，需要 Facebook SDK；好歹 React Native 也是 Facebook 官方的開源專案，為 React Native 開發一個 [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk) package 是一定要的。SDK、npm package 與開發框架全員到齊，一副勢如破竹的氣勢，要寫出一支強大的 app 應該不會有什麼問題了吧？

殊不知這三個傢伙從此鬧內鬨，宛如八點檔一樣每個禮拜上演兄弟鬩牆的慘劇。

![](http://s2.quickmeme.com/img/33/33e9408a4714f68dbf4a7f92558928f2dd08f8b25e55401699949f042eb7583f.jpg)

這次三兄弟不賣布丁，改鬧內鬨了。另外，**以下問題與解決方案一律都只討論 iOS**。

## 問題

先將問題重現一次。

1. 先建立一個 React Native 專案，再來繼續 Facebook 的部分。
2. 首先你必須先安裝 `react-native-fbsdk`。
3. 根據 [Facebook 官方文件的說明](https://developers.facebook.com/docs/ios/getting-started/)，下載 Facebook SDK，解壓縮到 `~/Documents/FacebookSDK` 底下。
4. 在 terminal 下 `rnpm link` 將 `react-native-fbsdk` 連結到 Xcode 專案。
5. 接下來你就可以試試看 `react-native-fbsdk` 提供的 example code，如果可以編譯成功並執行，那這篇文章對你來說到這邊就可以結束了。

但如果編譯不過，那你遇到了與我一樣的情況。從一開始導入 Facebook SDK 到現在遇過以下幾個問題。

1. `FBSDKLoginKit/FBSDKLoginKit.h file not found`
2. `ld: framework not found FBSDKLoginKit for architecture x86_64`
3. 最痛苦的莫過於 `FBSDKLoginKit` 還有可能代換成 `FBSDKCoreKit` 或 `FBSDKShareKit`，端看人品而定
4. 最終結果都是 `Build Failed`。

## React Native、`react-native-fbsdk` 與 Facebook SDK 之間的關係

動手解決問題前，先搞清楚 React Native、`react-native-fbsdk` 與 Facebook SDK 之間的關係。

```
react-native <---> react-native-fbsdk <---> Facebook SDK
(JS)               (JS/Objective-C)         (Objective-C)
```

React Native 與 `react-native-fbsdk` 之間的連結沒有什麼問題，因為它們彼此的連結是 JavaScript 的 export/import 關係。出問題的是以下兩個地方。

1. React Native 的 Objective-C 層搜尋不到 Facebook SDK 的 header file，導致初始化 Facebook SDK 的程式碼無法執行。(`FBSDKLoginKit/FBSDKLoginKit.h file not found`)
2. `react-native-fbsdk` 找不到 Facebook SDK 的 dynamic library，導致 link 階段失敗。(`ld: framework not found FBSDKLoginKit for architecture x86_64`)

## 解決方法

### 找不到 header file

- 讓專案指向 Facebook SDK 的位置去找尋 header file 其實無傷大雅，但我們沒辦法保證日後 Facebook 會不會單方面地把 header file 從 SDK 的壓縮檔裡抽掉，所以這不是一個牢靠的辦法。
- 我的解法是採用 [Cocoapods](https://github.com/CocoaPods/CocoaPods) 去管理這些 header file，**透過 Cocoapods 下載 Facebook SDK 的原始碼後，幫我自動生成 Xcode workspace 檔案去管理 header file 的搜尋路徑**，這樣我就可以省下手動管理 header file 路徑的功夫，避免掉手動管理可能造成的問題。
- **所以最後我的專案裡會有兩份 Facebook SDK**，一份以原始碼形式存在 (透過 Cocoapods 安裝)、一份以 dynamic library 形式存在 (透過解壓縮 Facebook SDK 手動安裝)。

### 找不到 `FBSDKLoginSDK` framework

- `react-native-fbsdk` 預設會找 `~/Documents/FacebookSDK` 與 React Native 專案資料夾底下的 `ios/Frameworks`，如果都找不到需要的 frameworks 就會發生錯誤。`react-native-fbsdk` 最少也要有 `FBSDKCoreKit`、`FBSDKLoginKit` 與 `FBSDKShareKit` 才能保證正常運作。
- 這個問題的解決方法很簡單，將 Facebook SDK 裡的 frameworks 解壓縮之後複製到上述的兩個路徑之一就可以了，剩下的問題 `react-native-fbsdk` 會幫你解決。
- 我的做法是將 `ios/Frameworks` 加入 `.gitignore`，但是忽略 `ios/Frameworks/.keep`，讓 Git 可以把 `ios/Frameworks` 加入 repository，並在 `README.md` 中提醒後來的開發者記得去下載 Facebook SDK 自己手動加進專案中。

## 結語

這個問題會導致整個 app 沒辦法編譯成功，表面上看起來不起眼的問題，Xcode 卻強迫我們一定要去解決。上次遇到這個問題時沒有特別把它記錄下來，糊里糊塗地就解決了，之後也沒有再出什麼問題。直到上個禮拜五早上升級 Facebook SDK 時這個問題才又再度出現，然後這次是再也沒有辦法呼嚨過關了，也才定下心來想要認真解決。
