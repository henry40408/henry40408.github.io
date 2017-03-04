---
title: ActiveRecord 與列輸出
date: 2016/02/25 01:42:00
slug: activerecord-and-rows
tags: ruby-on-rails activerecord row
layout: post
---

列輸出一直是我在使用 CSS framework 時視而不見的問題。直接看 code 比較快，討論以下三種解決方案。

## 第一種：直接把所有資料丟在同一列裡

在 ERB 的部分什麼事情都不做，然後在撰寫 CSS 時修改樣式解決。

```erb
<div class="container">
    <h3>All data in one row</h3>
    <div class="row">
    <% @dataset.each do |data| %>
        <div class="three columns"><%= data %></div>
    <% end %>
    </div>
</div>
```

其實這麼做也不會有什麼太大的問題，只是每一次自行覆寫 CSS 都要擔心內部樣式被覆寫掉，尤其是當你使用 Twitter Bootstrap 或 Zurb Foundation 時都要擔心受怕，下 `class` name 的時候都要謹慎再謹慎。

## 第二種：使用 `%` 運算子切分每一列

這一種是最直觀的寫法，但由於自己最近剛看完 [Effective Python](http://www.effectivepython.com/)，開始對自己 code 裡 **視覺雜訊** 感到不安。

```erb
<div class="container">
    <h3>Use % operator to separate rows</h3>
    <% @dataset.each_with_index do |data, index| %>
    <% if index % 4 == 0 %>
        <div class="row"><% end %>
        <div class="three columns"><%= "##{index}. #{data}" %></div>
    <% if index % 4 == 3 or index == @dataset.size - 1 %>
    </div>
    <% end %>
    <% end %>
</div>
```

將 code 放大來看，我所謂的視覺雜訊出現在以下這裡行：

```erb
<% if index % 4 == 0 %>
<div class="row">
<% end %>
    <div class="three columns"><%= "##{index}. #{data}" %></div>
<% if index % 4 == 3 or index == @dataset.size - 1 %>
</div>
<% end %>
```

開頭與結尾的 `if` 區塊與運算式把 HTML 標籤的開頭 `<div class="row">` 與結尾 `</div>` 分開夾住，在檢視 code 的時候會有一種標籤被硬生生切開的斷裂感。尤其是受到嚴格 HTML 訓練的工程師， **HTML 標籤必須成對出現** 的規則幾乎已經是不可以妥協的基本要件。

說地白話一點，**第二種作法的 code 會讓網頁工程師強迫症發作**。

只要會讓我邊寫邊抑制腦中既定規則的程式碼，就存在視覺雜訊。

另外是 ``index % 4`` 這樣的運算式出現了一次以上，之後在修改 code 的時候很容易漏掉，尤其是 ``index % 4 == 3`` 等號右邊的餘數常常變成漏網之魚。

**view 盡量不要摻雜邏輯** 的原則是有道理的。 [其一：在 View 裡面實作 LOGIC 是不好的。](http://blog.xdite.net/posts/2011/12/10/how-to-design-helpers-2/)

## 第三種：使用 `each_slice` 切分每一列

第三種是最 Ruby-style 的寫法，在其他的程式語言可能會表達成巢狀迴圈，但 Ruby 的 **Everything in Ruby is an Object** 原則與 block 語法讓 embeded Ruby 即使是內嵌在 HTML 文件時還是可以保持優雅。

[each_slice](http://ruby-doc.org/core-2.3.0/Enumerable.html#method-i-each_slice) 的用途很單純，就是把一個 Enumerable 物件依據傳入的長度切割成幾個比較小的 Enumerable 物件。

```ruby
[1, 2, 3, 4, 5, 6, 7].each_slice(3).each do |slice|
   p slice
end

# [1, 2, 3]
# [4, 5, 6]
# [7]
# => nil
```

這就是我要的，現學現用。

```erb
<div class="container">
    <h3>Use each_slice to separate rows</h3>
    <% @dataset.each_slice(4) do |slice| %>
    <div class="row">
        <% slice.each do |data| %>
        <div class="three columns"><%= data %></div>
        <% end %>
    </div>
    <% end %>
</div>
```

這樣好多了！

## 結語

工程師真的要會下關鍵字。我翻了一個晚上的 Ruby 文件才發現 `each_slice`，以為自己發現新大陸，Google `rails row` 立刻就找到了 [Display 5 records per row?](http://stackoverflow.com/questions/4037668/display-5-records-per-row) 這個問題，才發現功力深厚的 Ruby 工程師早就知道類似的作法了。

在 StackOverflow 的答案中有提供另外一個 [in\_groups\_of](http://api.rubyonrails.org/classes/Array.html#method-i-in_groups_of)，跟 `each_slice` 最大的差別在於 `in_groups_of` 會忽略 `nil`。但由於這個 method 是 `rails` gem 提供的，並不是 pure-Ruby 的解法，因此就不特別提出了。
