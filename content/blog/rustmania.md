+++
title = "Rust 狂熱"
date = "2026-07-12T17:18:15+08:00"
tags = []
+++

我有一台 Raspberry Pi 4 8GB，我在上面執行幾個 self-hosted app，最近我把幾個 app 換掉了。

# Miniflux ➡️ [rdrs](https://github.com/henry40408/rdrs)

Miniflux 是用 Go 寫的，記憶體用量很低，但它依賴一個吃記憶體的怪物——PostgreSQL。我很喜歡 PostgreSQL，工作上除了 PostgreSQL 我基本上不會考慮其他 RDBMS，因為它很穩定，是忠實的好夥伴，不會因為莫名其妙的問題讓我必須加班。

網路上已經有很多文章頌揚 PostgreSQL 的穩定，我就不再重複：

- [Squeeze the hell out of the system you have](https://blog.danslimmon.com/2023/08/11/squeeze-the-hell-out-of-the-system-you-have/)：應該先嘗試把 PostgreSQL 的效能榨乾再考慮另外建立專門的服務處理。
- [Postgres Is Enough](https://postgresisenough.dev/)：PostgreSQL 或許可以取代掉哪些常見的服務。

記憶體的問題可以靠調整設定來解決，但還有另外一個麻煩——**備份**。

我知道備份有 [pgbackrest](https://github.com/pgbackrest/pgbackrest) 可以用；相較於 SQLite 只要將檔案複製到其他地方就可以解決，pgbackrest 的設定真的很複雜。另外 [pgbackrest 今年還短暫宣布停止維護](https://lwn.net/Articles/1069951/)，雖然現在已經恢復，難保哪天作者又無法繼續維護了。

所以 rdrs 出現了，對，就是這麼樸實無華，我只是想要一個支援 SQLite 的 RSS reader。Miniflux 有嘗試支援 SQLite，但目前的進度卡在作者希望有一個 [pure-go SQLite](https://github.com/miniflux/v2/issues/1925)。

選 Rust 是因為它很嚴格，其次是我認同它的記憶體管理哲學，最後才是因為它快。

研究競品的過程中我有找到一個 [yarr](https://github.com/nkanaev/yarr)，但它缺乏一些我在 Miniflux 常用的功能，例如全文抓取、保存到 [Linkding](https://linkding.link/) 等，所以最後選擇跳過。

另外 Miniflux 是我唯一還在使用 PostgreSQL 的 app，換掉 Miniflux 之後 PostgreSQL 也可以關掉了，瞬間釋放出大量的記憶體，可以再跑更多 app 了。

在開發 rdrs 的過程中，我也學到了不少 SQLite 本身會遇到的問題，例如 [SQLite 只有允許一個寫入](https://github.com/henry40408/rdrs/pull/52)。如果沒有考慮到，RSS feed 在更新的時候就會卡到使用者的操作，例如標記為已讀，解決方案是將寫入操作分成 user / background，user 優先於 background，RSS feed 的更新可以等，但我是一個沒有耐心的使用者。

中間還有不少最佳化，甚至還有 SSR 跟 CSR 的來回拉扯，現在基本上都是秒開，我現在天天使用。

# AdGuard Home ➡️ [noadd](https://github.com/henry40408/noadd)

真的只是我手癢想換一個 Rust 寫的 ad-blocker 而已，AdGuard Home (AGH) 沒有任何缺點。

在開發 noadd 的過程中，我發現 DNS 本身比「將 domain name 轉譯成 IP address」複雜的多得多，只能說我太天真了。光是牽涉到的 RFC 就有 [1035](https://www.rfc-editor.org/rfc/rfc1035)、[2308](https://www.rfc-editor.org/rfc/rfc2308)、[6891](https://www.rfc-editor.org/rfc/rfc6891)、[6840](https://www.rfc-editor.org/rfc/rfc6840)、[7766](https://www.rfc-editor.org/rfc/rfc7766)、[8484](https://www.rfc-editor.org/rfc/rfc8484) (實作功能本身需要考慮) 跟 [5737](https://www.rfc-editor.org/rfc/rfc5737)、[6761](https://www.rfc-editor.org/rfc/rfc6761)、[2606](https://www.rfc-editor.org/rfc/rfc2606) (測試時涵蓋)，如果沒有 LLM 的協助我一個人根本看不完這麼多 RFC，遑論是做出技術上的取捨。

還有一些日常使用才會發現的小問題：一開始我完全沒有考慮到「[快取毒化](https://github.com/henry40408/noadd/pull/27)」(cache poisoning)，導致我從 AGH 切換到 noadd 之後，我平常在玩的手遊 ([Melvor Idle](https://melvoridle.com) 好玩) 打不開，但其他網頁、app 卻又運作正常，好幾次都讓我想要直接放棄 noadd 回去 AGH，幸好最後都有找到解法。為了在蘋果全家桶上使用，我必須參考 Apple 公開的文件跟 AGH 踩過的坑，中間也吃了不少[苦頭](https://github.com/henry40408/noadd/pull/18)。

然後是驗證。由於這是我自己的 self-hosted app，我不希望世界各地的路人甲都可以來搭便車用我的 DNS，所以一定要加上驗證。但除了 DoH 可以靠 `http://example.com/dns-query/secret` 的方式做驗證，DoT 的驗證機制比較繞 (據我所知要透過 wildcard subdomain，也是 AGH 採用的方式)。即使 DoT 的效能好很多，我還是只能先實作 DoH。幸好 DoH 加上快取之後，也能達到 p50≤1ms 的成績，足以滿足日常使用。

# 題外話

有一次我心血來潮，想說現在都有 LLM 協助了，我想試試看把手上的 Rust app 都改用 musl 編譯。

之前 musl 編譯的體驗真的很差，還遇到 [musl.cc 封鎖 GitHub](https://github.com/orgs/community/discussions/27906#discussioncomment-3332440) (嚴格來說是封鎖微軟的 IP 地址)，然後編譯速度又慢——Rust 已經很慢了改成 musl 又更慢了。

LLM 再次體現它能夠快速、廣泛的搜集大量資訊的優點，它幫我找到了⋯⋯[cargo-zigbuild](https://github.com/rust-cross/cargo-zigbuild)。

zig? 是那個 [Zig](https://ziglang.org/) 嗎？還是 zig-zag 的 zig，取 cross compile 就像繞路一樣的意象？

事實證明，是我想多了，就是那個 Zig。而且這個 zigbuild 還是 [rust-cross](https://github.com/rust-cross) 這個專門做 cross compile 的 org 在維護的工具。

我半信半疑的用了一次，然後就回不去了，它真的能完美的實現 cross compile 到 musl 的工作，現在 [rdrs](https://github.com/henry40408/rdrs/pull/341)、[noadd](https://github.com/henry40408/noadd/pull/119) 都是 musl 的版本，我很滿意。
