---
title: React Native Navigator 求生紀實
date: 2016-08-12 10:14
slug: react-native-navigator
tags: react-native navigator
layout: post
---

在跟 React Native 搏鬥近兩個月後，navigation 還是在我不經意的情況下爆炸了。

## route decoupling

這個問題出在我把 navigator 這個屬於 component 範疇的 object 傳給 redux action，導致 decoupling 不完全；另外一個問題是我違反了 component pattern，階層較低的 component 不該有機會能夠直接參考到階層較高的 component。例如以下的 code。

{% raw %}
```jsx
const FooScene = () => (
  <View />
);

// ...

class BazComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handlePress = this.handlePress.bind(this);
  }

  handlePress() {
    const { navigator } = this.props;
    navigator.push({ component: FooScene });
  }

  render() {
    return (
      <TouchHighlight onPress={this.handlePress}>
        <View>
          <Text>{'Press me'}</Text>
        </View>
      </TouchHighlight>
    );
  }
}

// ...

const BarScene = ({ navigator }) => (
  <BazComponent navigator={navigator} />
);

// ...

class App extends React.Component {
  constructor(props) {
    super(props);
    this.renderScene = this.renderScene.bind(this);
  }

  renderScene(route, navigator) {
    return (<route.component {...this.props} navigator={navigator} route={route} />);
  }

  render() {
    return (<Navigator initialRoute={{ component: BarScene }} renderScene={this.renderScene} />);
  }
}
```
{% endraw %}

如果是照著 React Native 官網一步一步使用 Navigator，那個 `renderScene` 內的程式碼看起來會很古怪，但這個寫法是來自 [React Native Navigator — Navigating Like A Pro in React Native](https://medium.com/@dabit3/react-native-navigator-navigating-like-a-pro-in-react-native-3cb1b6dc1e30)。**這樣寫的好處是你不必再另外撰寫路由表**，因為目標 scene component 直接放在 route 裡，`renderScene` 要做的只剩下對 component 注入 `navigator`、`route`，最多在有使用 redux 的情形下再多注入 redux 的 state 與 actions。

但事後證明，**千萬別這樣做**，因為 component pattern 被破壞了，**所以你可能在不知不覺的情況下做了 circular import 而不自知**。

在 Python，如果有遵守 PEP8 規範，一旦發生 circular import 很快地就會被發現。但在 JavaScript，circular import 是被允許的。

```javascript
const a = { };
const b = { };
a.b = b;
b.a = a;
```

以最上面的程式碼為例，如果 `BazComponent` 是一個可重用的 component，而你之後又在 `FooScene` 中使用了該 component，就會發生交互參考的問題。而如果你把 `FooScene` 與 `BarScene` 放在不同檔案，然後在 `FooScene` 中設定跳轉至 `BarScene` 的 handler，就會發生 circular import。就我遇的的情形而言，React Native 的 webpack 會試著解析 circular import，**但如果解析不成功也不會發生錯誤，而是直接讓 import 進來的 object 直接變成 undefined**。

**所以最後的解法還是老方法，寫路由表**。如果要跳轉至某個 scene component 請傳遞路由表的 key 給 navigator，而不是直接把 scene component 傳進 route，以避免掉 circular import 的問題。

## 深入解析 `popToRoute`

`Navigator` 有一個 API `popToRoute`，目的是根據接收到的 route 物件跳轉到特定的 scene component。[而根據 React Native 原始碼](https://github.com/facebook/react-native/blob/94666f16c7da37e649316d40ea23d7a8054a04f9/Libraries/CustomComponents/Navigator/Navigator.js#L337)，從 `initialRoute` 應該要是一個 object，推斷 `Navigator` 的 route 應該都要是一個 object。但如果你照著以下程式碼的方式去使用，結果幾乎可以肯定是不會動的，而且還會噴錯。

假設路由表長這個樣子。

```javascript
const FOO_SCENE = 'FOO_SCENE';

const routes = {
  [{ name: FOO_SCENE }]: (<FooScene />),
};
```

然後呼叫 `popToRoute`。

```javascript
navigator.popToRoute({ name: FOO_SCENE });
```

十之八九會噴類似 `Calling pop to route for a route that doesn't exist` 的錯誤。

問題出在 `popToRoute` 是[以 `indexOf` 去比對路由表](https://github.com/facebook/react-native/blob/94666f16c7da37e649316d40ea23d7a8054a04f9/Libraries/CustomComponents/Navigator/Navigator.js#L1182-L1190)，而這裡有一個 JavaScript 的陷阱，以下是一個使用 Node.js 就可做的小實驗。

```javascript
const FOO_SCENE = 'FOO_SCENE';
const routeStack = [{ name: FOO_SCENE }];
routeStack.indexOf({ name: FOO_SCENE }); // expected 0, got -1 actually
```

最後的 `indexOf` 並沒有如預期般傳回 `0`，而是 `-1`。這也就是為什麼導致 `popToRoute` 爆炸的原因。另外再做一個實驗。

```javascript
const FOO_SCENE = 'FOO_SCENE';
const routeStack = [{ name: FOO_SCENE }];
({ name: FOO_SCENE }) === routeStack[0]; // => false
```

在 JavaScript，**使用 object literal 產生的永遠是另外一個新物件**。所以你拿這個新物件去比對一個已經存在的物件，永遠不會「全相等」。

所以如果要正確使用 `popToRoute`，我們目前只能這麼做。

```javascript
const routeStack = navigator.state.routeStack;
const targetRoute = routeStack.filter(r => r.name === FOO_SCENE);
if (targetRoute.length > 0) {
  navigator.popToRoute(targetRoute[0]);
}
```

從 `Navigator` 的 `routeStack` (保存目前已經走過的路徑，可以類比成瀏覽器的歷史紀錄 `history`) 取出目標 route 之後，當作參數傳遞給 `popToRoute`，就可以避免掉 `indexOf` 新舊物件比對永遠不一致的問題。
