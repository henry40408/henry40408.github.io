---
title: 完善 GitHub Flow 最後一哩路 — Probot
date: '2017-12-21T14:23:08.549Z'
categories: []
keywords: []
---

Hahow 的工程團隊現在有十個工程師，每個人都有自己的成長背景（工程師成長之路）、信仰的價值（架構優於效率、文件優於慣例 ⋯ 等等）、coding style（Hahow 自己就發生過兩次「分號」防衛戰），如果沒有一套一致的慣例遵循，只要 PR 一 merge 勢必要大戰個三天三夜。

說到規範，不外乎兩個層面： _程式面_ 與 _流程面_ 。程式面我們現在交給 ESLint 負責，前端套 [Airbnb 的 rule-set](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb)、後端則是根據 [Standard 擴展的 Hahow rule-set](https://github.com/hahow/eslint-config-hahow)。

流程面的部分，又可以再細分為兩個層面：一個是*團隊成員在平台上的協作規範*；一個是*審核 PR 時的流程*。關於前者，我們目前是以某種比例混用 Git + GitHub Flow；後者 _原則上_ 沒有什麼太大的問題，但由於 _實作上_ 牽涉到 GitHub 的介面，讓我們在遵照流程審核 PR 時，顛簸感如影隨形。

例如 Hahow 有一條被嚴格遵守的規定：

> 第 87 條：審核 PR 者，應在完成審核後，指定（assign）PR 之作者，並將自己從 Assignees 移除。 -《Hahow 工程團隊工作章程・PR 編》

之所以會有這樣的規定，是因為 Hahow 非常地仰賴 Zenhub 來管理工作進度。將 review 完成的 PR 指定回去給發 PR 的人，除了方便 product owner（Hahow 有執行精簡版的 Scrum）從 Zenhub 上檢視 feature 或 bug 是否已經送出 PR，也方便 PR 的作者透過 GitHub 的通知機制得知自己的 PR 已經審核完成。

**問題就出在 GitHub 那個 Assignees 下拉選單**。

### GitHub 的 Assignees 下拉選單

- 有用過 GitHub Assignees 下拉選單的同學應該有注意到，**這個下拉選單在有人與沒有人被指定時的選項不一樣**。如果這個 PR/issue 還沒有成員被指定，介面上就會列出所有成員供使用者選擇；但如果已經有成員被指定，**第一個選項就會是 Clear assignees**！假設已經好幾個人被指定給該 PR，一旦點到 Clear assignees，所有已被指定的成員就會被移除掉。雖然看 issue/PR 的活動紀錄可以一個一個找回來，但這麼一來一回就浪費了不少時間。
- PR 的 review comment 送出之後，GitHub 會重導向回 PR/issue 的頁面。由於重導向的 URL 帶有 anchor，所以網頁會自動跳到 review comment 的位置。但由於 Assignees 不會懸浮在網頁上，所以使用者就要捲動到最上面才能點開 Assignees 選單指定成員。**假設上一個審核者留下了快 60 則的 comment，那下一個審核者就要往上滑動 60 則以上的留言才能點到 Assignees**。

此時，一個小小的願望在每個工程團隊成員的心中萌芽：

> 要是有一個機制，能夠讓我送出審核完 PR 之後，就自動把我從 Assignees 拿掉，然後指定送出 PR 的成員，那該有多好？

然後 Probot 就在此時闖入了我們的生活。

### 什麼是 Probot？

{% asset_img 0*sNAZgn2pnGIlUFRy.png Probot Logo，是不是很可愛呢？真的很可愛呢 %}

> GitHub Apps to automate and improve your workflow.
>
> \- [Probot](https://probot.github.io/)

可以把它想像成是一個隨時監控來自 GitHub 的風吹草動，然後執行對應行為的 Slack bot。如果有寫過 Hubot 的經驗，可以把 Probot 想像成是只對 GitHub 上發生的事件有反應的 Hubot，開發 Probot 時會發現甚至連訂閱事件的 function 都長得幾乎一模一樣。

### Probot 能為我做什麼？

我們可以把上面遇到的問題與願望分解成幾個動作：

1.  我點下綠色按鈕之後
2.  就 _自動_ 把 PR 指定給送出 PR 的人
3.  我此時就可以離開 GitHub 了

以上提到有關 _自動_ 的步驟，就是可以交給 Probot 代勞的工作。不過在繼續解釋 Probot 之前，要先介紹一個稱為 _GitHub Webhook_ 的概念。

#### GitHub Webhooks

> Webhooks allow you to build or set up GitHub Apps which subscribe to certain events on GitHub.com. When one of those events is triggered, we’ll send a HTTP POST payload to the webhook’s configured URL.
>
> \- [GitHub Webhooks](https://developer.github.com/webhooks/)

GitHub 上發生特定事件、或使用者執行特定行為時，GitHub 就會主動對某段 URL 發出 HTTP POST 請求，而這個概念正是 Probot 得以運作的核心原理。根據 [GitHub 的文件](https://developer.github.com/webhooks/#events)，會透過 Webhook 送出通知的事件，幾乎囊括了使用者或第三方應用程式（e.g. CircleCI）在 GitHub 上的所有行為，諸如 [送出或更新 PR](https://developer.github.com/v3/activity/events/types/#pullrequestevent)、[透過](https://developer.github.com/v3/activity/events/types/#pushevent) `git push` [更新程式碼](https://developer.github.com/v3/activity/events/types/#pushevent) 等。

Probot 並不會主動監視發生在 GitHub 上的活動， **而是當特定的活動發生時，由 GitHub 透過 Webhook 發出通知** 。GitHub 最多只會知道這個通知是否成功，以及另外一頭傳回來的 response body；至於 Webhook 另外一頭的應用程式做了什麼事情，GitHub 管不到也不會管。總而言之，**就是 GitHub 下達了一個口令，Webhook 另外一頭的應用程式才會有動作** 。

Probot 透過 Webhook 接收到訂閱的事件後，就會執行某些 _動作_，這些動作通常是透過 GitHub API 回到 GitHub 上執行某些操作，例如 [針對某 issue 或 PR 新增成員](https://developer.github.com/v3/issues/assignees/#add-assignees-to-an-issue) 或是 [更新某 PR 的 status](https://developer.github.com/v3/repos/statuses/#create-a-status)。常見的例子就是 CI 由於測試沒有通過所以禁止 PR 被 merge。當然 Probot 的行為也不限於 GitHub 上的操作，我們也可以在接收到訂閱的事件之後，對其他管道送出通知，或在其他平台上執行操作。諸如 GitHub 上有新的 Release，在 Slack 發通知給非工程團隊的同事；或是 [Terraform](https://www.terraform.io/) 的 PR 被 merge，就更新 GCP 上的基礎建設等。

### Probot 做不到什麼事？

到目前為止，**Probot 僅能夠訂閱來自 GitHub 的事件**，其他支援 Webhook 的 Git 託管服務，諸如 Bitbucket 或 GitLab 則暫時還沒有被支援，不過 Probot 也沒有限制開發者在 GitHub 以外的平台上執行其他工作。

### Talk is Cheap, Show Me the Code

以下內容擷取自 [jiminycricket/pr-review-submit-unassign](https://github.com/jiminycricket/pr-review-submit-unassign/blob/master/index.js)，客倌如果賞臉的話請不吝給個星：

```javascript
// https://github.com/jiminycricket/pr-review-submit-unassign/blob/5b3bf2e64c6417919d53c4966f50d5c8bb97e91e/index.js

const defaultConfig = require('./lib/defaultConfig')

module.exports = robot => {
  robot.on('pull_request_review.submitted', assignAfterReviewSubmitted)
}

async function assignAfterReviewSubmitted(context) {
  const { github } = context
  const userConfig = await context.config('pr_review_submit_unassign.yml')
  const config = Object.assign({}, defaultConfig, userConfig)

  const { pull_request, review } = context.payload
  const pullRequestOwner = pull_request.user.login
  const reviwer = review.user.login

  // NOTE not assign pull request owner if review is submitted by owner
  if (pullRequestOwner === reviwer) {
    return
  }

  let comment = ''

  if (config.unassignReviewer) {
    const params = context.issue({ body: { assignees: [reviwer] } })
    await github.issues.removeAssigneesFromIssue(params)
    comment += config.unassignTemplate.replace('{reviwer}', reviwer)
  }

  if (config.assignPullRequestOwner) {
    const params = context.issue({ assignees: [pullRequestOwner] })
    await github.issues.addAssigneesToIssue(params)

    if (config.unassignReviewer) {
      comment += ', '
    }

    comment += config.assignTemplate.replace(
      '{pullRequestOwner}',
      pullRequestOwner
    )
  }

  if (config.leaveComment) {
    const commentParams = context.issue({ body: comment })
    await github.issues.createComment(commentParams)
  }
}

module.exports.assignAfterReviewSubmitted = assignAfterReviewSubmitted
```

好的，雖然說 show me the code，不過一下子吞下這麼多 code 還是會拉肚子，以下我們一段接著一段地來看。喔對，Probot **最低要求 Node 8.x 以上**，其實 7.6.0 以上即可，主要是需要 async/await 的內建支援，只是我自己的習慣是盡可能地使用 LTS。客倌可能會想先檢查一下自己的環境支不支援上述版本，或是直接申請一個 [Heroku](https://www.heroku.com/) 或 [Glitch](https://glitch.com/) 帳號。

### Show Me the Code  分解動作

Probot 可以分成以下幾個階段：

1.  訂閱特定的 GitHub 事件
2.  接收到事件發生的通知之後，從 GitHub Webhook 的 request body （以下簡稱 payload）抽取感興趣的資訊出來分析
3.  以條件判定的結果或是 payload 的資訊重新包裝成 GitHub API 支援的格式，再透過 GitHub API 送出 request

以下我們根據上面這個架構，逐步分解上述的 code。

### 訂閱特定的 GitHub  事件

```javascript
// https://github.com/jiminycricket/pr-review-submit-unassign/blob/5b3bf2e64c6417919d53c4966f50d5c8bb97e91e/index.js#L3-L5

module.exports = robot => {
  robot.on('pull_request_review.submitted', assignAfterReviewSubmitted)
}
```

以上程式碼在設定 Probot 該訂閱哪些 GitHub 事件。

`robot` 是 Probot 的實體，我自己開發到現在還沒有用過 `robot.on` 以外的成員，所以暫且略過不提。 `robot.on` 的第一個參數是符合 Probot 要求格式的 GitHub event，第二個參數則是這個 event 的 callback，常接觸 Node.js EventEmitter 或 Hubot 的開發者對這樣的形式應該不陌生。

那段 `pull_request_review.submitted` 要從 GitHub 文件中組合出來需要一點小技巧。首先我們前往 GitHub 文件，找到 [PullRequestReviewEvent 的說明](https://developer.github.com/v3/activity/events/types/#pullrequestreviewevent)，底下的表格有一行與 action 有關的說明，後面會補充這個欄位可能是哪些值。以 PullRequestReviewEvent 為例，action 可能是 `submitted`、`edited`或 `dismissed`。配合下面提到的 Webhook event name，得到以下組合：

1.  `pull_request_review.submitted`
2.  `pull_request_review.edited`
3.  `pull_request_review.dismissed`

我們就得到了三個符合 Probot 要求格式的 GitHub event。

當然 GitHub event 可以重複綁定，以 [henry40408/assign-in-comment](https://github.com/henry40408/assign-in-comment/blob/master/index.js) 為例，就有重複綁定 GitHub event：

```javascript
// https://github.com/henry40408/assign-in-comment/blob/master/index.js#L3-L5

module.exports = robot => {
  robot.on('pull_request.opened', context => assignInComment(robot, context))
  robot.on('pull_request.edited', context => assignInComment(robot, context))
}
```

綁定事件之後，我們就可以像守株待兔那樣守 event 待 payload，然後在 GitHub 發來 payload 時進行下一步。

### 分析 Payload

```javascript
// https://github.com/jiminycricket/pr-review-submit-unassign/blob/5b3bf2e64c6417919d53c4966f50d5c8bb97e91e/index.js#L8-L19

const { github } = context
const userConfig = await context.config('pr_review_submit_unassign.yml')
const config = Object.assign({}, defaultConfig, userConfig)

const { pull_request, review } = context.payload
const pullRequestOwner = pull_request.user.login
const reviwer = review.user.login

// NOTE not assign pull request owner if review is submitted by owner
if (pullRequestOwner === reviwer) {
  return
}
```

前面提到 `robot.on` 第二個參數是一個 callback function，這個 callback 會接收一個參數 `context`，裡面基本上包含了所有我們需要的資訊，與一個已經打包好的 GitHub API client `context.github`。透過 `context`，我們可以拿到所有從 payload 分析出來的資訊。當然要自己分解也是可以，畢竟 payload 本身是一個 JSON，但既然 Probot 已經分解好了我們就可以直接用了。

中間有一段在設定 config 變數，是因為 Probot 允許不同的 GitHub repository 有不同的設定，然後再由 Probot 透過 `context.config` 讀取進來。 [Jimmy Tien](https://medium.com/u/1e68a6835c6e) 在開發 pr-review-submit-unassign 時有留下使用者自行設定 Probot 行為的彈性，不過 Hahow 在使用上都是直接使用預設值。

Payload 的結構基本上都可以從 GitHub 文件上找到，例如 PullRequestReviewEvent 的 [Webhook payload example](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-24)。

最後是一個條件判斷。GitHub 允許 PR author review 自己的 PR，只是不能 approve（如果可以的話就天下大亂了，每個人都可以 approve 自己的 PR，如果這不是災難什麼才是災難），所以如果送出 PR review comment 的是 PR 作者本人，就直接跳出什麼都不做。

### 針對 Payload 的分析結果執行特定動作

```javascript
// https://github.com/jiminycricket/pr-review-submit-unassign/blob/5b3bf2e64c6417919d53c4966f50d5c8bb97e91e/index.js#L21-L46

let comment = ''

if (config.unassignReviewer) {
  const params = context.issue({ body: { assignees: [reviwer] } })
  await github.issues.removeAssigneesFromIssue(params)
  comment += config.unassignTemplate.replace('{reviwer}', reviwer)
}

if (config.assignPullRequestOwner) {
  const params = context.issue({ assignees: [pullRequestOwner] })
  await github.issues.addAssigneesToIssue(params)

  if (config.unassignReviewer) {
    comment += ', '
  }

  comment += config.assignTemplate.replace(
    '{pullRequestOwner}',
    pullRequestOwner
  )
}

if (config.leaveComment) {
  const commentParams = context.issue({ body: comment })
  await github.issues.createComment(commentParams)
}
```

接下來就是根據 payload 的分析結果執行特定動作。這裡有好幾個 if (`config.xxx`) 的判斷式，但都只是根據使用者的設定決定要不要執行特定動作而已，Hahow 目前也都是直接採用預設值。我們把重點放在 if 判斷式的 statement body：

```javascript
// 第一段
const params = context.issue({ body: { assignees: [reviwer] } })
await github.issues.removeAssigneesFromIssue(params)

// 第二段
const params = context.issue({ assignees: [pullRequestOwner] })
await github.issues.addAssigneesToIssue(params)

// 第三段
const commentParams = context.issue({ body: comment })
await github.issues.createComment(commentParams)
```

這是一段呼叫 GitHub API 的程式碼。注意我們這裡把 `context.issue` 當作 function 呼叫，然後把從 payload 分析出來的 reviewer 當作參數塞進去。這裡的意思是複製一份 `context.issue`，並取代其中 assignees 的值。在 Probot 呼叫 GitHub API 的過程中，有很大部分的情況都需要從 payload 抽出已知的參數，做為 GitHub API 的參數使用。所以 Probot 就引入了這個方便的功能，避免我們的 Probot 充滿重複的 wet code（不符合 DRY 原則的 code）。

之所以會用 _引入_ 這個詞，是因為 Probot 的 GitHub API client 並不是自己開發的，而是引入另外一套超級好用的 GitHub API wrapper，稱為 [node-github](https://github.com/octokit/node-github)。而 node-github 又是移植自 Ruby 生態系知名的 [octokit.rb](https://github.com/octokit/octokit.rb)，已經歷過 Ruby 工程師的嚴苛考驗，算是我自己心目中最好用的 GitHub API wrapper。事實上 `context.github` 就是一個 node-github 的實體，所以 `context.github` 有關的用法都可以在 [node-github](https://octokit.github.io/node-github/) 的文件上找到。

### Probot 的模組化架構

Probot 的模組化架構很類似 Hubot，全部分拆開來都可以獨立運作，但也可以找一個空的 Probot 把一個或一個以上的 Probot 組合在一起，而這些可以獨立運作又可以分工合作的單位稱為 _Probot app_。我們可以來看看節錄自 Probot 文件上 [Combining apps](https://probot.github.io/docs/deployment/#combining-apps) 的例子：

```javascript
{
  "name": "my-probot",
  "private": true,
  "dependencies": {
    "probot-autoresponder": "probot/autoresponder",
    "probot-settings": "probot/settings"
  },
  "scripts": {
    "start": "probot run"
 },
 "probot": {
   "apps": [
     "probot-autoresponder",
     "probot-settings"
   ]
 }
}
```

首先是 `dependencies`，引入了兩個 Node.js module，這兩個 module 其實同時也是 Probot app。最後在下面的 `probot.apps` 將 module name 列舉出來，Probot 在執行的時候就會自動地載入這些 Probot app。

### 其他關於 Probot  的事

Probot 還有很多其他已經包好的功能，例如 [Logging](https://probot.github.io/docs/logging/)、[Pagination](https://probot.github.io/docs/pagination/)，甚至直接整合 [localtunnel](https://github.com/localtunnel/localtunnel)，方便開發者開發。

### Hahow 目前正在使用的 Probot app

都是 Hahow 同事自己開發的，客倌賞臉的話請不吝給個星：

#### [jiminycricket/pr-review-submit-unassign](https://github.com/jiminycricket/pr-review-submit-unassign)

審核者送出 review comment 之後自動指定 PR 作者，並移除審核者（如果審核者當下有被指定的話）。

#### [henry40408/assign-in-comment](https://github.com/henry40408/assign-in-comment)

以 `/assign @user1 @user2` 的語法直接從 PR description assign 成員。

#### [amowu/probot-conventional-release](https://github.com/amowu/probot-conventional-release)

Merge pull request 進特定 branch 時自動在 GitHub 新增一筆 release，並依據 [Conventional Commits](https://conventionalcommits.org/) 的規則產生 changelog。

Probot 的官網也有列出 [其他人貢獻的 Probot app](https://probot.github.io/apps/)。

### 結語

之所以會發現 Probot，是因為同事 [Jimmy Tien](https://medium.com/u/1e68a6835c6e) 覺得每次都要去點 Assignees 選單很麻煩，所以想要自幹一個 Heroku app 來幫 Hahow 的工程師做這件事。就在 Heroku app 版本快要寫完時，我找到 Probot。同事一試之下驚為天人，不管花在 Heroku app 上的時間放水流了，直接用 Probot 重寫一次。

由於 Hahow 的工程師人數已經擴張到開始會有溝通成本與同步障礙的規模，在不進行科層化的前提下，我們盡可能地將可以自動化的工作全部自動化，以降低人為錯誤，以及人工發現人為錯誤之後，還要花費時間心力去通知犯錯的人更正的成本。以我自己的經驗來看，通常後者會是工程團隊開始降低溝通頻率與拒絕溝通的一大因素，這對於一個外部因素與內部限制都不斷在變動的新創團隊來說都不是一件好事。

Probot 在 Hahow 的工作不會止步於此，之後還有更多正在規劃中的、與 GitHub 有關的 Probot app 問世。如果沒有牽涉到 Hahow 的業務核心，基本上都會開源出來，請各位客倌拭目以待。也期望這一篇文章，能夠幫助與 Hahow 類似的新創公司，以自動化的方式逐步地改善開發流程。

#### 關於標題

呼應標題，為什麼會說是 _完善 GitHub Flow 最後一哩路_ 呢？最後一哩路 (_Last mile_) 術語來自電信領域，根據 Wikipedia 上的介紹：

> The last mile or last kilometer is a colloquial phrase widely used in the telecommunications, cable television and internet industries to refer to the final leg of the telecommunications networks that deliver telecommunication services to retail end-users (customers).
> \- [Wikipedia](https://en.wikipedia.org/wiki/Last_mile)

GitHub Flow 上的最後一哩路，我認為是開發者（可以類比成 _end-users_）透過 git 與 GitHub（類似 _telecommunications networks_ 的地位）互動的過程。除了 git 已經有 hub 與其他一卡車亂七八糟的工具，例如 [tig](https://github.com/jonas/tig)、[gitsome](https://github.com/donnemartin/gitsome)、[git-extra](https://github.com/tj/git-extras) 輔助，GitHub 這邊幾乎沒有任何工具支援。當然 Chrome extension 可以解決部分的問題，但比起直接在 GitHub organization 層級安裝 Probot 強迫整個團隊遵守，要說服個別工程師在自己的 Chrome 安裝額外的擴充套件是一件非常麻煩的事情。引入 Probot，從 API 的層級直接攔截、處理掉與 GitHub Flow 有關的流程，既能夠迭代，又能夠組合，我們覺得才是一件 once and for all 的解決方案。

至於從人的流程面去解決，以我的經驗來說看看就好，不要依賴甚至崇拜。沒有自動化工具輔助、監督整個流程，早晚會被一點一滴累積起來的僥倖與偷懶毀於一旦。
