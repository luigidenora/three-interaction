export declare class PointerEventsQueue {
    private _items;
    enqueue(event: Event): void;
    dequeue(): Event[];
}
