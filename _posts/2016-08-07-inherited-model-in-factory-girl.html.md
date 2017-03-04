---
title: 如何在 factory_girl 中為有繼承關係的 Rails model 定義 Factory
date: 2016-08-07 20:34
slug: inherited-model-in-factory-girl
tags: ruby-on-rails activerecord factory_girl
layout: post
---

## 問題

例如以下 Ruby on Rails 程式碼。

```ruby
class Member < ActiveRecord::Base
  # has a string column named `email`
end

class Admin < Member
  # ...
end
```

`Member` 與 `Admin` 兩個 Rails model 之間有繼承關係，那它們的 `factory_girl` Factory 要怎麼寫呢？

## 解答

```ruby
FactoryGirl.define do
  factory :member do # Member model 的 factory
    email { Faker::Internet.email }
  end

  factory :admin, class: Owner, parent: :member
end
```

如果照著以上 code 定義 factory，則 `Owner` 的 factory 會繼承 `Member` factory 定義的所有欄位 (例如 `email`)。

參考資料：[how to define factories with a inheritance user model](http://stackoverflow.com/q/13343876)
