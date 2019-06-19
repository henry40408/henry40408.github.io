---
title: "當 iTerm 執行完 RSpec 之後彈出通知"
date: 2016-07-29
---

## 問題

我的 Ruby on Rails 專案我都習慣會寫 RSpec，但問題是只要專案一變大，RSpec 就會跑個二到三分鐘，以前我不是傻傻地盯著畫面等它完成，不然就是偷閒跑去看影集，往往把一集看完了才想起來有 RSpec 在執行。

昨天晚上靈機一動，想到之前在學 webpack 時，別人寫的 Yeoman generator 透過 iTerm 的通知功能在 bundle 打包完成通知開發者 ([Turbo87/webpack-notifier](https://www.npmjs.com/package/webpack-notifier))。於是我就想，有沒有可能以盡量簡單的方法去解決這樣的問題？

<!-- more -->

## 研究

首先，如果可能，**我盡可能地不要去寫程式**。寫程式的確有它的樂趣，但寫程式不可避免地一定要 debug。如果這些時間成本遠遠地超過問題的複雜度、所造成的困擾，那對我來說沒有任何價值。

於是我第一個想到的是 **iTerm 本身是否有這樣的功能**？StackOverflow 上已經有人提出一樣的問題並也得到了回答 [How do I make iTerm terminal notify me when a job/process is complete?](http://stackoverflow.com/a/30017258)，基本上就是設定 `Profile` > `Advanced` > `Triggers`，讓 iTerm 透過 regular expression 比對到特定的字串後觸發通知。

但對於 iTerm Triggers 的介紹到此打住，因為我稍後又針對 RSpec 找到更好的解決方法。

## 最佳解

[twe4ked/rspec-nc - RSpec formatter for Mountain Lion's Notification Center](https://github.com/twe4ked/rspec-nc)

原來不只我有這樣的需求，已經有同樣需求的開發者動手寫了一個 gem 來解決這樣的問題。使用方法很簡單，基本上只要照著文件說的安裝就可以直接使用了。

但如果開發的作業系統與部署用的主機不一樣，則還需要一些額外的設定。**在將 `rspec-nc` 加入 `Gemfile` 時，記得要設定 `require: false`**。在找到 `require` 這個選項之前，我實驗過好幾個跨平台的解決方案，都沒有成功。不是在 CI 階段失敗，就是在本機跑測試時會發生找不到 formatter 的錯誤 (`rspec-nc` 以 RSpec formatter 的形式與 RSpec 串接)。

這件事情原作者在 `README.md` 中沒有特別註明，對此我還特別發送了一個 pull request ([#21 add require option to the line in Gemfile](https://github.com/twe4ked/rspec-nc/pull/21))。
