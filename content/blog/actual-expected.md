+++
title = "actual...expected"
date = "2026-08-09T03:26:56+08:00"
tags = []
+++

最近發現 actual/expected 的句型在跟 LLM 互動的時候蠻好用的，例如：

```
actual: 密碼修改之後 session 列表不會立刻更新，要按重新整理才會更新
expected: session 列表應該要更新
```

跟我以前開 ticket 的順序不太一樣，以前是先寫 expected 再寫 actual，現在我是先寫 actual 再寫 expected。

原因是 actual 是 **現在、立刻** 觀察到的現象，我可以立刻表達出來，接下來我可以慢慢構思我期望看到的行為是什麼。

現在我跟 LLM 互動基本上都是以這個句式起手，體感上 LLM 定位 bug 的速度跟精準度都有所提升。

有些慣例即使到了 LLM 時代仍然好用 👍
