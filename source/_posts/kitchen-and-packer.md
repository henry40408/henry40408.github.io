---
title: "Kitchen 與 Packer 實戰"
date: 2016-09-01 11:28
categories: ['DevOps']
---

## 目標

> 讓 DevOps 可以在一鍵部署 **準上線狀態** 的 AMI。

所謂的準上線狀態，是這個 AMI 已經包含了...

1. 最新版的 Ruby on Rails 程式碼。
2. 連線到 `consul` 的連線參數。

當 AMI 啟動的瞬間，產生的 EC2 instance 會連線到 `consul`，取得其他更敏感的系統參數。然後使用 `consul-template` 工具將系統參數注入到 Ruby on Rails 可以取得的位置，以 Sudo 主站為例，延續 `capistrano` 配合 `figaro` 的慣例，這個位置在 `config/application.yml`。

<!-- more -->

## 流程

1. 某人在 GitHub merge 了一個 PR 到 master branch。
2. CircleCI 收到來自 GitHub 的 webhook request，開始執行測試。
3. CircleCI 啟動 Packer 包裝 AMI (Amazon Managed Image)。

## 什麼是 provision？

以往我們在部署應用程式時，必須先架設環境。**架設環境的這個過程，就稱為 provision**。雲端時代，由於 load balancer 的出現，開始需要大量、重複地 provision 機器。既然 provision 的過程重複性這麼高，腦筋動得快的工程師就乾脆針對 provision 製作一系列工具，讓整體流程不但可以自動化、複製，也可以降低人為錯誤。**而這個自動化後的 provision 流程與工具，統稱為 [Configuration management](https://www.wikiwand.com/en/Configuration_management)**。目前 CM 在市面上的佼佼者有 [Chef](https://www.chef.io/chef/)、[Ansible](https://www.ansible.com/)、[Puppet](https://puppet.com/) 與 [SaltStack](https://saltstack.com/)。

## 實作

### 使用 [Kitchen](http://kitchen.ci/) 撰寫 [Chef](https://www.chef.io/) cookbook

Packer 支援 Chef 系列的工具 `chef-solo` 與 `chef-zero` 來建置環境，我自己選擇的是不需要另外架設 Chef server 的 `chef-solo`。`chef-solo` 的缺點在於需要在要 provision 的機器 (或稱為 target machine) 上安裝完整的 Chef toolkit、provision 的效率受限於 target machine 的規格，但優點則是不需要有 Chef server。`chef-zero` 的優點是 provision 的流程都在記憶體完成 (in-memory)，執行的速度非常快，但缺點在於還是需要有 Chef server。

Kitchen 是 Chef 的測試框架。透過 Kitchen，你可以在自己的電腦上建置 Vagrant、Docker 或 EC2 instance 來測試自己寫的 Chef cookbook 有沒有問題。Kitchen 官網的文件寫得非常之爛，因此我推薦以下這幾篇文章，雖然各自側重 Kitchen 的不同功能，解釋地卻非常詳細。

* [Integration Testing for Chef-Driven Infrastructure with Test Kitchen](https://semaphoreci.com/community/tutorials/integration-testing-for-chef-driven-infrastructure-with-test-kitchen)
* [Automating Cookbook Testing with Test-Kitchen, Berkshelf, Vagrant and Guard](https://micgo.net/automating-cookbook-testing-with-test-kitchen-berkshelf-vagrant-and-guard/)

[Berkshelf](http://berkshelf.com/) 是 Chef 用來管理第三方 cookbook 的工具。Chef 身為 Ruby 生態系的一員，自然也不希望開發者自幹輪子。[Chef Supermarket](https://supermarket.chef.io/) 是 Chef 的第三方倉庫，裡面該有的 cookbook 都有了。

### 再寫 Packer 設定檔 `packer.json`

此時還沒有整合 CI，只是先在 AWS 上製作一次，看看 Chef 建置出來的環境有沒有問題。當初在建置 AMI 的時候我很擔心成本會因此暴增，但事實上 AWS 對於 AMI 的收費標準比照 S3，以使用的空間計費，所以整個流程成本最巨的資源還是 EC2 instance。為了節省成本，我自己在實際測試 Packer 時盡可能地使用 `m4.large` 的 [Spot instance](https://www.packer.io/docs/builders/amazon-ebs.html#spot_price)，既可以加快 `chef-solo` 的執行速度，也可以有效節省成本。

### 再寫 CircleCI 設定檔 `circle.yml`

這一步是最困難的，其一即使在自己的電腦上測試沒有問題，到了 CircleCI 端還是有可能會出狀況；其二是參數要以環境變數的方式傳給 Packer，以確保安全性，但事情並沒有想像中的那麼簡單。

#### 先透過環境變數傳遞檔案內容給 Packer 再傳遞給 Chef 時的陷阱

基於安全性上的考量，Sudo 主站使用 private repository。也就是說如果沒有認證，target machine 將無法存取 repository。我目前想到的只有**先在 target machine 塞 SSH key，然後在 `git clone` 時使用這支 SSH key** 這個方法。

我們先來看看一支 SSH key：

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAx28Bk/c7u5/rc8h4FHFQm+fm/nsKQZ4qrGbTbKs1sdwtcCOg
NHvX7L4PIwp6A81WYYRB3sclQZv2wurMfBfnS9pX0+NLyQlJBc6dBZsPkvm1AzrO
Va3/XtuPhsJuCEdJdlsQvldqy8AF8u8YVr0EnwDxADFUGIQ9B35QV4lNnEHYoQ/2
...
KotzLQKBgQC7eDFYoBdPioMKndqp6X2dQZYhuJ0E+iXUppbxv3kPm0ut9OKzINFs
d6epzpEtHkfDZebuc6mWrW/s6uzx7qRKqXuLAMQRJ6eVdVxsg/sWGteO7kzyOp5L
w2B3v90VaF+cY0OibW5nFV2du04vmS1k74Lf9Mqkht0hdaxjNyoHvw==
-----END RSA PRIVATE KEY-----
```
相信我，既然會公佈出來，我就不會再把它使用在其他地方。

對 SSH key 的私鑰來說，**每一行結尾的換行符號是有其意義，不可省略**。你可以試著產生一支 SSH key，然後把 private key 的換行全部刪掉，讓整個檔案變成一行：

```
-----BEGIN RSA PRIVATE KEY-----MIIEpAIBAAKCAQEAx28Bk/c7u5/rc8h4FHFQm+fm/nsKQZ4qrGbTbKs1sdwtcCOgNHvX7L4PIwp6A81WYYRB3sclQZv2wurMfBfnS9pX0+NLyQlJBc6dBZsPkvm1AzrOVa3/XtuPhsJuCEdJdlsQvldqy8AF8u8YVr0EnwDxADFUGIQ9B35QV4lNnEHYoQ/2...KotzLQKBgQC7eDFYoBdPioMKndqp6X2dQZYhuJ0E+iXUppbxv3kPm0ut9OKzINFsd6epzpEtHkfDZebuc6mWrW/s6uzx7qRKqXuLAMQRJ6eVdVxsg/sWGteO7kzyOp5Lw2B3v90VaF+cY0OibW5nFV2du04vmS1k74Lf9Mqkht0hdaxjNyoHvw==-----END RSA PRIVATE KEY-----
```

**這支私鑰會就此報廢**。所以如果要在 Packer 裡塞入 SSH key，處理換行符號就不可避免。

而在 CI，我們通常會使用環境變數的方式注入敏感資料。在我們自己的機器上測試時，我們可以這麼做：

```bash
# 將換行的位置換成 \n
$ export SSH_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAx28Bk/c7u5/rc8h4FHFQm+fm/nsKQZ4qrGbTbKs1sdwtcCOg\nNHvX7L4PIwp6A81WYYRB3sclQZv2wurMfBfnS9pX0+NLyQlJBc6dBZsPkvm1AzrO\nVa3/XtuPhsJuCEdJdlsQvldqy8AF8u8YVr0EnwDxADFUGIQ9B35QV4lNnEHYoQ/2\n...\nKotzLQKBgQC7eDFYoBdPioMKndqp6X2dQZYhuJ0E+iXUppbxv3kPm0ut9OKzINFs\nd6epzpEtHkfDZebuc6mWrW/s6uzx7qRKqXuLAMQRJ6eVdVxsg/sWGteO7kzyOp5L\nw2B3v90VaF+cY0OibW5nFV2du04vmS1k74Lf9Mqkht0hdaxjNyoHvw==\n-----END RSA PRIVATE KEY-----"
```

```bash
# bash 會正確解析
$ echo $SSH_KEY
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAx28Bk/c7u5/rc8h4FHFQm+fm/nsKQZ4qrGbTbKs1sdwtcCOg
NHvX7L4PIwp6A81WYYRB3sclQZv2wurMfBfnS9pX0+NLyQlJBc6dBZsPkvm1AzrO
Va3/XtuPhsJuCEdJdlsQvldqy8AF8u8YVr0EnwDxADFUGIQ9B35QV4lNnEHYoQ/2
...
KotzLQKBgQC7eDFYoBdPioMKndqp6X2dQZYhuJ0E+iXUppbxv3kPm0ut9OKzINFs
d6epzpEtHkfDZebuc6mWrW/s6uzx7qRKqXuLAMQRJ6eVdVxsg/sWGteO7kzyOp5L
w2B3v90VaF+cY0OibW5nFV2du04vmS1k74Lf9Mqkht0hdaxjNyoHvw==
-----END RSA PRIVATE KEY-----
```

好 der，我們接下來就把這個環境變數透過 Packer 打進 Chef 吧！

```json
// packer.json
{
  "builders": [
    // ...
  ],
  "provisioners": [{
    "type": "amazon-ebs",
    // ...
    "json": {
      "ssh_key": "{{ user `ssh_key` }}"
    }
  }]
}
```

```ruby
# cookbook.rb

# ...

directory "/home/saitama/.ssh" do
  group "saitama"
  mode "0755"
  owner "saitama"
end

# ...

file "/home/saitama/.ssh/id_rsa" do
  content node["ssh_key"]
  group "saitama"
  mode "0600"
  owner "saitama"
end

# ...

git "/home/saitama/secret_project" do
  repository "git@github.com:evil_corp/secret_project.git"
  action :sync
end
```

然後使用 command line 把 SSH key 打進去。

```bash
$ packer build -env ssh_key=$SSH_KEY packer.json
```

然後你就會得到錯誤，會在 git 那一步出錯 `Permission denied (publickey)`。

如果你啟用 `debug` 模式，在錯誤出現之後立刻登入 target machine，你會發現 SSH key 變成一個很噁心的樣子。

```bash
saitama@target_machine $ cat /home/saitama/.ssh/id_rsa
-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAx28Bk/c7u5/rc8h4FHFQm+fm/nsKQZ4qrGbTbKs1sdwtcCOg\nNHvX7L4PIwp6A81WYYRB3sclQZv2wurMfBfnS9pX0+NLyQlJBc6dBZsPkvm1AzrO\nVa3/XtuPhsJuCEdJdlsQvldqy8AF8u8YVr0EnwDxADFUGIQ9B35QV4lNnEHYoQ/2\n...\nKotzLQKBgQC7eDFYoBdPioMKndqp6X2dQZYhuJ0E+iXUppbxv3kPm0ut9OKzINFs\nd6epzpEtHkfDZebuc6mWrW/s6uzx7qRKqXuLAMQRJ6eVdVxsg/sWGteO7kzyOp5L\nw2B3v90VaF+cY0OibW5nFV2du04vmS1k74Lf9Mqkht0hdaxjNyoHvw==\n-----END RSA PRIVATE KEY-----
```

根本沒有解析換行符號，**直接原封不動地寫入檔案了**。這個問題卡掉了我一整天的工時。

我目前想到的解法是手動將 `\n` 換掉，只針對 `id_rsa` 這個檔案。

```ruby
# cookbook.rb

# ...

file "/home/saitama/.ssh/id_rsa" do
  content node["ssh_key"].gsub("\\n", "\n") # 關鍵一行
  group "saitama"
  mode "0600"
  owner "saitama"
end

# ...
```

目前的情形是完美解決了這個問題。但是不是一個完美的解法，我無法確定。

## 成果 [sudo-recruit/pizza](https://github.com/sudo-recruit/pizza)

我盡可能地把文件寫完整，希望大家可以透過這個專案稍稍理解 Chef + Kitchen + Packer 之間的協作方式。如有缺漏之處歡迎大家 PR。
