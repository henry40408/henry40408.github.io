---
title: "TWIL #4"
date: 2017-01-03
categories: ['每週分享']
---

## 瑣事

* TWIL 系列中斷了大概兩個禮拜。這段時間都在重新尋找自己的職場定位與找工作，等找到新工作之後再把中間這段空白歸納成一篇文章填補回去。

<!-- more -->

## Emacs 入門

入門了快一個月，終於算是有點起色了，Emacs 果然是軟體史上使用曲線最陡的編輯器。稍微歸納一下，要入門大概有以下幾個訣竅：

### 笨拙沒關係，一直碰就對了

學習 Vim 時不也是如此嗎？一堆快速鍵一開始用腦子硬記根本記不起來。**最好的方式還是三不五時去碰，碰久了手指自然而然就記起來了**，讓腦子空出來寫文章或是寫程式，學習新的編輯器才有意義。

### 先不要管事實，要一直說服自己新的編輯器一定比較好用

如果要戰 Vim 或 Emacs 誰好誰壞，戰個三天三夜絕對沒有問題。問題是，如果一直留戀 Vim，那一百年也學不會 Emacs 啊！

### [Master Emacs in one year](https://github.com/redguardtoo/mastering-emacs-in-one-year-guide/blob/master/guide-en.org)

這算是我開始學習 Emacs 之後最難接受的概念，**別一開始就自幹設定檔**。我記得學習 Vim 沒多久，我就開始搗鼓自己的 `.vimrc`，開始加一大堆亂七八糟的 plug-in；換到 Emacs 之後，要搗鼓自己的 `.emacs` 可以，**你要先學會 Emacs Lisp**，自幹的門檻一開始就高的嚇死人。所以，**要自幹 `.emacs` 最好的方式就是先撿別人的設定檔來用，用到某個功能或快捷鍵真的很不習慣再找方法去改**，比起一開始就要從零開始架構整個 `.emacs` 快很多。

如果你跟我一樣也是從 Vim 跳槽到 Emacs，在這裡推薦一套 Emacs distribution [spacemacs](http://spacemacs.org)。

> The best editor is neither Emacs nor Vim, it's Emacs and Vim!  
> \- spacemacs

spacemacs 已經預先包好幾個 Emacs 上對從 Vim 跳槽過來的使用者較友善的 plug-ins：

* `evil`：**e**xtensible **vi** **l**ayer for Emacs，將 Emacs 的環境與快速鍵調整到**幾乎**與 Vim 一模一樣，例如：ex 指令列；區分 normal mode、insert mode；使用 `Esc` (Vim 使用者的習慣) 而不是 `Ctrl-G` (Emacs 使用者的習慣) 來終止操作⋯⋯等。而所謂的 ex 指令列，簡單來說就是 Vim 用來輸入 `:` 開頭的命令 (例如 `:set` 、 `:nnoremap` 、 `:bdelete`) 的指令列。
* `helm`：Emacs 的自動完成框架。有用過 [YouCompleteMe](https://github.com/Valloric/YouCompleteMe) 的 Vim 使用者只要一用過就回不去了，在 Emacs 上如果沒有類似的套件真的會很難過。
* 其他例如 [`vim-easymotion`](https://github.com/easymotion/vim-easymotion) 、 [`vim-surround`](https://github.com/tpope/vim-surround) 、 [`vim-unimpaired`](https://github.com/tpope/vim-unimpaired) ，spacemacs 維護成員也會視社群意見，選擇要不要把類似的功能打包進 spacemacs。事實上，**Emacs 與 Vim 相互參考彼此的功能，然後移植過去的例子不在少數**。同樣都是開放原始碼，就不要去計較誰抄襲誰的問題了啦！

我現在基本上都開著 spacemacs 的官方文件 [`DOCUMENTATION.org`](https://github.com/syl20bnr/spacemacs/blob/master/doc/DOCUMENTATION.org)，真的想不起來某個指令怎麼用就去翻一下，大部分問題都可以得到解決。有時候甚至會在文件中找到一些之前沒有發現的新功能，例如我就是在這份文件裡得知 spacemacs 有將 `vim-surround` 移植過去。

最後獻醜一下自己的 spacemacs 設定檔 [.spacemacs](https://github.com/henry40408/dotfiles/blob/master/.spacemacs)。

Emacs 跟 Vim 類似，單個設定檔用 `.emacs`、多個設定檔就會新增個 `.emacs.d` 的目錄把設定檔都塞在裡面。由於 spacemacs 的原理是把整個 `.emacs.d` 覆寫掉，改放 spacemacs 修改後的 Emacs 設定檔，官方稱之為 *Layer*，所以另外開了個 `.spacemacs` 將一些與 spacemacs 有關的設定獨立出來，日後如果使用者想要像我一樣把設定檔擺在 GitHub 上跟別人分享，只要公開 `.spacemacs` 這個檔案就可以了。
