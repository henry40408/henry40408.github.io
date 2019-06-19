---
title: 啟用 Drupal 7 簡潔網址時的地雷
date: 2015-12-10
categories: ['Drupal']
---

很久沒使用 Drupal 7 開發網站了。最近搬遷一個舊 Drupal 網站的時候遇到一個很雷的問題。由於這個問題以前就遇到過，這次再遇到我決定把它記錄下來，一勞永逸，或多或少也可以幫助到受困於同樣問題的同道中人。

但在開始之前，你必須先完成幾個必要步驟。

<!-- more -->

## 必要步驟

### 第一步，啟用 `mod_rewrite`，如果你是使用 Apache2 的話

**Ubuntu 14.04 預設不會啟用**，所以這一點要特別注意。

如果是使用 nginx，可以參考[官方網站](https://www.nginx.com/resources/wiki/start/topics/recipes/drupal/)。

### 第二步，確定在 Apache2 的設定檔中有開啟 `AllowOverride`

```apache
<Directory [網站跟目錄]>
    ...
    AllowOverride All
    ...
</Directory>
```

如果沒有做這一步，網站的 `.htaccess` 裡的設定 Apache2 會讀取不到。如果你的設定是放在 `<VirtualHost>` 標籤中，請確定這一組 `<Directory>` 標籤放在裡面，不然重新啟動的時候會過不了設定檔案測試。

### 第三步，**重新啟動伺服器**

不管你是用 Apache2 或 nginx。**如果閃神一定會遺漏這一步**，尤其是困在一個問題上太久一定會精神渙散，少了這一步之前無論做多少設定都是做白工。

如果以上步驟都完成了，進到設定還是找不到 `Enable clean URLs` 的勾選按鈕，那你就遇到跟我一樣的問題。

## Drupal 官方討論區提供的解法

> Try navigating to "/admin/config/search/clean-urls" (remove the ?q= from the URL). It sounds silly but it worked for me.
>
> -- [DaisyMaeH's comment](https://www.drupal.org/node/1719476#comment-6923572)

我同意這位使用者的想法，*這個解法真的很 silly、很無腦*，而且各位看到的時候腦中一定會閃過「我怎麼沒有想到」的想法。但老實說解法真的就是這麼簡單，而且簡單地也有他的道理。而且沒有想到也不是你的錯，**因為 Drupal 也沒有很明確地指出錯誤何在**。

注意網址列，如果你的網址是 `http://<site-url>/index.php?q=admin/config/search/clean-urls`，請把它改成 `http://<site-url>/admin/config/search/clean-urls`，**然後你就會發現 `Enable clean URLs` 的勾選方塊出現了**。

老實說我覺得真正無腦的是那個 `Run the clean URLs` 按鈕，因為測試通常都不會過，但也不會告訴你具體原因，你只能盲猜，**但其實真正的問題一直都是出在網址列上**。

原來是網址列啊，我怎麼都沒有想到。
