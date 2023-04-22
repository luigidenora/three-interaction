export class EventsQueue {
   private _items: Event[] = [];

   public enqueue(event: Event): void {
      if (event.type === "pointermove") {
         for (let i = this._items.length - 1; i >= 0; i--) {
            const type = this._items[i].type;
            if (type === "pointermove") {
               this._items[i] = event;
               return;
            }
            if (type === "pointercancel" || type === "pointerdown" || type === "pointerout" || type === "pointerover" || type === "pointerup") break;
         }
      }
      this._items.push(event);
   }

   public dequeue(): Event[] {
      const items = this._items;
      this._items = [];
      return items;
   }
}
