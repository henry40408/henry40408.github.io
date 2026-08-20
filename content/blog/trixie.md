+++
title = "升級到 Debian Trixie"
date = "2026-08-10T22:44:06+08:00"
tags = []
+++

最近將 Raspberry Pi 4 升級到 Debian Trixie。

[由於官方不建議原地升級](https://www.raspberrypi.com/documentation/computers/os.html#:~:text=If,Imager%2E)，我掌握這次重新安裝的機會，一口氣完成下列事項：

- 將 Docker daemon 換成 podman
- 建立 Ansible playbook 盡可能達成 re-producible deployment
- 重建 monitoring stack

# 將 Docker daemon 換成 podman

早在 Bookworm 時我就嘗試過 podman 了，當時遇到了防火牆設定的問題。podman 一直在錯誤的 iptables chain 上開放 port，導致容器的 published port 從外部死活無法存取，只能放棄。

到了 Trixie，我賭 podman 應該把 bug 修好了，順便也想試用看看 [quadlet](https://www.redhat.com/en/blog/quadlet-podman)——以類似 systemd 的語法去定義 container 的 manifest，並交由 systemd 去管理生命週期以及 logs。縱使 Hacker News 跟 Reddit 上對 systemd 頗有微詞，這種一體化管理的哲學真的太方便了。

最後很順利的架起來了，防火牆的問題確實修好了，quadlet 的運作也很穩定。

# 建立 Ansible playbook 盡可能達成 re-producible deployment

Bookworm 時我是全手工管理，完全靠記憶去記住我安裝過什麼、設定過什麼、關閉過什麼。

我很久很久以前在工作上使用過 [Chef](https://www.chef.io/)，所以就想利用這次機會將設定的過程整理成 Ansible playbook。相較於 Chef 需要 client agent，我選擇 Ansible，因為它只需要 Python + SSH 就可以運作了。

生活在 LLM 的時代真是太美好了，幾個 prompt 就能寫出品質不錯的 playbook——從探測、設定到驗證的步驟 LLM 都能幫你寫好；雖然過程中還是有一些小瑕疵，第一個版本的效能也不甚理想，多來回幾次就都修好了。搭配 git，現在系統在什麼時間點修改過什麼設定都一目了然，即使遇到下次的大版本升級也可以快速還原。

現在唯一的缺點就是我把 Docker image 的版本也放在 playbook 裡，不像之前升級時只需要編輯 docker-compose.yaml 後重開就好，但凡事總要有個取捨嘛！

# 重建 monitoring stack

我在工作上主要使用 Grafana 全家桶——Grafana、Loki、Prometheus。

雖然 Loki、Prometheus 效能已經算很好了，但對 Pi 來說還是稍嫌吃力，所以我就開始研究是否有其他更輕量的選擇。

一開始注意到的是 [NetData](https://github.com/netdata/netdata)，Reddit 上好像也有很多 homelab 在使用；但稍微深入研究一下之後就發現，它把 logs 鎖在訂閱牆後面。賺錢嘛，不寒磣，但不滿足我的需求只能放棄了。

後來又找到 [VictoriaLogs](https://github.com/VictoriaMetrics/VictoriaLogs)、[VictoriaMetrics](https://github.com/VictoriaMetrics/VictoriaMetrics)，真的是完全沒聽過的產品。產品背後的團隊成員來自烏克蘭，由於 2022 年的劇變， [整家公司現在搬到舊金山落地生根了](https://victoriametrics.com/blog/april-2022-company-status-update/) 。

VictoriaMetrics 是從 [2018 年](https://github.com/VictoriaMetrics/VictoriaMetrics/commit/04553a38601960c9201034d2faf6c18b9550b54a) 開始開發到現在的產品，而 VictoriaLogs 則是 [近期](https://github.com/VictoriaMetrics/VictoriaMetrics/commit/0b5f53fe7be8d2c847010d5ba575bacd5f40c839) 才從 monorepo 獨立出來，比較新一點。Reddit 上對 Victoria 系列的批評主要集中在沒有 high availability (HA) 上，但我也只有一台 Raspberry Pi 而已，不需要 HA，這對我來說不是缺點。

整合進 playbook 之後部署上去，消耗的資源真的非常少。搭配 podman 的 quadlet 直接把 logs 發送到 systemd，VictoriaLogs 只需要從 systemd 將 logs 讀取出來就可以了。VictoriaMetrics 支援 Prometheus pulling 時的格式，所以常見的 exporter e.g. node exporter, blackbox exporter 通通都可以使用。這就讓我動了用 blackbox exporter 取代 [gatus](https://github.com/TwiN/gatus) 的念頭，如此一來就可以少維護一個服務了。

整體運作的非常穩定，VictoriaLogs 查詢的速度也非常快，唯一的缺點就是我要再多學一個 DSL [LogsQL](https://docs.victoriametrics.com/victorialogs/logsql/)，但也不難，整體來說我很滿意。
