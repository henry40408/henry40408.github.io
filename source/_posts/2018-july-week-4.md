---
title: "2018 七月第四週"
date: 2018-07-22
---

本週我把部落格從 Jekyll 換到 gatsby、看了一部投石機的 maker 影片。

<!-- end -->

## 工程

### 升級 Jekyll，升著升著就跳槽到 gatsby 了

痛死了，完全沒有以前在寫 Ruby 時那種無時無刻無痛升級的爽感。

我的部落格（嘿對就是這個）原來是以 Jekyll 產生的靜態網站，會想要去升級部落格的 Ruby gems，是因為 Orange Tsai 找到了一個 sprockets 的洞 [Rails Asset Pipeline Directory Traversal Vulnerability (CVE-2018-3760)](https://blog.heroku.com/rails-asset-pipeline-vulnerability)，其中一個 Ruby gems 有用到出問題的版本，間接導致 GitHub 跳 [security alert](https://blog.github.com/2017-11-16-introducing-security-alerts-on-github/) 給我。

其實我大可以把 sprockets 升級完就收工，但我想頭都洗下去了那就洗乾淨一點，想要把一些已經很久沒有維護的 Ruby gems 換掉，一換下去連頭皮都洗破了。

我原本有使用一套 [jekyll-picture-tag](https://github.com/robwierzbowski/jekyll-picture-tag)，上次更新已經是 2015 年的事了。

後來找到了 [jekyll-responsive-image](https://github.com/wildlyinaccurate/jekyll-responsive-image)，傻了，這一套要怎麼用啊？圖片要放哪裡？放圖片的目錄結構要長什麼樣子？為什麼 Liquid tag 的樣子跟我之前用 Jekyll 的時候長得不太一樣？一定不是文件沒有寫清楚，而是我看不懂。

最後決定把 Jekyll 換成 [gastby](https://www.gatsbyjs.org/)，使用體驗到目前為止還不錯，原來部落格有用到的功能 gastby 都有支援，SEO 看起來也沒什麼問題，就先湊合著用吧！之後看看運作的怎麼樣，有機會再來寫寫使用心得。

### [Bitwarden](https://bitwarden.com/)

繼 1password、master password 之後，又一套密碼管理工具。

我自己是用 [master password](http://www.masterpasswordapp.com/)，沒有任何同步機制。這個坑我自己推也不如 Pseric 大大推地好，不如直接引用他的文章：

> [Master Password 忘掉你的密碼吧！超簡單、聰明的跨平台密碼產生器](https://free.com.tw/master-password/)

用到現在有一個很明顯的缺點，master password 既然沒有同步機制，如果忘了特定網站的參數，例如一開始設定的 domain name、或是服務改了 domain name，例如 github.com 改成 git.microsoft.com 之類的、或是密碼輪調的次數，就叫不出原來設定的密碼了。所以我還是將 master password 存放網站清單的目錄同步到 Dropbox（主密碼當然不能同步上去），避免電腦遺失了就真的登入不了所有網站了。

### [实力科普：为什么浮层或弹框一定要有叉叉关闭按钮？](https://www.zhangxinxu.com/wordpress/2018/07/why-dialog-panel-need-close-button/)

其實就是一句話：「使用者習慣都被 Windows 帶壞了、工程師都被 Windows 綁架了」使用者已經習慣 Windows 的介面操作之後，我們怎麼設計都跳不出 Windows 的五指山了。無障礙什麼的真的只是其次，否則使用者在無障礙模式下還是想在右上角搜尋關閉按鈕的行為要怎麼解釋？

還記得每個設計師都恨得牙癢癢的「漢堡選單」嗎？積非成是啊！

### [Why JSON isn't a Good Configuration Language](https://www.lucidchart.com/techblog/2018/07/16/why-json-isnt-a-good-configuration-language/)

這一篇我要提出不一樣的觀點，YAML 如果遇到巢狀很深的情況，也是看到吐血：

```yaml
---
foo:
  bar:
    baz:
       alpha:
         beta:
           gamma:
             delta: 1
    naughty: 2
```

好，問題來了， `naughty` 的 parent 是誰呢？真的別說這種深巢狀的設定檔不可能出現，Kubernetes 的設定檔隨便寫層級都會變得超級深。雖然提出這一點並沒有起到捍衛 JSON 的作用，但至少 "YAML is not better" 。

接下來是 TOML，看看 [官方文件](https://github.com/toml-lang/toml#array-of-tables)

```toml
[[fruit]]
  name = "apple"

  [fruit.physical]
    color = "red"
    shape = "round"

  [[fruit.variety]]
    name = "red delicious"

  [[fruit.variety]]
    name = "granny smith"

[[fruit]]
  name = "banana"

  [[fruit.variety]]
    name = "plantain"
```

我覺得並沒有比較「簡潔」，因為 `fruit` 與 `fruit.variety` 的視覺干擾也很嚴重。HJSON 則還算可以接受。

另外的問題是：好，就算我今天把 Ruby on Rails 的 YAML 換成 TOML、NPM 的 `package.json` 換成 `package.yaml`，合作的工程師或不知名的路人甲看 code 的時候只會覺得 WTF？假設對方沒有學過 TOML，那等於是把一套語言硬生生的甩在別人臉上，要他吞下去。慣例很重要，不符合慣例的事情做了，別人在耐著性子聽完理由之前就離開了，不能批評人家為什麼都不願意花時間理解。

其實更多時候影響閱讀體驗的不是設定檔的 syntax，而是設定值名稱的語意不清。

### [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer/blob/master/README-zh-TW.md)

大補帖啊...該來開個 [Things](https://culturedcode.com/things/) 專案來把它讀完了。

### [Farewell, Google Maps](https://www.inderapotheke.de/blog/farewell-google-maps)

最近 Google Map 價格上漲，除了私人企業的成本上漲，也連帶影響到政府部門：

> [Google 地圖大限到，API 連線變嚴變貴影響政府機構](https://technews.tw/2018/07/16/google-maps-due-date-is-on-api-key-access-is-charging-more-expensive-and-restricted-and-will-effect-government/)

這篇文章不爽的點其實是 Google 在沒有預先告知的情況下驟然變更政策的行為，這讓我想起另外一篇文章 [Why you should not use Google Cloud](https://medium.com/@serverpunch/why-you-should-not-use-google-cloud-75ea2aec00de)，大意是某家企業在 GCP 上的服務突然被中止，而且據作者事後補充好像已經發生過兩次了。另外在這篇文章的下面、title 是 Google Cloud 的 Customer Engineer [回覆](https://medium.com/@mkahnucf/i-highly-recommend-establishing-an-enterprise-relationship-with-google-cloud-e97f4ac5d69) 了，但似乎讓問題變得更糟：

> I highly recommend establishing an enterprise relationship with Google Cloud. It seems you are running a mission critical application on a consumer account and this issue could have been avoided. Reach out to the support team and let them know you want to discuss enterprise options to ensure you have done everything possible to ensure your account is never impacted like this in the future. Ping me if you have any trouble getting through.

看起來完全沒有回應到苦主的 GCP 被停用的問題，底下回應自然是罵聲一片。另外在作者補充的 Hacker News 文章中也 [有人指出](https://news.ycombinator.com/item?id=17433091) AWS 的 support 應對這種緊急情況也是這種事不關己的態度。

天下烏鴉一般黑，只好回到 bare metal 的懷抱（？）

### [airbnb/hypernova](https://github.com/airbnb/hypernova)

Airbnb 開源的 server-side render service，支援 Node.js、Ruby on Rails、PHP。這週看到另外一篇也是 Airbnb 的文章 [Operationalizing Node.js for Server Side Rendering](https://medium.com/airbnb-engineering/operationalizing-node-js-for-server-side-rendering-c5ba718acfc9)，內容是他們怎麼盡可能的榨乾 server-side render 時每一個環節的效能。

### [Z - Pattern Matching for Javascript](https://z-pattern-matching.github.io/)

非常有趣的 library，但相較於 erlang、Haskell、Elixir，我完全不會想在 JavaScript 裡寫 pattern matching。現在我大概能理解為什麼我分享 [Hyperloop](http://ruby-hyperloop.org/) 給一位 Ruby 工程師時，他的回應是「沒有很想用 Ruby 寫 component XD」了。不是語言層面支援的特性，可能在之後在延伸使用情境的時候，因為語言的限制變的更加綁手綁腳。

### [Netflix/pollyjs](https://github.com/Netflix/pollyjs)

很像 Ruby 的 [vcr/vcr](https://github.com/vcr/vcr) 的 HTTP record library，看到是 Netflix 的開源專案有一種放心的感覺，至少相較於 Google 而言啦 :smile:

### [How Fast Can You Learn React?](https://hackernoon.com/how-fast-can-you-learn-react-49c4bdabc0df)

看到文章中一句話我大笑：

> The biggest bullshit that has ever been said about React

React 老實說真的沒有很好學，因為我們必須先了解什麼是 [Flux](https://www.youtube.com/watch?list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v&time_continue=621&v=nYkdrAPrdcw)、`state` 與 `props` 的區別、如何跟非同步的操作同步、component 的 lifecycle（在此之前要知道 React component 是什麼）。

我覺得 React 沒有很好學，但一堆 startup 選用的其中一個可能的原因在於：團隊決定選用 React 時有很大的機會已經不只一個人了，所以可以享受到 React 導入後的 _紅利_ 。但當 _一個新人_ 要加入一個已經採用 React 的團隊時，新人必須靠一個人的力量追上團隊已經採用的整套 React stack。又或者沒有這麼複雜，大家會想用 React 只是因為 BCDD（Big-Company Driven Development）或 HDD（Hive Driven Development）法則發威了而已。

另外我在現在服務的公司常常聽到有同事說 React 好複雜，還是 vanilla JavaScript 的時代美好。這一點我還在反思原因，之後可能會整理一篇文章出來試圖解釋這件事。

## [15 HTML element methods you’ve potentially never heard of](https://hackernoon.com/15-html-element-methods-youve-potentially-never-heard-of-fc6863e41b2a)

算是開了眼界，但也沒有這麼少用，只是真的要找的時候會忘記關鍵字要怎麼下。

[#7 getBoundingClientRect()](https://hackernoon.com/15-html-element-methods-youve-potentially-never-heard-of-fc6863e41b2a#b041) 應該也沒有這麼鮮為人知啦，至少之前同事在實作 infinite scroll 的時候用的可兇了。

[#13 forEach()](https://hackernoon.com/15-html-element-methods-youve-potentially-never-heard-of-fc6863e41b2a#7f7f) 我之前在用的時候真的是被電到嘰嘰叫，因為 DOM 的 [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) 並沒有定義如 `map`、`filter` 等 Array methods，所以要自己再用 [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) 轉換。

### [Martijn Cuppens on Twitter: "The div that looks different in every browser"](https://twitter.com/Martijn_Cuppens/status/1015169981368225793)

很有趣的發現，IE、Edge、Safari 看起來中規中矩，然後 Firefox 跟 Chrome 那是什麼噁心的變形啊 :fearful: 底下有另外一位開發者直接把這項發現寫成文章了 [The Div That Looks Different on Every Browser](https://crossbrowsertesting.com/blog/design/the-div-that-looks-different-in-every-browser/) 裡面有附上更多瀏覽器的截圖。

### [Mastering MongoDB - Faster elections during rolling maintenance](https://hackernoon.com/mongodb-faster-elections-a567ae5416f5)

向 CIA 學習如何推翻外國政府（大誤）：

1.  用 `rs.freeze()` 凍結所有可能會成為 primary 的人選
2.  用 `rs.stepDown()` 要求現在的 primary 退位
3.  其他 secondary 都被 `rs.freeze()` 了，沒有人敢出來跟內定的 secondary 競爭大位
4.  secondary 順利成為 master，民主選舉好棒棒

另外這一篇教學也利用了 [electionTimeoutMillis](https://docs.mongodb.com/manual/reference/replica-configuration/#rsconf.settings.electionTimeoutMillis) 這個設定，讓 primary 勝出的時間縮短。要注意的是選舉完 electionTimeoutMillis 要記得調整回來，否則區域網路如果發生一段延遲可能就會不停觸發選舉。

最近剛好在研究怎麼切換 MongoDB replication set 的 primary instance，結果這篇文章就出現了，只能說緣份到了擋都擋不住。

## 非工程

### [最佳化「投石機」](https://youtu.be/-gn2RGPqe_A)

第一眼看到 Trebuchet 我以為是什麼最近 release 的工具、或專案、或專案，結果它指的是真的是「投石機」。影片就是一位 maker 自幹投石機的過程，先組裝了一台 prototype、然後才組裝出一座比較大的投石機。雖然看不懂中間一段力學公式在算什麼，等於沒有看懂人家最佳化投石機的總結，但只看投石機將「砲彈」（其實就只是是網球，但高速前進的網球殺傷力應該也蠻驚人的了）也算值回票價了。
