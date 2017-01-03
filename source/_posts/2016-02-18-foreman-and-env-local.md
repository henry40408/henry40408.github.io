---
title: foreman 偵測不到 .env.local
date: 2016/02/18 00:00:00
slug: foreman-and-env-local
tags: devops, foreman, env, env.local
layout: article
---

由於我自己會習慣寫一個簡單的 shell script 去啟動 foreman，但最近發現無論怎麼設定 foreman 都不會再去讀取  `.env.local`。GitHub 上有人回報類似的問題  [bkeepers/dotenv#234](https://github.com/bkeepers/dotenv/issues/234)，雖然主旨是 **`heroku local` makes it impossible to override settings from `.env.<environment>`** ，但解法也適用 foreman。

解法不難，以下是原來的啟動語法。

```bash
$ foreman start -f Procfile.dev
```

改成以下的形式，差別在於多了後面的 `-e .env,.env.local`。

```bash
$ foreman start -f Procfile.dev -e .env,.env.local
```
由於我自己 clone 的 [`suspenders`](https://github.com/myceto/suspenders) 也有另外寫一個腳本 `./bin/run` 來執行 foreman，找到解法之後我就立刻更新了。對於已經生成的專案，只要將 `./bin/run` 的內容改成以下內容即可。

```bash
#!/bin/bash
if [ -f .env.local ]; then
  foreman start -f Procfile.dev --env .env,.env.local
else
  foreman start -f Procfile.dev --env .env
fi
```
