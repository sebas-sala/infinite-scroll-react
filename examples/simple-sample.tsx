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

  function onLoadMore(): Promise<{ id: number; name: string }[]> {
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
