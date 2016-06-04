---
title: 在 React Native 裡避免大量的 ../../
date: 2016/05/25 23:01:00
slug: prevent-dot-dot-in-react-native
tags: react native, dot dot, directory traversals, import
layout: article
---

## 問題

React Native 採用 ES6 做為開發語言，而 ES6 的 `import` 語法指定檔案時採用相對路徑。如果採用 [Redux](http://redux.js.org/) 架構開發，很快地 `Component` 就會開始出現以下一堆亂七八糟的 `import` 語句。

```javascript
import DoSomething from '../actions/DoSomething';
import DoAnotherThing from '../actions/DoAnotherThing';
```

如果是從 HTML4 時代就開始寫 JavaScript 的工程師，乍看之下沒有什麼不好，因為絕對路徑與相對路徑的好壞在 HTML4 的時代就吵過一次，最後的結論也都是有好有壞。**但 React Native 不是 ES5**，規模很容易膨脹到超過傳統 ES5 專案的程度，因此應該另尋專為大型專案設計的解決方法。

## 他山之石

讓我們來看看 Python 與 Java 的 `import` 語句。

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from app import MyApp
```

```java
import butterknife.BindView;
import butterknife.BindViews;
import butterknife.ButterKnife;
import butterknife.OnClick;
import butterknife.OnItemClick;
import butterknife.OnLongClick;

import tw.com.sudo.JavaProject.DummyClass;
```

Python 跟 Java 都號稱專為大型專案設計，而他們的 `import` 語法也驚人地相似。簡而言之，它們原理就是 **以專案目錄為起點，去定位被 import 的檔案位置**。因此無論你的檔案怎麼搬動，只要還在專案目錄下，`import` 語句的起點都不會改變，讓重構的意願提高。

## 解法

如果是 React Native，**你什麼事都不必做**，因為 React Native 已經內建了從專案目錄計算 import 路徑的功能。雖然 React Native 已經支援了相關功能，但由於官方文件並沒有明確說明，只有 [相關的 issue](https://github.com/facebook/react-native/issues/3099)，具體的方法是在 [StackOverflow](http://stackoverflow.com/questions/30040534/local-require-paths-for-react-native) 上找到的，因此如果要使用在 production 上要特別小心。

如果你要嘗鮮，以下是具體寫法。

```javascript
// src/foo/DummyClass.js
class DummyClass { ... }
export default DummyClass;
```

```json
// src/package.json
{
  "name": "@src"
}
```

```javascript
// src/components/Bar.js
import DummyClass from '@src/foo/DummyClass';
```

整體而言就是透過 `package.json` 去為 `package.json` 的目錄命名 (在此命名為 `@src`，越特別越好，不然可能會與其他來自 npm 的 package 撞名)，之後所有在專案下的 ES6 檔案的 `import` 路徑就會多一個以 `@src` 開頭的路徑，起點從 `src/` 開始。

## 結語

掰掰，`../../`。

