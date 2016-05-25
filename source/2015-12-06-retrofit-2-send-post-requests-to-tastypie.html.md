---
title: Retrofit 2 對 Tastypie 發出 POST 請求時的地雷
date: 2015/12/06
slug: retrofit-2-send-post-requests-to-tastypie
tags: android, retrofit, tastypie, rest, client, api, django
layout: article
---

最近從 [碼天狗](http://weekly.codetengu.com/issues/18#start) 得知[Retrofit 推出了第二版](http://inthecheesefactory.com/blog/retrofit-2.0/en)，號稱 **Android 上最知名的 REST client** ，我寫 Android 起碼也有半年了，居然都沒聽過這一套 library，自覺應該趁現在來好好地研究一下。

之前沒有自己寫 API 與 Android app 串在一起的經驗，自然也就沒有機會去 survey REST client。但由於 Parse 真的是太難用了，所以專案 deadline 已經火燒屁股的情況下，我決定挑戰底線自己去寫一套 REST API 出來給 app 串接。

Retrofit 的概念很簡單，基本上就是類比 database v.s. ORM 的關係， **將 REST API 對應成 Java 的函數來呼叫** 。

這次的地雷是一顆詭雷，我解了快一個下午才解開。

## 環境假設

1. 今天以 Django + Tastypie 架設了一台 REST API server ，網址是 `http://api.example.com`。
2. 這台 server 提供一個 API endpoint `/api/v1/article` ，對這個 API 發出 `POST` 請求即可新增文章。由於詭雷埋設的地點在 `POST` 請求，其他 `GET` 類型的請求就在此不予討論。
3. `POST` 請求的 Content-Type 是 JSON，格式如下： `{"title": "文章標題", "body": "文章內文"}`。
4. API endpoint 嚴格遵守 HTTP status code 的 SPEC。如果新增成功會傳回 `201 CREATED`。

## 程式碼

為了迅速表達我的意思，這裡寫的是 Android 架構的 pseudo code，會省略 `import` 之類的語句，因為 Android Studio 的自動完成已經做得很方便了，就不再另外提示。另外由於被同事嚴重洗腦，沒有 import Rx code 就寫不下去，因此還引入了 [RxJava](https://github.com/ReactiveX/RxJava) 來簡化程式碼。如果要在 Android 裡使用 Rx，建議一併裝上 [RxAndroid](https://github.com/ReactiveX/RxAndroid)。

這裡有一篇強國 Android 高手寫的 [給 Android 開發者的 RxJava 詳解](http://gank.io/post/560e15be2dca930e00da1083)，內容紮實，我在 Android 上的 RxJava 入門就看這一篇，強力推薦。

```java
// @file src/Article.java
// ...
public class Article {
    @SerializedName("id") public int id;
    @SerializedName("title") public String title;
    @SerializedName("body") public String body;
}
// ...
```

```java
// @file src/ArticleAPI.java
// ...
public interface ArticleAPI {
    // ...
    @GET("api/v1/article")
    Observable<Article> sendArticle(@Header("Authorization") String authorization, @Body Article article);
    // ...
}
// ...
```

```java

// @file src/ExampleService.java
// ...
public class ExampleService {
    // ...
    // 第一個地雷
    final String BASEURL = "http://api.example.com";
    private final Retrofit mRetrofit;
    private final ArticleAPI mArticleApi;
    // ...
    public ExampleService(Context context) {
        // ...
        mRetrofit = new Retrofit.Builder()
            .baseUrl(BASEURL)
            // 第二個地雷 開始
            .addConverterFactory(GsonConverterFactory.create())
            .addCallAdapterFactory(RxJavaCallAdapterFactory.create())
            // 第二個地雷 結束
            .build();
        mArticleApi = mRetrofit.create(ArticleAPI.class);
        // ...
    }
    // ...
    public Observable<Article> sendArticle(User user, String title, String body) {
        // 備註一
        String credential = getCredential(user);

        Article article = new Article();
        article.title = title;
        article.body = body;

        return mArticleApi.sendArticle(credential, body)
            .observeOn(AndroidSchedulers.mainThread())
            .subscribeOn(Schedulers.io());
    }
    // ...
}
// ...
```

## 解釋

1. 第一顆地雷： [Retrofit 2 發佈公告](http://inthecheesefactory.com/blog/retrofit-2.0/en) 的**New URL resolving concept. The same way as &lt;a href&gt;** 章節提到，建議 **Base URL 最後一定要加上斜線** ， **`@GET` 、 `@POST` 等 annotation 的 URL 前面不要加上斜線** 。這是有公告的地雷。
2. 第二顆地雷：Retrofit 第一版跟第二版其中一個最大的差異在於很多與第一版綁定的 library 在第二版都被拆開來了。也就是說如果你要使用第一版的 *內建功能* ，有可能需要自己再另外加到 `build.gradle` 中。至於有哪些 library 被抽離出來了，根據發佈公告 `GsonConverterFactory` 跟 `RxJavaCallAdapterFactory` 都需要另外加到 `build.gradle` 中。

偏偏 [Retrofit 官方網站](http://square.github.io/retrofit/) 又什麼文件都沒有，library 的強大跟官網的懶散真的是形成強烈的對比。

## 第三顆地雷 (詭雷)

不用回去找了，我故意沒在程式碼裡標記出來，目的在展示這個地雷有多麼地無聲無息。

因為嚴格來說這顆地雷不是 Retrofit 埋的，只是它在 debug 的時候也沒有提供開發者任何相關訊息，一切就這樣無聲無息地...**爆炸了**。如果你有使用 cURL 、[httpie](https://github.com/jkbrzt/httpie) 或 [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop)
除錯過 Tastypie，就會發現如果 API endpoint 的最後如果沒有加上斜線，Tastypie 就會吐 `301 MOVE PERMANENTLY` 回來。

> 關鍵就在這個 `301 MOVE PERMANENTLY`。
>
> 因為 Retrofit 沒有去處理這個 301 狀態碼，可能是默默地、乖乖地就轉址了然後沒把參數帶過去，最後變成對該 API endpoint 發出 `GET` 請求。

## 解法

很簡單，把斜線加上去就可以了。而且之後請養成習慣，最後都要把斜線加上去。如果原本就是打 `GET` 請求的加上這個斜線不會有什麼影響，但 `POST` 沒有加上這個重要的斜線就會發生預期之外的事。

```java
// @file src/ArticleAPI.java
// ...
public interface ArticleAPI {
  // ...
  @GET("api/v1/article/") // 原來是 @GET("api/v1/article") ，差一條斜線
  Observable<Article> sendArticle(@Header("Authorization") String authorization, @Body Article article);
  // ...
}
// ...
```

一個小斜線，浪費了我一個下午。
