---
title: "rbenv 2.x 的 readline 問題"
date: 2015-07-30
---

最近參考 [Deploy Ruby On Rails on Ubuntu 14.04 Trusty Tahr](https://gorails.com/deploy/ubuntu/14.04) 部署了兩隻 Ruby on Rails 應用程式，卻都發生 rails console 無法在部署的機器上執行的問題。每次要執行 rails console 的時候，都會發生 `LoadError`（詳細輸出請參考 [這篇 StackOverflow](http://stackoverflow.com/q/22915676)）。一開始也懶得去解決，想說遠端機器使用 rails console 的機會沒有想像中的多。但小問題不解決，總有一天變成大問題。如果急著要用 rails console 卻怎麼樣也開不起來，那就真的火燒屁股了。

接下來一步一步分析。

## 最明顯的第一步：找不到 readline

直接下 `sudo apt-get install libreadline6 libreadline6-dev` 試著解決。

結果這兩個套件都安裝了，問題不是出在這。

## readline 在，但 ruby 找不到它

直接貼錯誤到 Google 上搜尋。

參考 [ruby-build](https://github.com/sstephenson/ruby-build) 的 [Suggested build environment](https://github.com/sstephenson/ruby-build/wiki#suggested-build-environment) 章節，最下面有提到 **如果在編譯 ruby 時發生跟 readline 有關的問題，傳一個參數 `RUBY_CONFIGURE_OPTS` 與 readline 的路徑給 rbenv 解決** 。

> If you get error with `readline` during the build of `ruby`, use the `RUBY_CONFIGURE_OPTS` to specify where to find `libreadline.so`. By example, to install `ruby 2.1.1`, use the whole following command: `RUBY_CONFIGURE_OPTS=--with-readline-dir="/usr/lib/libreadline.so" rbenv install 2.1.1`.

[rbenv](https://github.com/sstephenson/rbenv) 透過 ruby-build 編譯 ruby。

從這一點來看， ruby-build 自己在編譯 ruby 的時候不會主動去找 readline 來編譯，所以需要另外指定。

找到一個答案，又出現另外一個問題。

## readline 成功 import，但 ruby 編譯失敗

GitHub 上面有段非常精彩的 [Issue](https://github.com/sstephenson/ruby-build/issues/526)，討論 import readline 後 ruby 編譯之後還是會失敗的問題。一開始某位核心貢獻者認為這個問題不應該是 ruby-build 的問題，因此斷然地把 Issue 給關掉了，卻因此惹惱另外一個開發者，覺得關掉 issue 的貢獻者在推諉卸責。幸好大家都還是很理性，後續的討論提供了不少解決方法。在此僅提供集大成，且徹底解決我問題的 [mislav 的 comment](https://github.com/sstephenson/ruby-build/issues/526#issuecomment-37933242)。

## 終極解法

先移除沒有編譯 readline 的跛腳版本。(2.1.1 記得代換成你自己的 ruby 版本)

```bash
$ rbenv uninstall 2.1.1
```

再打上社群提供的 patch

```bash
$ curl -fsSL https://gist.github.com/mislav/a18b9d7f0dc5b9efc162.txt | rbenv install --patch 2.1.1
```

完成之後，切換到專案的 current 目錄下，輸入以下指令就可以使用 `rails console` 了。

```bash
$ RAILS_ENV=production bundle exec rails console
```
