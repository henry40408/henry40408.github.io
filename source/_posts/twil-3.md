---
title: "TWIL #3"
date: 2016-11-15
categories: ['每週分享']
---

## 瑣事

### [Lebab](https://lebab.io/)

應該不太有人會有這個需求，要把 ECMAScript 5 轉成 Babel。我的情境是 Middleman 會很雞婆地在部署前試著處理 JavaScript，卻無法處理 ECMAScript 6 的語法。然後個人感覺 Middleman 社群對於支援 ECMAScript 6 這件事也是愛做不做的，所以我只好先用 [Babel REPL](https://babeljs.io/repl/) 把 Babel 轉成 JavaScript 讓 Middleman 可以成功部署。

後來想想還是把 Daily UI 的成果放在 [Codepen](https://codepen.io/) 好了，畢竟人家都幫你準備好 SCSS + Babel 的環境，不用自己架還不用那真的是太對不起自己了。所以呢，我決定把原來 ECMAScript 5 的程式碼轉換回 Babel。以免訪客以為我只會寫 ECMAScript 5 卻不會 ECMAScript 6。這件事很重要啊！如果訪客是你下一份工作的面試官呢？

有發現 Lebab 是 Babel 倒過來嗎？

<!-- more -->

### [Change 2-space indent to 4-space in vim](http://stackoverflow.com/a/16892086)

vim 快速將四格空白替換成兩格空白。其實原理就是切換 vim 的參數，配合 `retab` 指令強制縮排。看起來多此一舉，但好處是我們不需要另外安裝 plugin，因為偶爾才會遇到類似的情形。

## Daily UI

### [Day 4: Calculator](http://codepen.io/henry40408/full/vXoMxj/)

計算機，大家已經做到爛掉了的題目。個人決心不要再用傳統的排版樣式，於是在 Dribble 上找到這個把四則運算符號移到數字鍵盤上方的版本 [Daily UI - Day 4: Calculator](https://dribbble.com/shots/2296696-Daily-UI-Day-4-Calculator)。

## [LeetCode 大冒險](https://github.com/henry40408/leetcode)

先解 alogrithm 的部分，由於我 C/C++ 都忘得差不多了，主要使用 Python 解題。

### [Two Sum](https://leetcode.com/problems/two-sum)

* 利用 `dict` lookup 嚇死人地快[^1]的特性，以 `dict` 解之。
* `matrix` 是一個 `dict`，以數字為 key，該數字在 list 中的 index 為 value。
* iterate 整個 list
  * 假設目前的數字是 7，目標是 9，已知是兩個數字相加，以 `in` operator 找找看 `dict` 裡有沒有 2。
  * 有，直接 `dict` lookup，回傳對應的數字 (2) 的位置與目前數字 (7) 的位置。
  * 沒有，把目前的數字為 key，位置為 value 放入 `dict`，等待相對應的數字出現。

### [Add Two Numbers](https://leetcode.com/problems/add-two-numbers)

* 第一次真的看不懂，為什麼 `4 + 6` 會等於 `0`？然後 `4 + 3` 會等於 `8`？
  * 看了 Input 與 Output 快第十次，才想到要回去看題目。
  * 注意這句話 The digits are stored in reverse order and each of their nodes contain a **single** digit.
  * 也就是說一個 element 只會放一位數，超過一位數就要讓下一位進位。
  * 考慮一下 edge case，一位數的最大值是 `9`，`9 + 9 = 18`，不會有要讓下一位 `+2` 的情況發生。
* 直接用 recursion 打死，code 既漂亮又好理解。
* 麻煩的地方在測試，linked list 在 Python 中反而不好處理。

### [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters)

> Recursion 不是卍解

* 遞迴好用，但在這題踢到鐵板。
  * CPython 的遞迴層數是有限制的，而且要修改也不好改。
  * 個人估計 LeetCode 也不會允許你去動那個限制。
  * 最後的解法是回去用迴圈。
* 設定一個暫存用的字串 `substring = ""`，暫存目前最大長度 `longest = 0`。
* 走訪字串的每個字元，設為 `c`。
  * 如果 `substring` 包含 `c`，把 `substring` 從 `c` 斷開，然後把 `c` 接到 `substring` 後面。
  * 考慮以下幾個情形：
    * `c = d, substring = dabc` (`c` 在最前面) 則 `substring = abcd`
    * `c = d, substring = adbc` (`c` 在 `substring` 中間) 則 `substring = bcd`
    * `c = d, substring = abcd` (`c` 在 `substring` 最後) 則 `substring = d`
  * 如果 `substring` 完成一回合之後的長度 **大於** `longest`，更新 `longest`。
* 最後的 `longest` 就是答案。

### [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays)

* 這題算我作弊，但嚴格來說也不能算作弊。
* 我直接用 Python 內建的 `sorted` 把 list 們合併 (`+`) 之後直接取中位數。
* 對 list 下 `sorted` 的時間複雜度平均 `O(n log n)` 最差 `O(n log n)`。
* 我有想過需不需要改用 generator 避免測資太大筆導致記憶體爆掉，事後想一想如果題目有一筆超級巨大的就會改用 generator 而不是 list 傳入了，否則在程式一開始執行的時候就會出問題。

### [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring)

* 這題是大魔王，讓我想了自己的解法想了足足三天。
  * 卡住的點在於當字串的長度是偶數時，必須把中心點放在字元之間，等於程式必須考慮字元 (`n`) + 字元間距 (`n-1`) 兩種情形 (`2n-1`)。
  * 然後直觀解法一個字元一個字元比對，一定會超時。
  * 最後實在想不出來，只好問 Google 大神了。
* 最後採用 Manacher's Algorithm。

## MacBook Air 送修前的轉移作業

由於 MacBook Air 的電池看起來快掛了，在送修之前我會把主機內的資料清空，因此勢必要另外開闢一個開發環境來繼續開發尚未完成的專案與部落格的更新。目前選擇的是 Ubuntu，以下是我考慮的幾個重點：

* **dotfile 的同步** 我現在都用 vim 進行日常開發，shell 則是 zsh，dotfile 的同步是一定要的。所謂的 dotfile 指的是前面帶有 `.` 的設定檔，一般都放在 home directory 下，例如 `.zshrc`、`.vimrc`、`.tmux.conf` 都是 dotfile。雖然因為不爽 Sublime Text 一直跳購買通知出來所以買了 license，但現在幾乎沒有再去開過 Sublime 了，次數少到就算現在移除了 Sublime 也不會對我的日常開發造成干擾。
* **SSH key 的同步** 這件事情我原本還想說用 USB 傳一傳就搞定了，卻在逛 [awesome-zsh-plugins](https://github.com/unixorn/awesome-zsh-plugins) 時看到 [BlackBox](https://github.com/StackExchange/blackbox) 這個 Plugin，可對 Git repository 加密，讓 SSH key 可以安全地透過 GitHub 同步。
* **GitHub Pages + Travis 佈署部落格** 這個算是 bonus，因為我大可以在 Ubuntu 上直接更新部落格之後直接更新。但我想要潮一點，透過 iPad 更新部落格，雖然不一定之後會這麼做就是了，才把腦筋動到 CI 身上。

### 跨裝置同步 dotfiles

[The best way to store your dotfiles: A bare Git repository](https://developer.atlassian.com/blog/2016/02/best-way-to-store-dotfiles-git-bare-repo/)

我目前手上有三支 dotfile 需要同步 `.zshrc`、`.vimrc` 與 `.tmux.conf`。以前的作法是使用 `gist` 這個 gem 加上自己寫的 alias command 去完成。假設今天我要備份 `.zshrc`，我就先 alias 一個 command `alias sync-zshrc='gist -u xoxoxoxo $HOME/.zshrc'`，`xoxoxoxo` 是 `.zshrc` 的 gist ID，要備份的時候我只要在 shell 下 `sync-zshrc` 就備份完成了。

問題是，**這樣的流程在備份上很簡單，但還原時就很麻煩了**。

因為我必須有幾個 dotfile 就要記幾個 gist ID，而且擔心 gist ID 外洩我還另外把 alias command 獨立成一個檔案，也就是備份的命令沒有備份到，假如有一天我要還原這些 dotfile，就要一個一個去 gist 上把它們的 gist ID 找回來，重新定義一次 alias command。

想到就很煩。

透過 Git bare repository 備份 dotfile 有幾個好處：

* **一個 Git repository 打死所有 dotfile** 不管日後新增或刪除 dotfile 都不會影響備份或還原的流程。
* **備份、還原用的 alias command 可以直接寫死在 shell 的 dotfile 裡** 因為不會帶任何敏感參數。
* **備份就是 commit + push，還原則是 pull + checkout** 都是 Git 的流程與指令，不需要學新東西。

### BlackBox 安全共享敏感檔案

[StackExchange/blackbox](https://github.com/StackExchange/blackbox)

BlackBox 的原理很簡單，即使用 GPG 加密來保護敏感檔案。相較於一般的加密方法，GPG 加密反其道而行， **以公鑰加密、以私鑰解密**。由於 repository 的 README 寫的非常簡略，在此重新整理一次如何使用這個工具。

在開始之前，有幾件事情要特別提醒：

* GPG key-pair 應該以機器 (host) 為單位，key-pair 不應該以任何形式同步到兩台機器上
* 要分享敏感資料給新機器或新使用者，**必須仰賴任何一台已經可以解密敏感檔案的機器重新加密檔案**
* 換句話說，**如果有辦法解密檔案的機器都無法使用，那麼這些敏感檔案就無法被破解了**，這算是在方便性與安全性上取得妥協

假設現在有兩個使用者：Alice 與 Bob。

#### Alice 備份自己的敏感檔案

* Alice 在自己的電腦上產生一對 GPG key-pair，分別是私鑰 *SK_alice* 公鑰 *PK_alice* `gpg --gen-key`
* Alice 將自己加入受信任的資料庫中 `blackbox_addadmin`
* Alice 使用 *PK_alice* 將敏感檔案加密 `blackbox_register_new_file`
* Alice 將加密後的敏感檔案上傳到 GitHub `git push origin master`

#### Alice 還原自己的敏感檔案

* 新電腦
  * Alice 在新電腦上產生一對 GPG key-pair，分別是私鑰 *SK_new_alice* 與公鑰 *PK_new_alice* `gpg --gen-key`
  * Alice 將存放敏感檔案的 repository clone 下來，加入 *PK_new_alice* `blackbox_addadmin KEYNAME`
  * Alice 將 repository 同步回 GitHub `git commit` `git push origin master`
* 舊電腦
  * Alice 同步 repository `git pull`
  * Alice 確定新電腦的公鑰有進入 repository `gpg --homedir=keyrings/live --list-keys`
  * Alice 匯入 repository 中兩支公鑰 *PK_alice* 與 *PK_new_alice* `gpg --import keyrings/live/pubring.gpg`
  * Alice 接下來可以使用這兩隻公鑰重新加密敏感檔案，讓新電腦可以使用 *SK_new_alice* 解密 `blackbox_update_all_files`
  * Alice 將 repository 同步回 GitHub `git commit` `git push origin master`
* 新電腦
  * Alice 同步 repository `git pull`
  * Alice 解密敏感檔案 `blackbox_decrypt_all_files`

#### Alice 與 Bob 共享敏感檔案

- Bob
  - Bob 在新電腦上產生一對 GPG key-pair，分別是私鑰 *SK_bob* 與公鑰 *PK_bob* `gpg --gen-key`
  - Bob 將存放敏感檔案的 repository clone 下來，加入 *PK_bob* `blackbox_addadmin KEYNAME`
  - Bob 將 repository 同步回 GitHub `git commit` `git push origin master`
- Alice
  - Alice 同步 repository `git pull`
  - Alice 確定新電腦的公鑰有進入 repository `gpg --homedir=keyrings/live --list-keys`
  - Alice 匯入 repository 中兩支公鑰 *PK_alice* 與 *PK_bob* `gpg --import keyrings/live/pubring.gpg`
  - Alice 接下來可以使用這兩隻公鑰重新加密敏感檔案，讓 Bob 可以使用 *SK_bob* 解密 `blackbox_update_all_files`
  - Alice 將 repository 同步回 GitHub `git commit` `git push origin master`
- Bob
  - Bob 同步 repository `git pull`
  - Bob 解密敏感檔案 `blackbox_decrypt_all_files`

由以上可以看到，**Alice 自己在兩台電腦或是跟 Bob 共享敏感檔案的流程基本上是一模一樣的**。

### GitHub Pages + Travis 打造全自動的部落格佈署流程

[Automating Deployments to GitHub Pages with Middleman and Travis CI](https://jahed.io/blog/2015/05/31/automating-deployments-to-github-pages-with-middleman-and-travis-ci/)

如果要在 iPad 上更新部落格，我現在假設的情境是：

* 無法使用 command line
* 也沒有機器可以讓我直接在 iPad 上 SSH 進去輸入 middleman 的指令

所以我只能在 iPad 上使用編輯器編輯 Markdown 檔案，編輯完之後使用 Git client 同步回 GitHub。至於這中間編譯成靜態網站的流程有很多方式可以達成，例如使用惡名昭彰的 AWS Lambda、或是另外跑一個 Heroku app 去監視 GitHub 都是一種，但都太過繁瑣。

於是我把腦筋動到 CI 身上。佈署的具體流程是這樣的：

1. Travis 同步 repository
2. Travis 取得有能力存取 GitHub 的 SSH key
3. 執行 Middleman 相關指令將靜態網站編譯出來
4. Travis 使用 SSH key 將編譯出來的靜態網站同步回 GitHub

這個流程中最麻煩的是如何與 Travis 安全地交換 SSH key。這個流程需要配合 Travis 的 client 去達成，但只要執行一次就可以了。

1. 安裝 Travis client
2. 產生 SSH key
3. 將 SSH key 加入 GitHub
4. 使用 `travis encrypt` 加密 SSH key
  * 此時會在 Travis 那邊加入兩個環境變數，用來在 Travis 端解密 SSH key
  * 在 repository 會留下被加密過的 SSH key `deploy_key.enc`
  * 過程非常安全，基本上連下指令的人都不會知道那兩個環境變數具體的值是什麼
5. 刪除 SSH key
6. 把加密過的 SSH key 上傳到 GitHub
7. Travis 會自動開始建制作業

除了文章中提到的步驟與設定，我還有在 Travis 上多做一些設定：

* **[on] Build only if .travis.yml is present** 否則 Travis 會試圖建制 `master` branch，由於 `master` branch 上是靜態網站的結果，因此一定會建制失敗
* **[on] Build pushes** 不開 Travis 就不會動
* **[on] Limit concurrent jobs? [1]** 一般如果跑測試，提高這個數值有助於加快測試流程，因為每次的測試彼此之間是獨立的。但由於現在建制會影響到 GitHub 上的內容，我把它設定成 1 避免重複建制
* **[off] Build pull requests** 不建制 Pull Requests，一定要更新到 `development` branch 上才會啟動建制，理由同 `Limit concurrent jobs?`

目前我已經將 Travis 的佈署流程應用到部落格上了 [henry40408/henry40408.github.io](https://github.com/henry40408/henry40408.github.io)。

[^1]: https://wiki.python.org/moin/TimeComplexity，dict 的 Get Item 平均 `O(1)`，最差 `O(n)`。

[^2]: 例如 henry40408.com 這樣的 domain name
