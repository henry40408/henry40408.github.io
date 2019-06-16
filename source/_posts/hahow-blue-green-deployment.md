---
title: 淺談 Hahow 藍綠部署
date: '2017-08-16T02:58:31.371Z'
categories: []
keywords: []
---

故事要從老師透過客服回報的一個 bug 開始說起…

> _老師 A 從自己的課程（Course）下刪除了一筆課程單元（Lecture），後台顯示的課程單元總數卻沒有變化（課程單元總數在某一筆課程單元被刪除後應該要減一）。_

Hahow 會實作藍綠部署，主要目的就是要解決這個 bug 背後真正的問題。

### 環境介紹

在切入本文前，由於會在文中被頻繁地提及，因此先快速且簡短地帶過 Hahow 目前的 infrastructure。

{% asset_img 1*ADmLntt1LYxyosjsXsi2vg.png Hahow 目前的 infrastructure %}

從 client-server 架構的角度切入，Hahow 目前只有一台 API server 搭配一組 MongoDB cluster 處理來自前端的所有請求。MongoDB cluster 是透過 [MongoDB Cloud](https://www.mongodb.com/cloud) 架設的 [replication set](https://docs.mongodb.com/manual/replication/)，內含一台 master 與兩台 slave，三台 database instance 都跑在同一台 GCE instance 上；API server 則是在 Docker container 裡執行，host 在另外一台獨立的 GCE 上。

從 infrastructure 的角度切入，Hahow 以 GCE 為基礎，在上面安裝 Docker engine，然後以 Docker container 的形式執行 nginx server、API server。其中 nginx server 以 reverse proxy 的形式，連接 API server 與 sidekicks。而 API server 與 sidekicks 則透過 Docker container networking 與 HTTP API 互通有無。外界可以透過 nginx server 讀取 sidekicks 的資料，但只有 API server 有權限寫入。

另外還有執行在獨立 GCE 上的 Jenkins，負責發動軟體部署，並透過 agent 存取執行 API server 的 Docker host，有完整權限訪問 Docker host 上所有的 port 與讀寫特定檔案。

### 抽絲剝繭

第一步當然是進 MongoDB 確認資料是否毀損或是有不一致。在開始說明資料庫的情形以前，要先解釋一下 Hahow 如何在資料庫裡存放課程（Course）與課程單元（Lecture）。首先 Course 底下會有一個 `lectures` 陣列，保存該課程所有 Lecture 的 ObjectId（一種 MongoDB 的資料類型，相當於關聯式資料庫的 primary key），並有一個 `course` 欄位反向連回課程 Course。調查的結果，出錯的 Course `lectures` 底下已經找不到被刪除的 Lecture 的 ObjectId，但以 _出錯的 Course 的 ObjectId_ 為查詢條件反向撈出所有 Lecture，赫然發現應該已經被刪除的 Lecture 居然還在資料庫裡！

掌握資料庫的情形後，再來檢視 API server 刪除課程單元的程式邏輯，假設老師要刪除 Lecture #2：

{% asset_img 0*cUEHsKzEEu3Wlcov.gif 正常運作的刪除課程單元的程式邏輯 %}

程序是先將 Lecture 的 ObjectId 從 Course 的 `lectures` 陣列中刪除，再從資料庫刪除 Lecture。但如果在執行第一步之後被 _某事件_ 截斷，而無法執行到第二步呢？

{% asset_img 0*kTIrxxs09q0PULEL.gif bug 發生時被中斷的刪除課程單元的程式邏輯 %}

由於第二步永遠不會被執行，因此 Course 的 `lectures` 陣列雖然找不到被刪除的課程單元 Lecture，但由於 Lecture #2 沒有被真正刪除，所以如果以 _Course 的 ObjectId 為查詢條件撈出所有 Lecture 並計算其數量_，就會得到前後數量不一致的結果。

至於是什麼事件，其實第二張圖已經提前洩漏答案了 (interrupted by deployment)，就是軟體部署（software deployment）。在掌握資料庫內的資料變化後，我們立刻著手查詢 API server 在 Sentry 的 error log、nginx 的 error log，在 bug 發生的前後都沒有找到有強烈關聯的 exception 或 error message。最後抱著姑且一試的心態，翻查了一下 Jenkins 的建置日誌，發現 bug 發生前兩分鐘有執行過一次軟體部署。在 local 端使用一些取巧的方式重現 bug 後（e.g. 使用 `setTimeout` 拉長 request 的時間然後強制關閉 API server），我們有八九成的把握確定應該就是部署新程式導致這個資料不一致的 bug。

問題找到了，那要怎麼解決這個 bug 呢？我們有想到幾個方法：

#### 原子化

所謂的 _原子化_，指的是將好幾筆寫入資料庫的操作打包成一次寫入，如果失敗就將資料庫還原到寫入被發動前的狀態。使用 MongoDB 提供的 [\$isolated](https://docs.mongodb.com/v2.6/reference/operator/update/isolated/) [operator](https://docs.mongodb.com/v2.6/reference/operator/update/isolated/) 理論上就可以解決這個問題，算是一個治本的方法，問題是如果要找出所有的資料庫操作並加上 `$isolated`，曠日費時、緩不濟急，來不及改完的 API 可能又會發生一樣的錯誤。

#### 讀寫分離

礙於團隊裡沒有人研究過 MongoDB 的讀寫分離，第一要花時間研究，跟原子化一樣緩不濟急；二是會動到資料庫的本體架構，風險比原子化更大。

#### 藍綠部署

會想到這套解決方案，主要是我上一份工作離職前的最後一個 task，就是跟 DevOps 一起完成主機的藍綠部署，所以印象特別深刻（箇中血淚礙於篇幅只好跳過）。如果實作藍綠部署，首先是 API server 本身不用立刻實作原子化，也不會動到資料庫的本體架構，因此風險遠遠小於讀寫分離，又不會像原子化那樣緩不濟急。但為什麼藍綠部署可以解決開頭提到的 bug 呢？又，什麼是藍綠部署？

在說明 Hahow 的實作方式之前，讓我先短暫地介紹一下藍綠部署。

### 藍綠部署

當 server 有新功能完成，或有 bug 被修復，必須經過一個 _程序_ 將新版本的 server 推送上線，該 _程序_ 即軟體部署（software deployment），而藍綠部署（blue-green deployment）是其中一種。

> As you prepare a new version of your software, deployment and the final stage of testing takes place in the environment that is not live: in this example, Green. Once you have deployed and fully tested the software in Green, you switch the router so all incoming requests now go to Green instead of Blue. Green is now live, and Blue is idle. 
> -  [Using Blue-Green Deployment to Reduce Downtime and Risk](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html)

一次藍綠部署大致可分為四個階段，分別是啟動、健檢、切換、終止。

1.  **啟動**：啟動新版 server。
2.  **健檢（health check）**：對新版 server 做健康檢查。有可能是負責藍綠部署的程式訪問 server 上特定的 API 並檢驗得到的回覆（Hahow 採取此策略）、或等待 server 主動發出特定訊號，這一步的主要目的是確認新版 server 已經準備好接收來自外部的連線。如果在一定的時間內新版 server 始終無法進入備戰狀態，那本次部署就宣告失敗。
3.  **切換**：開始讓新版 server 接收外部流量，並截斷外部流量繼續流向舊版 server。
4.  **終止**：關閉舊版 server，完成一次藍綠部署。

只看到新舊，那麼藍綠在哪呢？事實上，藍綠只是代號。假設今天舊版 server 是綠，那麼新版 server 就是藍，下一次部署就藍綠互換，週而復始、生生不息。藍綠部署的核心精神是，部署被發動後，舊版 server 不應處理新進的請求，而是轉交新版 server 處理。如果對藍綠部署的細節有興趣，可以參考 DigitalOcean 的 [How To Use Blue-Green Deployments to Release Software Safely](https://www.digitalocean.com/community/tutorials/how-to-use-blue-green-deployments-to-release-software-safely) 與 Martin Fowler 的 [BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)。

大致了解藍綠部署的原理與核心精神，接下來介紹 Hahow 風格的藍綠部署。

### Hahow 的藍綠部署

在介紹 Hahow 的藍綠部署前，先簡單帶過常見的藍綠部署，以及 Hahow 為什麼不照做就好。

{% asset_img 0*ajnoN8cfnuT3-Av0.png 常見的藍綠部署 %}

常見的藍綠部署，通常會在所有主機前掛上一台高可用性（high availability，幾乎不會下線或下線的時間短到足以忽略）的 load balancer（e.g. AWS 的 ELB、GCP 的 Google Load Balancer）統一接受、分發外部流量，然後以虛擬主機（e.g. AWS 的 EC2、GCP 的 GCE）為單位做藍綠部署。基於成本、infrastructure 與趨勢的考量，Hahow 決定不直接採用：

1. **成本**：啟用一台 load balancer 約會增加每個月 20 美金左右的成本，如果省下來就可以購買其他的 SaaS。是說錢該花則花，如果沒有想到 Hahow 的藍綠部署，可能就會採用 load balancer。
2. **infrastructure**：假設以常見的藍綠部署去實作，就需要另外再開一台 GCE，然後在上面安裝 Docker engine，然後再執行 API server、sidekicks 等 Docker container。基於趨勢，斷然為了實作常見的藍綠部署，而捨棄已經部分容器化的 infrastructure，勢必得不償失。另外 Hahow 在 Angular 時代就有使用 Prerender 這項服務來處理 SEO，而我們也準備在轉換到 React 後繼續使用此服務，不是很確定 Google Load Balancer 會不會需要額外的處置（或者是說，拆除額外的地雷）。
3. **趨勢**：就目前（2017）的趨勢來看，容器化將會是未來軟體部署與執行的主要方式，Hahow 的工程團隊也有在觀望 GKE（Google Container Engine）與評估 infrastructure 全容器化的可能性。如果以解決軟體部署中斷資料庫操作的問題來看，Hahow 的藍綠部署是基於現有架構的折衷方案；但如果以全容器化為目標的觀點來看，Hahow 的藍綠部署充其量只能算是一個過渡性的方案。

一圖勝千言，先上一張 GIF：

{% asset_img 1*NyTna9kIXF68yM2LUkLLKw.gif Hahow 的藍綠部署 %}

Hahow 的藍綠部署主要牽涉三個角色，Docker、nginx 與 Jenkins。其中最最重要的角色是 nginx，因為它肩負著縮短下線時間的使命。現在讓我們一張一張分解上面這張 GIF，標題前方括號內對應藍綠部署的四個步驟：

#### 初始狀態

{% asset_img 0*hBj6qcPAjmVWKeji.png 藍綠部署開始前的初始狀態 %}

本次藍綠部署開始前的狀態，目前在線上提供服務的是版本號 v1 的 server，代號是綠色。由於 API server 在 Docker container 裡執行，因此 Docker container 加上 API server 整體代稱 green container；左下角的箭頭代表使用者，黑色箭頭代表外部流量，綠色箭頭則是以 green container 為目標的外部流量；green container 與 blue container 以黑與白分別代表已關閉與已啟用的狀態。

#### \[啟動/健檢\] Jenkins 啟動新版  server

{% asset_img 0*3aen_zk2lO_8jE5f.png Jenkins 部署並啟動包含新版 server 的 Docker container %}

Jenkins 啟動包含版本號為 v2 的 API server 的 Docker container，代稱 blue container，並開始對 blue container 執行健康檢查，注意此時外部流量還是繼續流向 green container。

Hahow 透過呼叫非公開的 API 檢查 server 是否已經進入備戰狀態。假設 Jenkins 收到 server 回傳 `OK`，則代表萬事俱備；反之 Jenkins 不會收到任何回應，則代表 server 仍在啟動中。

#### \[健檢\] Blue container 沒有通過健康檢查

{% asset_img 0*j3zTqbJzLtL-z6om.png Blue container 沒有通過健康檢查 %}

天有不測風雲，code 有旦夕禍福。假設今天 v2 的 API server 有 bug 而無法正常啟動，且 Jenkins 重複嘗試數次後始終無法得到回應（以大大的紅叉叉表示），blue container 關閉，以啟用 v2 為目標的藍綠部署在此宣告失敗。

{% asset_img 0*XoOy-W8kSLZ9vXiU.png Blue container 回到關閉的狀態，green container 繼續處理外部流量 %}

由於 Hahow 的 API server 需要在啟動時建立與 MongoDB 的連線，不可能在瞬間就啟動完成，因此 Jenkins 會設定一個時限（timeout），如果沒有在時限內得到回應，就會再嘗試一次。但也不是無限次數的重複下去，否則如果真是 API server 有 bug，那本次藍綠部署就永遠沒有結束的一天了。在重複嘗試一定次數後，如果還是沒有得到新版 server 的回應，那本次部署宣告失敗。Hahow 每次藍綠部署最多會嘗試 10 次、每次 3 秒，總共 30 秒，30 秒後如果還是沒有回應就會宣告失敗，所以可以確定每次部署最長不會超過 30 秒。

注意如果 blue container 的健康檢查沒有通過，green container 還是會繼續留在線上處理外部流量。

#### \[啟動/健檢\] Jenkins 部署修正 v2 bug 的  v3

工程師發現 v2 無法成功部署，迅速地修正 bug、通過 code review，透過 CI 打包成 v3 的 Docker image 後，再次嘗試部署。

{% asset_img 0*7U0LRtmW4qoJ9Mbd.png Jenkins 部署修正 v2 bug 的 v3 server %}

一樣由 Jenkins 部署與啟動，並開始健康檢查，健康檢查的細節如前文所示，不再贅述。

#### \[健檢\] Blue container 通過健康檢查

{% asset_img 0*iok9K5PSG1cSJS__.png Blue container 通過健康檢查 %}

Jenkins 在 v3 啟動不久就收到 `OK` 的回應，代表 blue container 通過健康檢查。於是 Jenkins 開始執行下一步，讓 blue container 上線，並將外部流量導向 blue container。

#### \[切換\] Jenkins 對 nginx  發出訊號要求重啟

再繼續下去之前，如果對 nginx 的 reverse proxy 不甚熟悉，建議可先服用 DigitalOcean 的概念文 [Understanding Nginx HTTP Proxying, Load Balancing, Buffering, and Caching](https://www.digitalocean.com/community/tutorials/understanding-nginx-http-proxying-load-balancing-buffering-and-caching) 與實作文 [How To Configure Nginx as a Web Server and Reverse Proxy for Apache on One Ubuntu 16.04 Server](https://www.digitalocean.com/community/tutorials/how-to-configure-nginx-as-a-web-server-and-reverse-proxy-for-apache-on-one-ubuntu-16-04-server)。

{% asset_img 0*L3aNTbsrdiwveySq.png Jenkins 對 nginx 發出信號要求重啟 %}

確定 blue container 進入備戰狀態後，Jenkins 此時會向 nginx 發出訊號要求其重啟，指令非常簡短：

```
nginx -s reload
```

不過在重啟之前，我們必須先竄改設定檔，有點像是趙高在秦始皇駕崩後篡改遺詔讓胡亥登基那樣（對不起最近古裝劇看太多），讓 nginx 重啟之後將外部流量通通導向 blue container。前面有提到，Hahow 的 nginx 也是在 Docker container 裡執行。為了達成藍綠部署中切換流量的步驟，Hahow 在 nginx 的設定檔中挖了一個洞：

```
upstream my_blue_host {
  server myhost:10080;
}
​
upstream my_green_host {
  server myhost:10081;
}
​
server {
  listen 443 ssl;
  # ... 其他設定 ...
  location / {
    proxy_pass http://my_{{color}}_host; # Hahow 在這一行挖了一個洞
  }
}
```

那個看起來像是變數一樣的 `{{color}}`，會讓這一份檔案變成非法的 nginx 設定檔，如果直接餵給 nginx，nginx 會抱怨該行有語法錯誤並拒絕執行。所以這一份檔案在餵給 nginx 之前，必須先把 `{{color}}` 消滅掉。所以 Jenkins 事實上並不是直接以 nginx 的指令重啟 nginx，而是以目前的顏色為參數，呼叫一支 nginx container 裡的 shell script 把 `{{color}}` 代換掉，接著由同一支 shell script 下指令重啟 nginx。那 shell script 要把 `{{color}}` 代換成什麼呢？

往上看看 `upstream`，有兩個分別命名為 `my_blue_host` 與 `my_green_host` 的設定，在 Hahow 的藍綠部署設定上，為了簡化切換程序，我們讓 green container 固定與 port 10080 綁定、blue container 與 port 10081 綁定。假設之前部署的是綁定在 port 10081 的 green container，那就會把 `{{color}}` 代換成 `blue`，讓 `proxy_pass` 指向 blue container；如果是綁定 port 10080 的 blue container，就會代換成 `green`，讓 `proxy_pass` 指向 green container。此時衍伸出另外一個問題，Jenkins 怎麼知道要傳哪個顏色進去呢？

最最一開始實現藍綠部署時，我把目前的顏色直接寫在一份檔案裡，讓 Jenkins 去讀取那份檔案。問題是那份檔案放置的位置讓它看起來像是一個暫存檔，難保哪一天某位新進同事看它不順眼就把它給砍了，肯定會天下大亂。於是我們改將目前部署的顏色寫到專門存放狀態啦、金鑰啦、環境變數啦的 [Consul](https://www.consul.io/) 裡，然後讓 Jenkins 在藍綠部署開始前，透過 [Consul 的 HTTP API](https://www.consul.io/api/index.html) 將目前在線上的顏色讀出來，並在藍綠部署成功結束後將新的顏色寫回去。

後來我們發現了 [consul-template](https://github.com/hashicorp/consul-template) 這支好用的小工具，再度調整流程，在 nginx 的 container 裡放置一支 consul-template，並在藍綠部署時讓 consul-template 監聽 Consul 內的變化，自動地生成 nginx 設定檔。藉此讓生成設定檔與重啟 nginx 這兩件工作化整為零，交由 Consul 與 consul-template 全權負責，實現藍綠部署在 nginx 這一段的流程的全自動化。

nginx 收到重啟指令後、正式重啟前會先檢查設定檔，如果 shell script 竄改後的設定檔還是有語法錯誤或是檔案缺失，nginx 就會拒絕重啟，繼續使用原來的設定檔。當然 nginx 執行驗證程序時也不會下線，因此如果真的設定檔驗證失敗，nginx 會使用原來的設定檔將外部流量繼續導向 green container。

如果 shell script 竄改的設定檔通過 nginx 驗證，那就會開始整個藍綠部署最重要的一步，漸進式地替換掉 nginx 的 child process。

#### \[切換\] nginx 逐一替換掉 child process

先引用一段 nginx 文件，是關於 nginx master process 與 child process 的分工與關係：

> nginx has one master process and several worker processes. The main purpose of the master process is to read and evaluate configuration, and maintain worker processes. Worker processes do actual processing of requests.
>
> - [_Beginner’s Guide_](http://nginx.org/en/docs/beginners_guide.html)

nginx 啟動時會建立一個 master process 與好幾個 child process，其中 master process 負責讀取、驗證設定檔並管理所有 child process，而實際處理 HTTP request 的是 child process。另外一段引文，同樣出自 nginx 文件，內容是關於 nginx 收到重啟指令、完成設定檔驗證後的流程：

> Once the master process receives the signal to reload configuration, it checks the syntax validity of the new configuration file and tries to apply the configuration provided in it. If this is a success, **the master process starts new worker processes and sends messages to old worker processes, requesting them to shut down**. Otherwise, the master process rolls back the changes and continues to work with the old configuration. Old worker processes, receiving a command to shut down, stop accepting new connections and continue to service current requests until all such requests are serviced. After that, the old worker processes exit.
>
> - [Starting, Stopping, and Reloading Configuration](http://nginx.org/en/docs/beginners_guide.html#control)

nginx 重啟時，會分批替換掉 child process。首先 nginx 會禁止根據舊版設定檔產生的 child process 繼續接收 HTTP request，要求其處理完執行中的 HTTP request 後立刻退出；並依據新版設定檔建立 child process，讓新版 child process 接手處理新進的 HTTP request。

{% asset_img 0*sXDdDaAwOc26kXiy.png 開始替換 child process %}

{% asset_img 0*oz0XPyXzreZuTukj.png 替換掉 1 個 child process，還有 2 個 %}

{% asset_img 0*F8We6OASngg8nYGv.png 以此類推 %}

{% asset_img 0*90y4A89d6YOGhnFP.png 替換掉 2 個 child process，還有 1 個 %}

{% asset_img 0*S96ICLRDBmwkQP59.png 以此類推 %}

{% asset_img 0*7k7ajwI_9LS8t-nG.png 替換掉最後一個 child process %}

{% asset_img 0*xghK08LWdA1W9HNB.png 完成 child process 的替換，現在外部已經無法存取舊 API server（green container）了 %}

以上系列圖是 nginx 重啟時的詳細過程。紫色箭頭是 master process 對 child process 發出的內部信號，藍色與綠色箭頭分別代表以 blue container 與 green container 為目的地的外部流量。隨著系列圖一張接著一張，會發現綠色的箭頭慢慢變少，而藍色的箭頭取而代之，最後只剩下藍色的箭頭，代表 blue container 開始接收所有外部流量，green container 功成身退。

最後，是時候讓 green container 宣告退休了。

#### \[終止\] Jenkins 終止 v1 server

{% asset_img 0*1MYRBcuLoN_ZMxgI.png Jenkins 要求 v1 server 在時限內關閉 %}

nginx 完成重啟程序後，Jenkins 就會對 green container 下達指令，要求它在時限內關閉：

```
# docker stop -t 5 green
```

`-t` 選項後面帶著一個數字，單位是秒，限定 Docker container 必須在幾秒內關閉。如果 container 沒有在時限內主動關閉，那 Docker 就會在超時後強制關閉 container。green container 關閉後，至此完成一次藍綠部署，期間沒有發生任何服務下線的情形，最後附上一張藍綠部署的最終狀態示意圖：

{% asset_img 0*cyzdw815K1gGB5cQ.png 本次藍綠部署的最終狀態 %}

示意圖上方的 green container 變成黑色，代表 container 已關閉並離線，而箭頭所代表的外部流量全部流向 blue container。

### 待改進之處與未來展望

#### 將關閉的控制權還給 server

Hahow 藍綠部署的最後一步，是透過 Docker 加上時限參數，要求 container 在時限內關閉，否則就會強制關閉。此做法會有一個極有可能在未來發生的問題，如果今天 API server 就是這麼繁忙，在關閉之前還有非常大量的 HTTP request 必須要消化掉，而無法在時限內關閉怎麼辦？如果 Docker 此時強制將 API server 關閉，那就有機率地會發生所一開始提到的問題。

要避免這個問題最好的方式，就是不要透過 Docker 加上時限參數關閉 API server，而是透過 Docker 轉發訊號給 API server，讓 API server 消化掉 HTTP requests 後自己發動關閉程序（e.g. 關閉資料庫連線），最後自己退出。Docker 只要靜靜地在旁邊等 API server 自己關閉就好了。

#### 如果要修改 nginx 本身的設定檔，還是會有服務下線的時間

例如修改 nginx 設定檔內 `location` 之類的路由規則，就必須重新部署 nginx，下線時間就躲不掉了。解決的方案有一是對 nginx 也做藍綠部署，前面掛一台更穩定的 load balancer，例如 HAProxy；二是將 nginx 的設定檔抽出來另外存放，透過另外一個 Docker container 產生新版設定檔後再餵給 nginx。

第二個方法的問題在於現在 nginx 的設定檔被分成兩個部分，分別是藍綠部署時固定不動的部分（e.g. `location` 的路由規則），以及藍綠部署時會變化的部分（e.g. 包含 `{{color}}` 變數的那一行）。要怎麼適當地切割這兩個部分並維持藍綠部署繼續運作，有待研究。

#### nginx 本身不適合當作 load balancer  來用

前面有說到，常見的藍綠部署前面會掛一台 load balancer 來接收並分發外部流量。現在可以只用 nginx 充當藍綠部署的 load balancer，是因為現在 Hahow 的流量還沒有大到切換時由於 nginx 或 API server 所暫存的資料量太大，而切換不順暢或完全切換不過去的問題。但如果 Hahow 的流量與連線數持續成長下去，總有一天還是會遇到這個 happy problem。

與 nginx 相比，可以承載更大流量與更穩定的 HAProxy 或 Google Load Balancer 都是更好的選擇。隨著 Hahow 現在的流量與連線數還在穩定成長，總有一天還是要實作 load balancer。如果到時候的目標是轉移到 GKE 上，那與 GKE 高度整合的 Google Load Balancer 就是最好的選擇；但如果因為一些不可抗力因素必須留在 GCE 上，或無法使用 Google Load Balancer，HAProxy 就必須列入考慮了。
