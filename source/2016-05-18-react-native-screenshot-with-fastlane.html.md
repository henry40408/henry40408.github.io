---
title: React Native 使用 fastlane 螢幕截圖
date: 2016/05/18 15:26:03
slug: react-native-screenshot-with-fastlane
tags: react native, screenshot, fastlane
layout: article
---

## 問題

> App 上架一定要上傳螢幕截圖，我想要為 React Native 做自動螢幕截圖。

[React Native](https://github.com/facebook/react-native) 目前還是處於開發活躍期，官方文件混亂、第三方文件少，有些功能還要自己跳下去爬原始碼才知道。本文所描述的螢幕截圖，基本上官方的文件一丁點都沒有提到，網路上的資料也是片片斷斷非常稀少，讓我排列組合了一整天才有了今天的成果。

## 假設

1. 假設你使用 React Native 開發 app，而且是 iOS app。
2. 假設你採用 [fastlane](https://fastlane.tools/) 自動化開發流程，想要使用 [snapshot](https://github.com/fastlane/fastlane/tree/master/snapshot#readme) 做自動截圖。
3. 假設你懂一點的 Swift。 (你也可以使用 Objective-C，但要自己轉換)

## 前置作業

在放置 `fastlane` 資料夾那層目錄執行 `snapshot init`，在 `fastlane` 目錄產生 `Sanpfile` 與 `SnapshotHelper.swift`。我自己是放在 React Native 的專案根目錄，因為之後預計也會讓 Android 使用 fastlane 進行開發流程自動化。

## 解法

### 1. Snapshot 目前只支援透過 UI testing 做螢幕截圖

首先，在 iOS 上，Snapshot 目前只支援透過 UI testing 做螢幕截圖。

UI testing 是 for Mac OS X and iOS app 的 UI 測試框架，提供點擊、滑動等 API，讓 Xcode 模擬使用者的行為。透過 UI testing + Snapshot，你可以做到 **進入某個畫面、先滑動一次之後再截圖** 這種非常精細的擷取操作。

所以如果要讓 Snapshot 做自動截圖，你勢必要 **讓 UI testing 有辦法串接到 React Native** 。

### 2. 透過 `testID` property 為 React Native component 命名

> **testID** string
>
> Used to locate this view in end-to-end tests. NB: disables the 'layout-only view removal' optimization for this view!
>
> \- 擷取自 React Native [官方文件](https://facebook.github.io/react-native/docs/view.html#testid)

官方文件完全看不懂在寫什麼。

> Notice that I added `testID="test-id-textfield"` and `testID="test-id-textfield-result"` to the TextInput and the View. This causes React Native to set a [accessibilityIdentifier](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIAccessibilityIdentification_Protocol/index.html#//apple_ref/occ/intfp/UIAccessibilityIdentification/accessibilityIdentifier) on the native view. This is something we can use to find the elements in our UI test.
>
> \- 擷取自 [Automated UI Testing with React Native on iOS](http://blog.xebia.com/automated-ui-testing-with-react-native-on-ios/)

這篇文章的解釋好多了。

簡而言之，為 component 標上 `testID`，React Native 在編譯之後會為轉換出來的 native component 設定 `accessibilityIdentifier` 的屬性 (它是一個 *Optional String*)，這個屬性你可以類比成 HTML5 DOM 的 `id`，在同一份網頁中 (在 React Native 則是 **同一隻 app 中**) 是一個全域的 *identifier*，也就讓 Snapshot 在 UI testing 時可以透過這個 identifier 鎖定特定的 React Native component 了。

### 3. 等待 UI component 出現在畫面上

React Native 由於程式語言採用 JavaScript，非同步的操作寫起來非常爽 (除去 callback hell 這些不好的回憶)，結果有時候爽過頭，在測試的時候忘記 component 是非同步的，有時候測試會過有時候又不會過，實在讓人丈二金剛摸不著頭緒。

UI testing 提供 **等待 UI component 出現在畫面上、但如果等太久就讓測試失敗** 的 API。

> ```swift
> let nextGame = self.app.staticTexts["Game 4 - Tomorrow"]
> let exists = NSPredicate(format: "exists == true")
> expectationForPredicate(exists, evaluatedWithObject: nextGame, handler: nil)
>
> app.buttons["Load More Games"].tap()
>
> waitForExpectationsWithTimeout(5, handler: nil)
> XCTAssert(nextGameLabel.exists)
> ```
>
> Here we create a query to wait for a label with text "Game 4 - Tomorrow" to appear. The predicate matches when the element exists (element.exists == true).
>
> We then pass the predicate in and evaluate it on the label. Finally, we kick off the waiting game with waitForExpectationsWithTimeout:handler:. If five seconds pass before the expectation is met then the test will fail.
>
> \- 擷取自 [UI Testing Cheat Sheet and Examples](http://masilotti.com/ui-testing-cheat-sheet/)

這兩個 API 就是 `expectationForPredicate` 與 `waitForExpectationsWithTimeout`，具體的用法如擷取文字所示。如果要配合 React Native，寫出來的樣子就會如下所示：

#### 1. 在 React Native 裡為 `View` 標上 `testID`

```jsx
<View testID={'name-me-whatever-you-like'}>
  <TouchableWithoutFeedback onPress={onPressHandler}>
    ...
  </TouchableWithoutFeedback>
</View>
```

#### 2-1. 在 UI testing 中存取

```swift
class APPTests: XCTestCase {
  let app = XCUIApplication()
  
  override func setUp() {
    super.setUp()
    continueAfterFailure = false
    setupSnapshot(app) // 啟用 Snapshot
    app.launch()
  }
  
  func testAScreen() {
    let touchable = app.otherElements["name-me-whatever-you-like"]
    touchable.tap() // 模擬點擊
    snapshot("0AScreen") // 截圖！
  }
}
```

`snapshot("0AScreen")` 執行之後的截圖就是該 `View` 被使用者點擊之後的畫面。

#### 2-2. 等待 component 出現之後再截圖

有時候 component 可能是某個非同步操作完成之後才會出現在畫面上，這個時候就需要剛剛提到的兩隻 API 輔助了。

```swift
class APPTests: XCTestCase {
  let app = XCUIApplication()
  let exists = NSPredicate(format: "exists == true")
  
  override func setUp() {
    super.setUp()
    continueAfterFailure = false
    setupSnapshot(app) // 啟用 Snapshot
    app.launch()
  }
  
  func testAScreen() {
    let touchable = app.otherElements["name-me-whatever-you-like"]

    // 等 touchable 出現在畫面上，最多等 5 秒，不然就 test fail
    expectationForPredicate(exists, evaluatedWithObject: touchable, handler: nil)
    waitForExpectationsWithTimeout(5, handler: nil)

    touchable.tap() // 模擬點擊
    snapshot("0AScreen") // 截圖！
  }
}
```

Snapshot 執行完之後就會建立一個 HTML 文件，展示所有在 UI testing 執行的過程中擷取到的螢幕截圖。這個文件在之後 fastlane [Deliver](https://github.com/fastlane/fastlane/tree/master/deliver#readme) 會使用到，但你可以把它放進 `.gitignore`，因為每次需要上傳截圖之前理論上都會跑一次 Snapshot 更新截圖。

## 結語

> React Native 不是 JavaScript，他只是語言採用 JavaScript 來加速開發。

在本篇文章中，我們用到了不少 Swift 的知識與語法去實踐自動化螢幕截圖的功能，所以即使是採用 React Native，如果你是 native app 開發出身的工程師，也絕對不能忘記原來的背景知識 (e.g. Cocoapods、Objective-C、Swift、Java、Gradle…等)。因為 React Native 的資源還非常非常少，很多時候我們必須自己動手去橋接 native modules 給 React Native 使用，幸好 React Native 將橋接這件事情做得非常簡單，基本上只要介面 (Objective-C 的 `@interface`)寫好，剩下的事情就交給 React Native 去完成了。
