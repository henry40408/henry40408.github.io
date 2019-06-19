---
title: Drupal 搬遷到 S3 後從 IMCE 再也看不到搬遷前上傳的檔案
date: 2017-06-14
---

> 這一篇適合熟悉 Aamzon Web Services 與 Drupal 的開發者或網站管理員

## 緣起

最近想把手上的 Drupal 網站全部 Dockerize，由於檔案系統屬於 *有狀態* (stateful) 的部分，第一步決定把檔案系統搬遷到 AWS S3 上。搬遷完成後，**發現從 IMCE 的 File Browser 再也看不到搬遷前上傳的檔案**。

<!-- more -->

## 環境

### Amazon Web Services

1. 為網站新增一個 AWS S3 Bucket、AWS Cloudfront Distribution。
2. 為網站新增一個 IAM Role，並設定適當的 IAM Policy 能夠讀寫 S3 Bucket。
3. IAM Role 產生一組 Access Key/Secret Key。

### Drupal

1. 安裝 [S3 File System](https://www.drupal.org/project/s3fs)，輸入 S3 Bucket 的資訊與 Access Key/Secret Key，設定 Drupal 使用 S3 做為檔案系統。**此時已上傳的檔案在資料庫中還是會指向 local 的檔案系統 (e.g. `sites/default/files`)，檔案本體也不會立刻上傳到 S3 上**。
2. 安裝 [S3 File System Migate](https://www.drupal.org/project/s3fs_migrate)，透過 Drupal 的 cron **將檔案正式搬移到 S3 上，檔案搬移之後模組也會去改寫資料庫的紀錄，改指向 S3**。檔案的公開網址預設會使用 S3 的公開網址，但如果有安裝 [CDN](https://www.drupal.org/project/cdn)，且設定 Cloudfront 為網站的 CDN，就會改用 Cloudfront 做為公開網址。

## 問題

檔案搬遷到 S3 後，**從 IMCE 的 File Browser 再也看不到搬遷前上傳的檔案**。

## 診斷

- :white_check_mark: 透過 AWS S3 Console，可以看到檔案本體都已經上傳到 S3 上，隨便下載一個檔案檢查也沒有問題。
- :white_check_mark: 進入資料庫查看，會發現 `file_managed` 的 `uri` 欄位都變成了 `s3://...` 的形式。
- :white_check_mark: 直接在瀏覽器上輸入 Cloudfront 網址，也可以正常存取。
- :white_check_mark: 選擇一個有附加檔案的 Content Type，新增一筆資料，檔案可以正常上傳、瀏覽、下載。
    - 由於有 CDN，所以一樣是透過 Cloudfront 提供的公開網址。
- :x: 問題是，透過 **IMCE 的 File Browser 就是找不到搬遷到 S3 前上傳的檔案**。

## 解決方法

最後在 [Easy Amazon S3 in Drupal with S3FS](http://www.symphonythemes.com/drupal-blog/easy-amazon-s3-drupal-s3fs) 這篇部落格找到我之前一直沒有做的一個步驟，**將 S3 Bucket 公開 (Make Public)**！

![Make S3 Bucket Public](http://www.symphonythemes.com/system/files/images/blog/s3-make-public.jpg)

Photo Credit: [www.symphonythemes.com](http://www.symphonythemes.com/)

在 S3 Bucket Console 點擊 Make Public 之後，**就可以透過 IMCE File Browser 看到搬遷前上傳的檔案了**。

## 推測背後的原因

1. IMCE 透過 [File Stream Wrapper](https://www.drupal.org/docs/7/api/file-api/writing-stream-wrappers) 去轉譯 `s3://` 協定、取得已經上傳到 S3 上的檔案的真實網址。
2. S3 Bucket 的權限預設不是 Public，因此 File Stream Wrapper 拿不到公開網址。
3. File Stream Wrapper 回傳無效的資料給 IMCE，IMCE 直接忽略該檔案，也不會顯示任何錯誤。
