import * as React from "react";
import { faker } from "@faker-js/faker";
import { useInfiniteScroll } from "react-continous-scroll";

function App() {
  const [page, setPage] = React.useState(1);

  function onLoadMore(): Promise<
    { id: string; name: string; email: string; avatar: string }[]
  > {
    return new Promise((resolve) => {
      setPage((prev) => prev + 1);
      resolve(
        Array.from({ length: 10 }).map(() => {
          return {
            id: faker.string.uuid(),
            name: faker.person.firstName(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
          };
        })
      );
    });
  }

  const { data, loadMoreRef, loading, error } = useInfiniteScroll({
    loadMore: page < 10,
    onLoadMore,
    idKey: "id",
    timeout: 1000,
    onMaxAttemptsReached: () => {
      console.log("Max attempts reached");
    },
  });

  return (
    <main className="container mx-auto">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {data.map((item) => (
          <li
            key={item.id}
            className="flex flex-col items-center border shadow-sm p-4 rounded-lg mb-4 overflow-hidden"
          >
            <img
              src={item.avatar}
              alt={item.name}
              className="w-12 h-12 rounded-full"
            />
            <h2 className="text-lg font-bold truncate">{item.name}</h2>
            <p className="text-sm text-gray-500 truncate">{item.email}</p>
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} className="text-center mt-4">
        {loading ? "Loading..." : "No more data"}
      </div>
      {error && (
        <div className="text-center mt-4 text-red-500">{error.message}</div>
      )}
    </main>
  );
}

export default App;
