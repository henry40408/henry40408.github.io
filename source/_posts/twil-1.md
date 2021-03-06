---
title: "TWIL #1"
date: 2016-10-21
categories: ['每週分享']
---

## 前言

> TWIL (abbr.) = This Week I Learned
>
> 這個星期我學會了什麼。
>
> 例句：從這個星期開始，我會每個禮拜整理一次 TWIL。

由於之前生活比較混亂，導致應該每個星期都要整理這個禮拜我學了什麼的習慣就這麼中斷了。為了在往後幾年讓自己有辦法回顧自己這幾年學會了什麼、不枉此生，開始養成固定寫 TWIL 的習慣。

<!-- more -->

# 2016/10/17 - 2016/10/21

## 瑣事

* 看 [emacs-tw/emacs-101](https://github.com/emacs-tw/emacs-101) 學 Emacs。
* 使用 [`redux-saga`](https://github.com/yelouafi/redux-saga) 完成對 new-hampshire 前端的重構 [PR](https://github.com/henry40408/singleton/pull/6)
* [redux-observable/redux-observable](https://github.com/redux-observable/redux-observable) 10/17 參加 Elixir Taiwan 聚會時與會者推薦的一個 redux 套件。據該與會者所言，他完全看不懂 `redux-saga` 到底想幹嘛 XD
    * 由於專案不大，`redux-saga` 與 `redux-observable` 之間的轉換我是直接把 code 全部打掉重練，需要維護超大型 redux 專案的好孩子不要學喔～
    * 個人認為 `redux-observable` 的強項在於架構上的簡潔。 [PR](https://github.com/henry40408/singleton/pull/7)
    * 拜 Rx 所賜，`redux-generator` 不需要 generator 就可以做到很複雜的操作，這同時也代表寫 `redux-observable` 不需要再處理一堆亂七八糟的 `babel-preset-stage-*`，只要最基本的 babel 就可以開始寫程式了。(除非你需要一些特殊功能，例如 class properties)
* vim 的 [surround.vim](http://vimawesome.com/plugin/surround-vim) 真的是很強大的 plugin，尤其在處理類 HTML (例如 JSX) 的文件時，以前要按好幾個按鍵的工作現在只要一個指令就可以完成，省下非常多的時間。
* 原來想寫一個以 GitHub Issue 為發文後台的部落格系統，卻發現已經有人寫出來了。[ref.](https://github.com/mateogianolio/issuance)
* 之前會想換到 emacs，是聽說 emacs 在程式語言的處理與呈現上比 vim 強上好幾倍 (這不是我講的不要攻擊我 QQ)。但在這一個禮拜快要結束時，我反思是不是我還沒有把 vim 的潛能發揮到極致？於是我找到了這位仁兄的 [dotfile repo](https://github.com/skwp/dotfiles/tree/master/vim)，裡面塞滿了五花八門、亂七八糟 (單純讚美、沒有別的意思) 的 vim 套件。我從中抽出幾個看起來我應該會用到的套件，整理成我自己的 [vimrc](https://gist.github.com/henry40408/2a259f4d6aedfe1997ab#file-vimrc)。整理完之後 vim 看起來好像有變強一點點、變得好用一點點。
    * 但基於工程師不能停止學習的精神，我還是會每天固定抽一點時間出來摸摸 emacs。就像學 erlang 時一樣，摸久了總有一天會想通的。
    * 我的 vimrc 有用到 [dein](https://github.com/Shougo/dein.vim)，號稱 *plugin manager with dark power*，使用 vim 8 加入的 asynchronous API 來管理 plugin，也因此最低版本要求 vim 8。

## `redux-observable` 的錯誤處理

使用 `redux-observable` 時，由於 stream 所接收的是 Redux 的 `action`，所以如果在 operator 裡發生錯誤，整個 stream 就會崩潰，並且不再回應下一次的 `action`。

以河流為例，如果把河流截斷，之後從上游來的水就不會再流到下游去了，其實很合理。但有沒有辦法讓我們要怎麼攔截到 exception 之後讓 stream 繼續處理下一次 `action` 呢？

使用 `catch` operator。

```javascript
const someEpic = action$ => action$
  .ofType(SOME_ACTION)
  .flatMap(() => {
    const rand = Math.random();
    if (rand < 0.5) {
      throw Error('Bad luck');
    }
    return Observable.just('Good luck');
  })
  .map(someOtherAction)
  .catch((e, stream) => {
    console.log(e); // ...或串接錯誤回報服務、進行其他攔截處理
    return stream; // 最重要的一句，維持 stream 不中斷，讓 stream 可以捕捉下一次的 action
  });
```

## 在 Phoenix controller test 進行與 session 有關的測試

### 前言

在 Ruby on Rails，拜 [devise](https://github.com/plataformatec/devise) (其實是 warden) 所賜，我們可以很方便地在 controller test 中加入與 session 有關的程式碼[^1]，讓自己可以在匿名使用者、一般使用者與特殊使用者的身份之間彼此切換。最近在研究 Phoenix 時，我就不禁在想 Phoenix 有沒有辦法做到類似的事？

> 豆知識
>
> 強推 Elixir 的 [Plataformatec](http://plataformatec.com.br/)，同時也是 devise 套件的主要維護組織；同樣是以 Ruby on Rails 為本，將觸角往 Phoenix 延伸的還有另外一家公司 [thoughtbot](https://thoughtbot.com/) (因為它的 logo 我都戲稱它為機器人公司)，旗下與 Elixir 有關的套件包括 `factory_girl` 的 Elixir 版本 [`ex_machina`](https://github.com/thoughtbot/ex_machina)。所以 Elixir 接近 Ruby 的語法結構，有助於 Ruby 開發者快速地轉移過去並上手的論調並非沒有根據。

但 Phoenix 畢竟不是 Ruby on Rails，其一是如果去拜 google 大神，不管你下什麼樣的關鍵字，相關的文章幾乎還沒問世；其二是 Phoenix 似乎對 mocking 這件事情十分感冒，即使是為了測試[^2]。

於是我就退一步想，如果在 Phoenix 不能做模擬 session 這件事，或是 Phoenix 基本上禁止開發者做這件事[^3]，那我還有其他做法嗎？

有，那就是 `Plug.Conn.assign`。

### 做法

假設在 application = `TodoApp` 底下有一個 controller = `TodoController`，有個相對應的測試 `TodoApp.TodoControllerTest`。這一段 code 是直接使用 generator (`mix phoenix.gen.json Todo todos title:string done:boolean`) 產生的，還沒有修改過，裡面會有以下這一段 `setup` 與 `index` action 的測試。

```elixir
# test/controllers/todo_controller_test.exs
defmodule TodoApp.TodoControllerTest do
  # ...

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  # ...

  test "lists all entries on index", %{conn: conn} do
    conn = get conn, todo_path(conn, :index)
    assert json_response(conn, 200)["data"] == []
  end

  # ...
end
```

假設 `index` action 被我修改成下面這個樣子：

```elixir
# web/controllers/todo_controller.ex
defmodule TodoApp.TodoController
  # ...

  plug :put_current_user

  # ...

  def index(conn, _params) do
    todos = conn |> not_deleted_todos |> Repo.all
    render(conn, "index.json-api", data: todos)
  end

  # ...

  defp not_deleted_todos
    %{assigns: %{current_user: user}} = conn
    # 這一句的作用在篩選屬於目前登入的 user
    # 並且沒有被 soft-deleted 的 todos
    Todo |> Todo.owned_by(user.id) |> Todo.not_deleted
  end

  # 1. 這個 plug 會把登入的 user 從 session 裡抽出來
  #    透過 assigns 放到 conn 裡
  # 2. 如果沒有登入會回傳 401 然後終止這一次的 request
  defp put_current_user(conn, _opts) do
    current_user = get_session(conn, :current_user)

    case current_user do
      %{id: _} ->
        assign(conn, :current_user, current_user)
      _ ->
        conn
        |> put_status(401)
        |> render(TodoApp.AuthView, "show.json-api", data: %{status: :unauthorized})
        |> halt
    end
  end
end
```

好，現在問題來了。如果直接執行 `mix test`，會 test failed，因為沒有模擬使用者登入，當然會 fail。

在修改測試之前，先有一個概念，**`assigns` 裡面存放的值，一定是從 server-side 放進去的，除非伺服器端放行，否則 client-side 完全無法修改**。有了這個前提，我們就可以在 controller 裡插入一些看似無關痛癢的程式碼，事實上卻可以協助我們完成測試。

```elixir
# web/controllers/todo_controller.ex
defmodule TodoApp.TodoController do
  # ...

  # 如果 pattern match 到 assigns 中已經有 current_user，代表這個 request
  # 從測試的沙盒中發出的 request，因此不再從 session 中取得 current_user，
  # 直接 pass conn 給 action
  defp put_current_user(%{assigns: %{current_user: _}} = conn, _opts) do
    conn
  end

  # ...
end
```

透過這個方法，我們就可以在測試的 `setup` 中神不知鬼不覺地塞入 `current_user`，並且可以在之後的 `show`、`update` 中也使用這個 `current_user`。

```elixir
# test/controllers/todo_controller_test.ex
defmodule TodoApp.TodoControllerTest do
  # ...

  setup %{conn: conn} do
    # User 是另外一個 model，與本文的重點關聯關係不大就省略細節了
    # 會帶 provider 與 uid 的欄位是為了實作 OAuth
    user = %User{provider: "google", uid: "1a2b3c4d", email: Faker.Internet.email}
           |> User.changeset
           |> Repo.insert!

    conn = conn
           |> assign(:current_user, user) # 關鍵在這行，神不知鬼不覺地指派進去
           |> put_req_header("accept", "application/json")

    # 把 user 代進 conn，稍後其他的 test case 也可以使用
    {:ok, conn: conn, user: user}
  end

  # ...

  test "shows chosen resource", %{conn: conn, user: user} do
    # 從 context 中取出 user 來建立假資料
    todo = Repo.insert! %Todo{user_id: user.id}
    conn = get conn, todo_path(conn, :show, todo)

    expected = %{ "title" => todo.title, "done" => todo.done }
    assert json_response(conn, 200)["data"]["id"] == Integer.to_string(todo.id, 10)
    assert json_response(conn, 200)["data"]["attributes"] == expected
  end

  # ...

  test "updates and renders chosen resource when data is valid", %{conn: conn, user: user} do
    # 從 context 中取出 user 來建立假資料
    todo = Repo.insert! %Todo{user_id: user.id}

    conn = put conn, todo_path(conn, :update, todo), todo: @valid_attrs
    assert json_response(conn, 200)["data"]["id"]
    assert Repo.get_by(Todo, @valid_attrs)
  end

  test "does not update chosen resource and renders errors when data is invalid", %{conn: conn, user: user} do
    # 從 context 中取出 user 來建立假資料
    todo = Repo.insert! %Todo{user_id: user.id}

    conn = put conn, todo_path(conn, :update, todo), todo: @invalid_attrs
    assert json_response(conn, 422)["errors"] != %{}
  end

  # ...
end
```

這次再下一次 `mix test`，test case 應該就會全過了。

如果以上 code 片段寫得不完整 (對不起嘛 QQ)，我把完整的專案程式碼公布在 [GitHub](https://github.com/henry40408/singleton/tree/ff8b0a10693d2be63f1b15eb0888099b69e86446) 上了。

[^1]: [How To: Test controllers with Rails 3 and 4 (and RSpec)](https://github.com/plataformatec/devise/wiki/How-To:-Test-controllers-with-Rails-3-and-4-(and-RSpec))

[^2]: 這件事情我還沒有找到相關的前輩有發表相關的文章，只是我透過相關的搜尋結果旁敲側擊而來，具體可以參考 [José Valim 在 StackOverflow 討論串 how can i set session in setup when i test phoenix action which need user_id in session? 中的發言](http://stackoverflow.com/q/31983077#comment51895692_31983168)，但我覺得沒有把為什麼不推薦這樣做的具體原因說清楚。

[^3]: 其實如果你真的要做還是有方法可以做到，只是 code 會變得非常醜非常難以維護，如果有興趣可以參考 [how can i set session in setup when i test phoenix action which need user_id in session?](http://stackoverflow.com/a/31983168)。
