import { useInfiniteScroll } from "../src/use-infinite-scroll";
import { renderHook, act, waitFor } from "@testing-library/react";

describe("useInfineScroll", () => {
	const fetchMoreMock = jest.fn();

	beforeAll(() => {
		global.IntersectionObserver = class {
			constructor(
				callback: IntersectionObserverCallback,
				options?: IntersectionObserverInit,
			) {
				this.callback = callback;
				this.root = options?.root instanceof Element ? options.root : null;
				this.rootMargin = options?.rootMargin || "0px";
				this.thresholds = Array.isArray(options?.threshold)
					? options.threshold
					: [options?.threshold || 0];
			}
			callback: IntersectionObserverCallback;
			root: Element | null;
			rootMargin: string;
			thresholds: number[];
			observe() {
				this.callback(
					[
						{
							isIntersecting: true,
							target: document.createElement("div"),
							intersectionRatio: 1,
							time: Date.now(),
							boundingClientRect: {} as DOMRectReadOnly,
							intersectionRect: {} as DOMRectReadOnly,
							rootBounds: null,
						},
					],
					this,
				);
			}
			unobserve() {
				// Simula la desobservación
			}
			disconnect() {
				// Simula la desconexión
			}
			takeRecords() {
				return [];
			}
		};
	});

	beforeEach(() => {
		fetchMoreMock.mockClear();
	});

	it("should initialize with the correct initial data", () => {
		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [{ id: "1", name: "Item 1" }],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 3,
			}),
		);

		rerender();

		expect(result.current.data).toEqual([{ id: "1", name: "Item 1" }]);
		expect(result.current.page).toBe(1);
	});

	it('should remove duplicates when "idKey" is provided', () => {
		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				idKey: "id",
				initialData: [
					{ id: "1", name: "Item 1" },
					{ id: "1", name: "Item 1" },
				],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 3,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		waitFor(() =>
			expect(result.current.data).toEqual([{ id: "1", name: "Item 1" }]),
		);
	});

	it('should not remove duplicates when "idKey" is not provided', () => {
		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [
					{ id: "1", name: "Item 1" },
					{ id: "1", name: "Item 1" },
				],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 3,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		waitFor(() =>
			expect(result.current.data).toEqual([
				{ id: "1", name: "Item 1" },
				{ id: "1", name: "Item 1" },
			]),
		);
	});

	it("should fetch more data when the threshold is reached", async () => {
		fetchMoreMock.mockResolvedValueOnce({
			data: [{ id: "2", name: "Item 2" }],
		});

		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 3,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		waitFor(() => {
			expect(fetchMoreMock).toHaveBeenCalled();
			expect(result.current.data).toEqual([{ id: "2", name: "Item 2" }]);
			expect(result.current.page).toBe(2);
		});
	});

	it("should handle max attempts and fallback data", async () => {
		fetchMoreMock.mockRejectedValueOnce(new Error("Failed to fetch"));

		const onMaxAttemptsReached = jest.fn();

		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [{ id: "1", name: "Item 1" }],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [{ id: "fallback", name: "Fallback Item" }],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 1,
				onMaxAttemptsReached,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		await waitFor(() => {
			expect(fetchMoreMock).toHaveBeenCalled();
			expect(onMaxAttemptsReached).toHaveBeenCalled();
			expect(result.current.data).toEqual([
				{ id: "1", name: "Item 1" },
				{ id: "fallback", name: "Fallback Item" },
			]);
		});
	});

	it("should not fetch more data when there is no next page", async () => {
		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [{ id: "1", name: "Item 1" }],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: false,
				threshold: 0.5,
				maxAttempts: 3,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		await waitFor(() => {
			expect(fetchMoreMock).not.toHaveBeenCalled();
		});
	});

	it("should not fetch more data when loading", async () => {
		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 3,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		await waitFor(() => {
			expect(fetchMoreMock).toHaveBeenCalledTimes(1);
		});
	});

	it("should not fetch more data when max attempts are reached", async () => {
		fetchMoreMock.mockRejectedValueOnce(new Error("Failed to fetch"));

		const { result, rerender } = renderHook(() =>
			useInfiniteScroll({
				initialData: [],
				initialPage: 1,
				fetchMore: fetchMoreMock,
				fallbackData: [],
				hasNextPage: true,
				threshold: 0.5,
				maxAttempts: 1,
			}),
		);

		act(() => {
			result.current.loadMoreRef.current = document.createElement("div");
		});

		rerender();

		await waitFor(() => {
			expect(fetchMoreMock).toHaveBeenCalled();
			expect(result.current.data).toEqual([]);
			console.log(result.current.error);
			expect(result.current.error).toBeInstanceOf(Error);
		});
	});
});
