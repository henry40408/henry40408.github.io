---
title: "TWIL #2"
date: 2016-10-30
categories: ['每週分享']
---

## 瑣事

### [vim-plug](https://github.com/junegunn/vim-plug)

我最一開始是使用 [NeoBundle](https://github.com/Shougo/neobundle.vim) 管理 vim 套件，後來聽說 NeoBundle 的 [作者](https://github.com/Shougo) 又做了一支善用 vim 8 asynchronous API 的套件管理工具 [dein](https://github.com/Shougo/dein.vim)，號稱 *a dark powered plugin manager*[^2]。

<!-- more -->

但改用 dein 之後，我覺得速度上跟 NeoBundle 相比幾乎沒有改進，而且 dein 把指令全部拿掉，如果要呼叫某功能要自己下 `:call dein#some_function()` 之類的 vimscript。這讓日常使用變得很不方便，畢竟不是每個 vim 使用者都學過 vimscript。

後來我在 [neovim](https://github.com/neovim/neovim/wiki/Related-projects#plugins) 那邊偶然找到了 vim-plug。安裝 vim-plug 時需要在 vimrc 裡填入的指令比 dein 或 NeoBundle 少，常用的指令一個都沒缺，安裝套件的速度還比 dein 快非常多。以 JavaScript 最近的套件管理工具爭霸戰來相比，如果 dein 是 npm，那 vim-plug 就是 Yarn 了。

### [Best of My Vimrc](http://sts10.github.io/blog/2016/02/12/best-of-my-vimrc/)

一位 vim 使用者以自己的使用習慣為索引，引導讀者一步一步地看過一次他的 `vimrc` 並詳細地解釋了為什麼要這樣設定，以及這樣設定之後會帶來什麼樣的好處。

### [Unicode Symbol Search](https://github.com/bevesce/unicode-symbols-search)

有在使用 [Alfred](https://www.alfredapp.com/)、並常常需要跟 Unicode 符號打交道的 Mac 使用者，可以試試看這個 plugin。只要輸入 `times` 就會得到 ×、輸入 `right arrow` 就會得到 →，非常方便。

## 發揮 vim 的潛能

延續上一週，在學習 emacs 之前，先反省自己有沒有把 vim 的潛能發揮到極致。

### [Faster Grepping in Vim](https://robots.thoughtbot.com/faster-grepping-in-vim)

機器人公司的文章，以 [ag](https://github.com/ggreer/the_silver_searcher) 取代 grep，換來 **34 倍** 的效率提升。原來只是想針對 [greplace.vim](https://github.com/skwp/greplace.vim) 做效能上的改進，結果連 [CtrlP](https://github.com/kien/ctrlp.vim) 都沾了光，現在開啟檔案的速度跟 Sublime Text 相比一點差別也沒有了。

### [Vim Text Objects: The Definitive Guide](http://blog.carbonfive.com/2011/10/17/vim-text-objects-the-definitive-guide/)

vim 裡有一個概念叫做 <u>text object</u>：

> To edit efficiently in Vim, you have to edit beyond individual characters. Instead, edit by word, sentence, and paragraph. In Vim, these higher-level contexts are called text objects.

有時候會看到一些 vim 已經用得很習慣的開發者，霹哩啪拉地打了一大串指令，然後文字就很神奇地就完成了一般人可能要敲好幾個按鍵才能完成的工作。舉個例子，把 `(Hello)` 取代成 `(World)`，只要在括號內下 `ci(` 的指令，就會把 Hello 清除、進入編輯模式，使用者只需要再把 World 補上去，就收工了。甚至是 `<div>Hello, world!</div>` 這樣的 HTML，如果要把 `<div>` 換成 `<p>`，只需要在 `Hello, world!` 輸入組合指令 `cst`。

使用 vim，不一定要學會 text object；**但要有效率地使用 vim，你一定要學會 text object**。

### [How can I set up a ruler at a specific column?](http://vi.stackexchange.com/a/357)

這篇文章教 vim 的使用者，如何讓自己的 vim 在 80 字元的位置切分出一個分隔線。其中 `ctermbg` 的參數，可以參考 [這張圖片](http://i.stack.imgur.com/U5AJI.png)[^1]，為 `ctermbg` 指定色塊上的數字，到時候分隔線就會呈現出那塊色塊的顏色。注意要使用這個功能，vim 至少要 **7.3** 以上。

### [Make Vim show ALL white spaces as a character](http://stackoverflow.com/a/29787362)

我喜歡讓編輯器呈現出一些看不見的字元，例如空白或是 tab，這樣我比較好掌握文件的哪個區塊可能出現了不必要的空白字元，並配合 [better-whitespace](http://vimawesome.com/plugin/better-whitespace) 有系統地幫我移除掉不必要的空白字元。

### [VimTip#5: treat dashes as part of word](https://coderwall.com/p/lwvhkw/vimtip-5-treat-dashes-as-part-of-word)

如果常寫 HTML 或 CSS，每次以 `w` 指令選取 class name 的時候，都會被連字號 `-` 給切斷，每次遇到就恨得牙癢癢的，有沒有什麼方法將連字號視為文字的一部分呢？**只要將連字號加入 `iskeyword` 選項就可以了**。

## Daily UI

> A：「我是 fullstack engineer。」  
> B：「所以你知道 React, Redux, CSS transition 這些東西嘍？」  
> A：「那是什麼？能吃嗎？」  
> B：「那你還說你是 fullstack！？」  
> A：「會用 Ruby on Rails 不就是 fullstack 了嗎！？」  
> B：「⋯⋯」

好的，為了不再陷入這樣的爭議中，我決定來挑戰 Daily UI、強化前端技能了。

以下是我的 stack：

1. [Middleman](https://middlemanapp.com/)：由於目標是刻一個頁面出來、預期不需要後端，因此決定採用熟悉的 Middleman 直接產生靜態頁面。
2. [GitHub Pages](https://pages.github.com/)：Middleman 產生的靜態頁面可以直接 host 在 GitHub 上，快速又方便。
3. [SCSS](http://sass-lang.com/)：其實真正應派的作法應該是直接寫 CSS⋯⋯但 SCSS 用過之後就回不去了。沒有巢狀結構的 CSS 閱讀起來真的很想死。
4. JavaScript：秉持 *You might not need JavaScript* 的原則，接下來的 Daily UI challenges 盡量都不使用 JavaScript。

### [Day 1: Sign up](https://codepen.io/henry40408/full/BLXLMa)

> Hint: Design a sign up page, modal, form, app screen, etc. (It's up to you!) Don't forget to share on Dribble and/or Twitter when you're done.

* [Can I have an onclick effect in CSS?](http://stackoverflow.com/a/32721572) 之前就聽說有辦法單憑 CSS3 就能做出 click and toggle[^3] 的效果，直到今日才真正見識到 CSS3 的強大。
* [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) Flexbox 全屬性小抄，感覺就是一個必須釘在牆上天天看的好東西。
* [Brand colors](https://brandcolors.net/) 有時候我們需要參考一些重要網站的品牌配色，例如製作第三方登入的按鈕時，如果可以參考該網站的配色去設計按鈕 (例如 Facebook 設計成藍色、Google 設計成紅色、GitHub 設計成白底黑 logo)，可以有效地增進使用者體驗。
* [Semantic UI](http://semantic-ui.com/) 我稍微使用了一點 CSS framework，主要是表單的外觀，排版的部分我則是盡量使用 Flexbox。
* [SASS: @content directive is a wonderful thing](http://krasimirtsonev.com/blog/article/SASS-content-directive-is-a-wonderful-thing) 有用過 Ruby on Rails 就知道，除了 Ruby 本身可以塞 block，layout template 裡可以放 `<%= yield %>` 填充來自 view 的輸出。那 SCSS 裡有沒有類似的用法呢？**有，那就是 `@content`**。
* Middleman 有一個小小的雷。一般我們都會把需要 SCSS 轉換的檔案命名成 `foobar.css.scss` 的形式，已反映出這是一個會被編譯成 `*.css` 檔案的 `*.scss`。**但如果這個檔案要被另外一支 SCSS 檔案引入 `@import`，副檔名就不能寫 `*.css.scss`，而必須只寫 `*.scss`**。這個地雷也磨掉了我不少時間。
* [Pure CSS Slide Up and Slide Down](https://davidwalsh.name/css-slide) 除了 click and toggle 效果，純 CSS 現在也做得到 slide 的效果了。

這次就先做 **OAuth** 與 **e-mail** 註冊，成果已經放在 [GitHub Pages](https://henry40408.github.io/daily-ui/days/1.html) 上了。寫完之後才發現，怎麼跟 [DataCamp](https://www.datacamp.com/users/sign_in) 的登入頁面排版有 87 分像⁉哎呀學習都是從模仿開始的，不是嗎？

### [Day 2: Credit card](https://codepen.io/henry40408/full/MjNjxp)

* [How do you detect Credit card type based on number?](http://stackoverflow.com/a/72801) 之前不知道在哪家金流的結帳頁面，發現它們會根據卡號自動填入發卡商。其實信用卡的卡號就像身分證號碼一樣，也有一定的規律，比較麻煩的是 MasterCard，剛好在今年 (2016) 修改了卡號的規則，幸好還是有一定的規律可循。
* [Switch statement for string matching in JavaScript](http://stackoverflow.com/a/2896642) 配合卡號辨識，如何在 `switch` 中使用 RegExp 實作多重判斷。
* [PaymentFont](http://paymentfont.io/) 以類似 FontAwesome 的方式，提供各類信用卡 (Visa、MasterCard 等) 或支付方式 (Stripe 等) 的 icon 讓網頁嵌入。
* [Daily UI #002: Credit Card Checkout](http://codepen.io/supah/pen/OMdPpW) 一位 codepen 作者的 Daily UI 成品，看到之後才體會到什麼叫做「被電成智障」。
* [Create a CSS Flipping Animation](https://davidwalsh.name/css-flip) 如何以純 CSS 實作卡片翻轉效果。
* [Unsplash](https://unsplash.com/) 製作 prototype 時非常好用的圖庫，照片解析度夠高幾乎適用各種裝置。Unsplash 唯一的缺點是如果要使用這些圖片就需要把圖片本身下載下來，所以出現了 [Unsplash.it](https://unsplash.it/) 這個類似 CDN 的服務，只要輸入指定的參數就可以以生成的網址將照片嵌入。**唯一要注意 Unsplash 走的是 CC 授權**，所以如果要使用在商業上要留意一下 [Unsplash 的授權聲明](https://unsplash.com/license) 喔！
* [ISO/IEC 7810](https://www.wikiwand.com/en/ISO/IEC_7810) 規範信用卡尺寸的 ISO 標準。基本上大部分在市面上流通的信用卡、金融卡都是 ID-1，尺寸 85.6mm × 53.98mm。
* [Is there a JavaScript function that can pad a string to get to a determined length?](http://stackoverflow.com/a/14760377) 原來是要找 JavaScript 在字串右邊補 `0` 的方法，這篇雖然說的是在左邊補 `0` 的方法，不過只要稍微修改一下就可以當作右邊補齊來用了。一行完成，簡潔有力又不失可讀性。

本次 challenge 特別實作了 **擬真卡片** (加上 **卡片翻轉效果**)、**發行商辨識** (輸入卡號時自動判斷)。

### [Day 3: Landing Page](https://henry40408.github.io/daily-ui/index.html)

Landing page 小偷懶，直接拿現在 Daily UI 的首頁修改來交差。

[^1]: [to fix the color in vim or to take the plunge?](http://stackoverflow.com/a/16748521)
[^2]: [Trying out dein.vim -- a dark powered plugin manager](http://herringtondarkholme.github.io/2016/02/26/dein/)
[^3]: 點擊 A 元素之後切換 B 元素。例如點擊 <kbd>Sign up with E-mail</kbd> 按鈕顯示以 E-mail 註冊的註冊表單，再點擊按鈕一次關閉表單。
