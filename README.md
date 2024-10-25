# react-continuos-scroll

Lightweight and easy to use react hook for infinite scroll

## Installation

```bash
  npm i react-continous-scroll
```

## Warning

This library uses the **Intersection Observer API** and may not be supported in older browsers. Please check browser compatibility before using this library. 

For more information on the Intersection Observer API and its browser support, visit [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

## Usage

```javascript
import React from "react";
import { useInfiniteScroll } from "react-continous-scroll";

function App() {
  const items = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
    { id: 5, name: "Item 5" },
  ];

  const [loadMore, setLoadMore] = React.useState(true);

  function onLoadMore(): Promise<{ id: number, name: string }[]> {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          {
            id: 6,
            name: "Item 6",
          },
          {
            id: 7,
            name: "Item 7",
          },
        ]);
        setLoadMore(false);
      }, 1000)
    );
  }

  const { data, loadMoreRef, loading } = useInfiniteScroll({
    initialData: items,
    loadMore: loadMore,
    onLoadMore: onLoadMore,
  });

  return (
    <div>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <div ref={loadMoreRef}>{loading && <p>Loading...</p>}</div>
    </div>
  );
}
```

Check more [examples](https://github.com/sebas-sala/infinite-scroll-react/blob/master/examples/)

#### Props

| Parameter              | Type          | Description                                                                                                                                    |
| :--------------------- | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `loadMore`             | `boolean`     | **Required**. Controls whether more data should be loaded.                                                                                     |
| `onLoadMore`           | `Promise<[]>` | **Required**. A function that returns a promise resolving to an array                                                                          |
| `idKey`                | `string`      | **Optional**. A unique key used to identify objects in the list. It is used to filter out duplicate items in the list.                         |
| `initialData`          | `array`       | **Optional**. Initial data to be displayed in the list before more data is loaded.                                                             |
| `initialPage`          | `number`      | **Optional**. The initial page from which to start loading data. The default value is 1                                                        |
| `fallbackData`         | `Array`       | **Optional**. Data to be used as a fallback if loading more data fails or if the maximum number of attempts is reached.                        |
| `threshold`            | `number`      | **Optional**. The percentage of the loading component's visibility in the viewport required to trigger loading more data. Default is 0.5 (50%) |
| `maxAttempts`          | `number`      | **Optional**. The maximum number of attempts allowed to load more data before considering it a failure. The default value is 3                 |
| `onMaxAttemptsReached` | `() => void`  | **Optional**. A function that is invoked when the maximum number of attempts to load more data is reached.                                     |
