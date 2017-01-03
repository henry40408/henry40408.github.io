---
title: Elixir 雜記
date: 2016-10-17 14:13
slug: elixir-note
tags: elixir, phoenix, ecto, erlang
layout: article
---

> 說文解字：雜記
>
> 就是沒有整理過的筆記，內容沒有結構而混亂，筆者想到什麼就寫什麼。
>
> 例句：這一篇文章是一篇雜記。

## 前言

* Elixir 少說也研究了一個月，個人對於該語言揉合了 Ruby 與 erlang 的特性格外著迷。
* Elixir 實務上是一種執行在 erlang VM 上的語言，而且已經完成了程式語言的 <u>自舉</u> (bootstrap)。
    * 以 Elixir 為例，所謂的自舉就是 Elixir 編譯器的絕大部分模組都已經可以使用純 Elixir 實作，只留下極少部分不得不使用 erlang 的部分，才會借助 erlang 完成。
    * 程式語言完成自舉有什麼好處？
        * 一是如果一項程式語言完成了自舉，那麼該語言的開發者相對來說就比較不需要擔心如果一開始實作該編譯器的語言有任何劇烈變動，會連帶影響到自己的專案。[ref.](http://programmers.stackexchange.com/a/306420)
        * 二是自舉算是一項挑戰。如果一種語言可以完成自舉，代表這種語言在一定的程度上已經足以完成複雜的工作。[ref.](http://programmers.stackexchange.com/a/306421)

## 名詞解釋

### erlang

> Erlang is a programming language used to build massively scalable soft real-time systems with requirements on high availability. Some of its uses are in telecoms, banking, e-commerce, computer telephony and instant messaging. **Erlang's runtime system has built-in support for concurrency, distribution and fault tolerance**. [ref.](http://www.erlang.org/)

### OTP

> **OTP (a.k.a. Open Telecom Platform) is set of Erlang libraries and design principles providing middle-ware to develop these systems**. It includes its own distributed database, applications to interface towards other languages, debugging and release handling tools. [ref.](https://github.com/erlang/otp)

### erlang VM / BEAM

* The Erlang runtime environment (a virtual machine, much like the Java virtual machine) means that code compiled on one architecture runs anywhere. **The runtime system also allows code in a running system to be updated without interrupting the program**.
* erlang 曾經有嘗試要編譯成 C 語言執行，現階段的做法是編譯成 byte code 在 erlang VM 上執行。
* <u>Bogdan's Erlang Abstract Machine</u> (a.k.a. BEAM) 是其中一種 erlang VM，現階段在 PC 上執行的 erlang VM 基本上都是 BEAM。

## 學習前準備

### 必讀文章

[So You Want to be a Functional Programmer](https://goo.gl/DBEM3T) 共六個 part，適合已經在 OOP 世界浸淫已久的工程師閱讀。

### 忘記 OOP，徹底

學習經驗如果你曾經寫過 OOP，**沒有任何妥協的空間，一定要把它全部忘光**。請看看以下程式碼：

```elixir
Foo.bar("baz")
```

如果沒有把 OOP 忘記，第一眼你會把上面這個函數呼叫解釋成呼叫 `Foo` object 或 `Foo` class 的 `bar` method。**但在 Elixir 的世界裡沒有 class 或 object**，以上這行程式如果以 OOP 的概念解釋一定錯。所以如果沒有把 OOP 的概念徹底忘記，很多 Elixir 的概念就很難內化，學起來就會很痛苦。

### 忘記迴圈

在 Elixir 你不必再煩惱到底是要用 `for`、`while` 還是 `do...while` 來寫迴圈，**因為它們在 Elixir 的世界裡也都不存在**。要完成重複性的邏輯操作，你只剩下遞迴 (recursion) 可以用。

> 想要學會遞迴，你必須先學會遞迴。

這一句話很難理解嗎？天天看它，某天靈光乍現的時候你就學會遞迴了。

## 開始學習

* [Learn elixir in Y minutes](https://learnxinyminutes.com/docs/elixir/) 單純想看看 Elixir 語法長什麼樣子，或是忌諱一開始就花太多時間學習一門新語言可以先從這裡開始。
* [Getting started](http://elixir-lang.org/getting-started/introduction.html) 官方文件永遠是最好的起點。
* [Elixir School](https://elixirschool.com/) Elixir 社群維護的學習文件。
* [30 Days of Elixir](https://github.com/seven1m/30-days-of-elixir) 我知道有些人很討厭 N 天學會 X 這種聳動的殺人標題，但單純看看無妨吧？

## 資源

* [awesome-elixir](https://github.com/h4cc/awesome-elixir) 偶爾可以來這裡挖寶。
* [Elixir on Slack](https://elixir-slackin.herokuapp.com/) Elixir 官方的 Slack 社群，非常活躍。
* [Elixir playground](http://play.elixirbyexample.com/) 在瀏覽器玩玩 Elixir。

## 為什麼要學 Elixir？

會想學習 Elixir 的人不外乎以下幾種。

### 第一種：終極目標在精通 erlang

[TL; DR - Start with Elixir](http://stackoverflow.com/a/37966947)

erlang 是非常純粹的 functional programming language，但就是因為太純粹了，寫起來非常地違背人類的直覺，**從 Elixir 下手，慢慢地熟悉 functional programming 的概念之後，再轉換跑道到 erlang 更容易上手**。

> 但話說回來，如果目標擺在要精通 erlang，為什麼不要像忘記 OOP 一樣，要求自己一定要去熟悉 erlang 的語法呢？老實說，這並無不可；但單就我個人來說，程式語言語法從視覺所造成的錯離感 (e.g. 一直看到像外星語法一樣的 erlang，每次要修改程式的時候都不知道要從何下手) 所帶來的挫折，比起捨棄抽象的概念 (e.g. 徹底忘記 OOP) 來得更加強烈。
>
> 尤其是當你 OOP 也沒有學得很好的時候 XD

### 第二種：單純想學習另外一種 functional programming language 的人

如果你已經接觸過 haskell 了，**我會建議你直上 erlang，跳過 Elixir**。因為 Elixir 加入了太多非 functional programming language 的要素，這時學習 Elixir 老實說就不會有什麼太實質的幫助。Elixir 之所以會加入這些非 functional programming 的要素，其目的只是想讓 Elixir 的語法架構更接近 OOP language，讓新手上入不會這麼痛苦而已。

**但該拿掉的一定拿掉、不該存在的它也不會存在**，因此你不會在 Elixir 裡看到 class 或是 object。

### 第三種：之前寫過 Ruby，想要找一門 functional programming language 學習的人

**這種人對於 Elixir 來說簡直是 perfect match**。

為什麼？Elixir 的語法跟 Ruby 長得根本快一模一樣。事實上，之所以會選擇 Elixir，其中一個很大的原因，就是我自己在學習 Elixir 之前剛好已經寫過了好一陣子的 Ruby，而且只寫 Ruby。因為已經非常熟悉了 Ruby 的語法架構，在掌握 Elixir 的「語感」時有很大的幫助。

**但千萬不要把 Elixir 當成 Ruby 來學**，兩者還是截然不同的語言，只是長得九分像而已。

## 我可以拿 Elixir 來做什麼？

**拿 [Phoenix framework](http://www.phoenixframework.org/) 來寫 web application**，目前想到的、玩過的只有這個。尋找 Elixir 的應用情境時，不妨把它當作 erlang 去想，只要是 **高併發、需要平行運算、講求執行效率** 的情境都是 Elixir 可以發揮的場合。

至於 erlang 與 Elixir 效能上的差異，由於還沒有遇到足以看出差異的大規模併發，所以我無法下結論。

## Elixir 的社群發展？

由於時差的關係，我加入 Elixir Slack 之後，到了晚上我還必須手動把通知關掉，否則沒辦法睡覺，**由此可見歪國人討論之熱烈**，社群的活躍度基本上沒有問題。

另外，一種語言能否成功，一項很重要的關鍵在各地的貢獻者，能否很順利地將自己寫的模組快速地貢獻出來。**原來在 erlang 就有一套套件發佈平台 [Hex](https://hex.pm/)**，Elixir 既然相容於 erlang VM，就直接沿用下去了。但也必須承認，如果與 Ruby 相比，Elixir 的套件數量的確望塵莫及。**不過除了 Hex 上該有的都有了，再加上原本 OTP 就提供了不少的 library 跟 middleware，基本上也足以應付日常開發了**。

## Elixir 文章

* [Iterating in Elixir](https://medium.com/@lasseebert/iterating-in-elixir-90fdc0005dfc) 還以為這篇文章單純在講 Elixir 的迭代，內文也以兩個例子闡述如果把 Elixir 的經驗拿到 Ruby 實作對於程式的架構有什麼好處。簡而言之，**就是無論以什麼程式語言開發，心中都要常存 immutablility**。
* [Elixir and IO Lists, Part 1: Building Output Efficiently](https://www.bignerdranch.com/blog/elixir-and-io-lists-part-1-building-output-efficiently/) 這篇我個人覺得非常地走火入魔 XD 從 `IO.puts` 開始檢討一般程式語言常用的 string concatenation 在記憶體的效能與 GC 的分配上有什麼樣的影響，最後以檔案操作為例，建議開發者盡量使用 List 來傳遞 IO 操作時所需要的參數。
* [Developing Elm using Gulp with Elixir / Phoenix](Developing Elm using Gulp with Elixir / Phoenix) 在 Elixir 裡使用 Elm。不過也不用這麼麻煩啦，Hex 上有一個 [eml](https://github.com/zambal/eml)，雖然是 Elixir 的實作，寫起來跟 Elm 非常像，喜歡 Elm 的開發者可以參考看看。
* [k-tsj/pattern-match](https://github.com/k-tsj/pattern-match) 以 Ruby 實作的 pattern matching。是說 Ruby 開發者也不會這麼開發就是了⋯⋯
* [Composable Queries with Ecto](https://blog.drewolson.org/composable-queries-ecto/) 以類似 ActiveRecord 的方式組合資料庫查詢。
* [Understanding Elixir macros](http://thepugautomatic.com/2015/10/understanding-elixir-macros/) Elixir 絕大多數的實作，都透過 macro 完成，由此可見 macro 在 Elixir 中位處非常基礎卻十分強大的地位。但就像蜘蛛人一樣，能力愈大、責任愈大，如何在不惡搞到自己的情況下，順利地使用 macro 將 Elixir 擴充成自己想要的樣子，就是一個很值得研究並一再研究下去的課題了。

## Elixir 小撇步

* 取得現在時間 (使用 `Ecto`)
  1. UTC `Ecto.DateTime.utc`
  2. 本地時間 `Ecto.DateTime.from_erl(:erlang.localtime)` 似乎由於這個方法的存在，Elixir 也懶得去擴充另外一支 function 來做同樣的事⋯⋯

## 在 Phoenix 實作 soft delete

### 事前假設

1. application name = `TodoApp`
2. table name = `todos`
3. model name = `Todo`

### 步驟

新增 schema

```bash
$ mix ecto.gen.migration add_soft_delete_to_todos
```

修改剛剛新增的 schema

```elixir
# priv/repo/migrations/XXXXXXXXXXXXXX_add_soft_deletable_to_todos.exs
defmodule TodoApp.Repo.Migrations.AddSoftDeletableToTodos do
  use Ecto.Migration

  def change do
    # ======
    alter table(:todos) do
      add :deleted, :boolean, default: false # 是否已被刪除
      add :deleted_at, :datetime # 什麼時候刪除的
    end
    # ======
  end
end
```

修改 `Todo` model

```elixir
defmodule TodoApp.Todo do
  use TodoApp.Web, :model

  schema "todos" do
    # ...
    # ======
    field :deleted, :boolean, default: false # 新增是否已經被刪除了的欄位
    field :deleted_at, Ecto.DateTime # 新增什麼時候刪除的欄位
    # ======

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    # ...
  end

  # ======
  # 用來篩選尚未被刪除的記錄
  def undeleted(query) do
    from t in query, where: t.deleted == false
  end

  # 用來實際執行 soft delete 的函數
  def soft_delete(struct) do
    payload = %{deleted: true, deleted_at: Ecto.DateTime.from_erl(:erlang.localtime)}
    struct |> cast(payload, [:deleted, :deleted_at])
  end
  # ======
end
```

修改 `TodoController`

```elixir
defmodule TodoApp.TodoController do
  # ...

  def index(conn, _params) do
    # ======
    # 改用 Todo.undeleted 取得列表
    todos = Todo |> Todo.undeleted |> Repo.all
    # ======
    render(conn, "index.json", todos: todos)
  end
     
  # ...
  def show(conn, %{"id" => id}) do
    # ======
    # 改用 get_by! 同時篩選是否已刪除的欄位
    todo = Repo.get_by!(Todo, id: id, deleted: false)
    # ======
    render(conn, "show.json", todo: todo)
  end

  # ...

  def delete(conn, %{"id" => id}) do
    todo = Repo.get!(Todo, id)

    # Here we use delete! (with a bang) because we expect
    # it to always work (and if it does not, it will raise).
    # ======
    #Repo.delete!(todo) # 不用原來的 Repo.delete 函數

    # 改用 Todo.soft_delete 配合 Repo.update!
    changeset = todo |> Todo.soft_delete
    Repo.update!(changeset)
    # ======

    send_resp(conn, :no_content, "")
  end
end
```

修改 `TodoController` 的 test

```elixir
defmodule TodoApp.TodoControllerTest do
  # ...

  test "deletes chosen resource", %{conn: conn} do
    todo = Repo.insert! %Todo{}
    conn = delete conn, todo_path(conn, :delete, todo)
    assert response(conn, 204)
    # ======
    assert Repo.get_by(Todo, id: todo.id, deleted: true) # 改偵測記錄是否被標記已刪除
    # ======
  end
end
```


## ElixirConf 2016 - Leveling Up with Ecto

* 難度：入門 → 進階
* Ecto 主要由四大元件組成：`Repo`、`Query`、`Schema`、`Changeset`
* `Ecto.Repo` 是 Ecto 裡**唯一一個 (one and only) 與資料源 (data source) 直接溝通**的元件。
    * 這裡定義的資料源 (data source) 包括傳統的 RDBMS、NoSQL databases、key-value store...等。
    * 講者再三強調 **Ecto 的資料源不限定 RDBMS**，也可以與其他資料源串接。
    * 但我個人認為很快 Ecto 就會踏上 ActiveRecord 的後塵，變成 Ecto 專注處理資料庫，其他資料源則由其他專用的 adapter 處理⋯⋯
* **一個 Repo 對應一個資料源**，所以如果一個專案之前有 legacy database，但又必須與現在的資料庫並存，開發者可為這兩個資料庫設定各自的 Repo。拜 Repo 的設計所賜，**即使是兩個使用不同 adapter的資料源也可以並存** (例如 PostgreSQL 與 MySQL 並存)。
* 如果要在 `Ecto.Query` 中**使用變數**，**必須使用 `^` (pin operator) 把變數 pin 住**，否則 `Ecto.Query` 會主動報錯並提醒開發者。
    * [The pin operator](http://elixir-lang.org/getting-started/pattern-matching.html#the-pin-operator) in Elixir Getting Started
* **永遠要告訴 `Ecto.Query` 你要 `select` 什麼** (e.g. 整筆資料？某幾個欄位？)。
* 對 `Repo.*all` (e.g. `Repo.insert_all`、`Repo.update_all`、`Repo.delete_all`) 有很大的自由，但要注意幾件事：
    1. 永遠要告訴 `Ecto.Query` 你要 `select` 什麼？
    2. 必須注意資料類型的問題。
       * 如果沒有使用 Schema 的話，我猜講者在這裡提出這件事只是要帶出使用 Schema 的好處。
* `Ecto.Schema` 用來定義記錄被取出資料源之後要長什麼樣子、以及記錄要被灌入資料源之前要長什麼樣子。
    * 尤其是定義資料型態這件事，如果沒有 Schema，開發者必須在下 Query 時明確地告知 Ecto 每個欄位的類型，並在有可能類型通用時轉型。例如全部都是數字的行動電話號碼，如果 Ecto 自動轉型就會讓最前面的 0 跑掉，原來的 0912345678 變成 912345678，如果之後又以這筆記錄寫入資料庫就會是錯誤的結果
    * Schema 對需要 association 的專案來說也更加方便。
* 在 Ecto 進行關聯查詢時，你必須要明確地 (explicitly) 告訴 Ecto 什麼時候要載入關聯性資料表的記錄。
    * 使用 [`preload`](https://hexdocs.pm/ecto/Ecto.Query.html#preload/3) keyword。
    * 如果 Ecto 自作主張地預先載入關聯性資料庫的記錄，除了 [N+1 queries](https://ihower.tw/rails/performance.html#sec0) 的問題，甚至可能塞爆記憶體。
    * 否則你就會遇到 `Ecto.Association.NotLoaded` 的錯誤。
* `Ecto.Schema` 可以不需要與任何資料源關聯而獨自運作，也就是 virtual schema，這也是為什麼 Ecto 可以串接不同的資料源的原因。
