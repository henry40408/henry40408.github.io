---
title: "MongoDB 與 Mongoose 執行測試時注意刪除 database 同時也會刪除 collection 的 index"
date: 2017-02-04
---

> 這篇文章適合使用 MongoDB 與 Mongoose 的 Node.js 開發者

### 2017-06-14 更新

之前有提到效能方面的問題，現在 test case 已經成長到 600 多筆，還沒有發生非常顯著的效能問題，因此 [`db.colleciton.ensureIndex`](https://docs.mongodb.com/v2.6/reference/method/db.collection.ensureIndex/) 理論上可以放心使用了。

## 前言

如果是 TDD 風格的測試，通常會經過以下步驟：

1. `before` hook function 準備環境。
2. `describe` 與 `it` 執行測試，有時候還會有 `context`。
3. `after` hook function 收拾殘局。

在準備環境的階段，通常會建立一個暫時性的資料庫，讓 test runner (e.g. Mocha) 去模擬資料庫的讀寫，最後在收拾殘局的階段把資料庫刪掉。如果專案採用的資料庫是關聯式資料庫，因為資料與定義是分開的，這個程序基本上不會有什麼問題；但如果採用的資料庫是 MongoDB，adapter 是 Mongoose，**那要特別注意資料庫被刪除的同時 collection 的 scheme 也會被一起刪掉**。

## 每次執行專案或測試 Mongoose 建立資料庫的程序只會執行一次

無論是專案或測試開始執行時，Mongoose 只會在最一開始時根據定義好的 schema 建立整個資料庫。而透過 Mongoose 執行寫入操作時，如果 database、collection 沒有先被建立，MongoDB 會在此時建立缺少的 database 與 collection，然後才執行寫入，**此時 Mongoose 就不會去參考專案定義的 schema 了**。

## MongoDB 的 unique constraint 需要 unique index 才能運作

假設我們在一個欄位的選項中設定 `{unique: true}`，Mongoose 在建立資料庫的階段，會在 collection 的 scheme 建立一個 unique index。如果沒有這個 unique index，那麼 unique constraint 就不會運作，**新建立的 document 就有可能跟已經建立的 document 發生衝突，而且什麼事都不會發生，也不會有 exception 被拋出**。

## 執行單一檔案會成功，但是執行所有檔案就會失敗

如果有設定 `gulp-watch` 來監看變動的檔案並執行測試，就有可能發現與 unique constraint 有關的 test case，在執行單一檔案時會通過，但執行所有檔案時卻會失敗的靈異現象。

**這是因為無論是執行單一檔案或執行全部檔案，Mongoose 只會在最一開始時根據專案定義的 schema 去建立整個資料庫，然後就不會再執行**。

如果某個 `after` hook function 把資料庫整個刪掉，collection 的 unique index 也會被跟著刪掉，unique constraint 就不會被觸發。通常在 test case 我們會去捕捉是否有 exception 被拋出，所以 test case 就會因為沒有 exception 被拋出而失敗。

## 解決方案

還好 MongoDB 有提供一個 method [`db.colleciton.ensureIndex`](https://docs.mongodb.com/v2.6/reference/method/db.collection.ensureIndex/)，可以強迫資料庫根據定義的 schema 重建 collection index。既然 API 都有了，要做的只剩下在 `before` hook function 呼叫 ensureIndex。

雖然這個解法可以完美排除掉 unique index 被一併刪除的問題，由於我現在遇到的 test case 大概只有 200 筆左右，對於效能是否會有影響需要更進一步的測試。
